import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    role: Role;
  }
}
