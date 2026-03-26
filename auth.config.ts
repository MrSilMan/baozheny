import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/validations/auth.schema";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize is handled in auth.ts to allow Prisma access
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;

      const isOnBuyer = pathname.startsWith("/buyer");
      const isOnAdmin = pathname.startsWith("/admin");
      const isOnAuth = ["/login", "/register", "/forgot-password"].some((p) =>
        pathname.startsWith(p)
      );

      if (isOnAdmin) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        if (role !== "ADMIN" && role !== "AGENT")
          return Response.redirect(new URL("/buyer/dashboard", nextUrl));
        return true;
      }

      if (isOnBuyer) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        return true;
      }

      if (isOnAuth && isLoggedIn) {
        const dest =
          role === "ADMIN" || role === "AGENT" ? "/admin/orders" : "/buyer/dashboard";
        return Response.redirect(new URL(dest, nextUrl));
      }

      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      if (account?.provider === "google") {
        token.emailVerified = new Date();
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
};
