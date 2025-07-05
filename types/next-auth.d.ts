import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      club?: string;
      role?: string;
    };
  }
  interface User extends DefaultUser {
    club?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    club?: string;
    role?: string;
    sub?: string;
  }
}
