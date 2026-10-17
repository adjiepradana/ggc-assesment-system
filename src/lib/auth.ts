import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

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

        if (!user || !user.password_hash) {
          throw new Error("Email atau kata sandi tidak cocok.");
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) {
          throw new Error("Email atau kata sandi tidak cocok.");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.profile?.full_name || user.email.split("@")[0],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
