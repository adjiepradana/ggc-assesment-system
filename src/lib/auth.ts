import "@/lib/env";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

// Revalidation interval for active user & token_version check (default 5 minutes in milliseconds)
const USER_REVALIDATION_INTERVAL_MS =
  (parseInt(process.env.AUTH_TOKEN_REVALIDATION_SECONDS || "", 10) || 5 * 60) *
  1000;

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Pure helper exported for unit testing JWT session revocation logic (F-10).
 * Returns true if the user record is missing, deactivated, or has a newer token_version.
 */
export function isTokenVersionRevoked(
  token: { token_version?: number; is_revoked?: boolean; isInvalid?: boolean; isActive?: boolean },
  dbUser: { is_active: boolean; token_version: number } | null | undefined
): boolean {
  if (token.is_revoked || token.isInvalid || token.isActive === false) {
    return true;
  }
  if (!dbUser || dbUser.is_active === false) {
    return true;
  }
  const tokenVer = token.token_version ?? 0;
  return dbUser.token_version !== tokenVer;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Mohon masukkan email dan kata sandi.");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        const clientIp = getClientIp(req as any);

        // Brute-Force Rate Limiting (F-04, F-09): max 5 per email and 10 per IP per 15 minutes
        const [emailLimit, ipLimit] = await Promise.all([
          consumeRateLimit(
            `login:email:${normalizedEmail}`,
            5,
            LOGIN_RATE_LIMIT_WINDOW_MS
          ),
          consumeRateLimit(
            `login:ip:${clientIp}`,
            10,
            LOGIN_RATE_LIMIT_WINDOW_MS
          ),
        ]);

        if (!emailLimit.allowed || !ipLimit.allowed) {
          throw new Error(
            "Terlalu banyak percobaan masuk yang gagal. Silakan tunggu 15 menit sebelum mencoba kembali."
          );
        }

        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
          include: {
            profile: true,
          },
        });

        // SECURITY (Phase 2.5): Constant-time check mitigation against email enumeration / timing attacks
        const dummyHash =
          "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUU1234567890";
        const passwordHashToCompare = user?.password_hash || dummyHash;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          passwordHashToCompare
        );

        // Generic error if user doesn't exist or password mismatch
        if (!user || !user.password_hash || !isValidPassword) {
          throw new Error("Email atau kata sandi tidak cocok.");
        }

        // Only verified credentials can see specific deactivation status
        if (user.is_active === false) {
          throw new Error(
            "Akses akun telah dicabut atau dinonaktifkan oleh administrator."
          );
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.profile?.full_name || user.email.split("@")[0],
          isActive: user.is_active,
          token_version: user.token_version ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();

      // 1. Initial sign-in: populate initial token data including token_version (F-10)
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.email = user.email;
        token.name = user.name;
        token.isActive = user.isActive ?? true;
        token.token_version = user.token_version ?? 0;
        token.is_revoked = false;
        token.isInvalid = false;
        token.lastValidated = now;
        delete token.error;
        return token;
      }

      // 2. If token is already marked revoked or invalid, reject immediately
      if (
        token.is_revoked ||
        token.isInvalid ||
        token.isActive === false ||
        !token.id
      ) {
        return {
          ...token,
          is_revoked: true,
          isInvalid: true,
          isActive: false,
          error: "UserDeactivatedOrDeleted",
        };
      }

      // 3. Periodic Database Revalidation (check is_active & token_version every 5 minutes)
      const lastValidated = (token.lastValidated as number) || 0;
      const isDueForCheck =
        now - lastValidated >= USER_REVALIDATION_INTERVAL_MS;

      if (isDueForCheck) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              role: true,
              is_active: true,
              token_version: true,
              profile: {
                select: { full_name: true },
              },
            },
          });

          // If user record no longer exists, account was deactivated, or token_version incremented:
          if (isTokenVersionRevoked(token, dbUser)) {
            console.warn(
              `🔒 [NextAuth F-10] Revoking JWT session for ${
                token.email || token.id
              }: ` +
                `${
                  !dbUser
                    ? "Record deleted"
                    : !dbUser.is_active
                    ? "Account deactivated"
                    : `token_version mismatch (token=${token.token_version}, db=${dbUser.token_version})`
                }.`
            );

            return {
              ...token,
              is_revoked: true,
              isInvalid: true,
              isActive: false,
              error: "UserDeactivatedOrDeleted",
            };
          }

          // User is active and token_version matches: synchronize latest state
          token.role = dbUser!.role as Role;
          token.email = dbUser!.email;
          if (dbUser!.profile?.full_name) {
            token.name = dbUser!.profile.full_name;
          }
          token.token_version = dbUser!.token_version;
          token.isActive = true;
          token.is_revoked = false;
          token.isInvalid = false;
          token.lastValidated = now;
          delete token.error;
        } catch (dbError) {
          console.error(
            "⚠️ [NextAuth Phase 2.5] Periodic DB revalidation failed:",
            dbError
          );
        }
      }

      return token;
    },

    async session({ session, token }) {
      // If token is revoked, invalid, or user was deactivated, invalidate the session
      if (
        !token ||
        token.is_revoked ||
        token.isInvalid ||
        token.isActive === false ||
        !token.id
      ) {
        return {
          ...session,
          user: null as any,
          error: "UserDeactivatedOrDeleted",
        };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (token.email) {
          session.user.email = token.email;
        }
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
