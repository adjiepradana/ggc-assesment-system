import "@/lib/env";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Revalidation interval for active user check (Phase 2.5: default 5 minutes in milliseconds)
const USER_REVALIDATION_INTERVAL_MS =
  (parseInt(process.env.AUTH_TOKEN_REVALIDATION_SECONDS || "", 10) || 5 * 60) * 1000;

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Mohon masukkan email dan kata sandi.");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
          include: {
            profile: true,
          },
        });

        // SECURITY (Phase 2.5): Constant-time check mitigation against email enumeration / timing attacks
        const dummyHash = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUU1234567890";
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
          throw new Error("Akses akun telah dicabut atau dinonaktifkan oleh administrator.");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.profile?.full_name || user.email.split("@")[0],
          isActive: user.is_active,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();

      // 1. Initial sign-in: populate initial token data
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.email = user.email;
        token.name = user.name;
        token.isActive = user.isActive ?? true;
        token.isInvalid = false;
        token.lastValidated = now;
        delete token.error;
        return token;
      }

      // 2. If token is already marked invalid, reject immediately
      if (token.isInvalid || token.isActive === false || !token.id) {
        return {
          ...token,
          isInvalid: true,
          isActive: false,
          error: "UserDeactivatedOrDeleted",
        };
      }

      // 3. Periodic Database Revalidation (Fase 2.5: check is_active & user existence every 5 minutes)
      const lastValidated = (token.lastValidated as number) || 0;
      const isDueForCheck = now - lastValidated >= USER_REVALIDATION_INTERVAL_MS;

      if (isDueForCheck) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              role: true,
              is_active: true,
              profile: {
                select: { full_name: true },
              },
            },
          });

          // If user record no longer exists or account was deactivated by admin:
          if (!dbUser || dbUser.is_active === false) {
            console.warn(
              `🔒 [NextAuth Phase 2.5] User ${token.email || token.id} is invalid: ` +
              `${!dbUser ? "Record deleted" : "Account deactivated (is_active: false)"}. Revoking JWT session.`
            );

            return {
              ...token,
              isInvalid: true,
              isActive: false,
              error: "UserDeactivatedOrDeleted",
            };
          }

          // User is active and valid: synchronize latest state and update validation timestamp
          token.role = dbUser.role as Role;
          token.email = dbUser.email;
          if (dbUser.profile?.full_name) {
            token.name = dbUser.profile.full_name;
          }
          token.isActive = true;
          token.isInvalid = false;
          token.lastValidated = now;
          delete token.error;
        } catch (dbError) {
          console.error("⚠️ [NextAuth Phase 2.5] Periodic DB revalidation failed:", dbError);
          // In case of transient database connection issue, do not log out legitimate users prematurely.
          // Keep existing valid token state, but do not update lastValidated so it retries on next request.
        }
      }

      return token;
    },

    async session({ session, token }) {
      // If token is invalid or user was deactivated, invalidate the session
      if (!token || token.isInvalid || token.isActive === false || !token.id) {
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
