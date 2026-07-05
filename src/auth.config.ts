import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Edge-safe config: no Prisma adapter, no bcrypt, no providers with DB access.
// Imported by proxy.ts (which runs on the Edge runtime) and merged into the
// full config in auth.ts (which runs in Node and can talk to the database).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isAdminRoute = nextUrl.pathname.startsWith("/dashboard");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isAdminRoute) {
        if (!isLoggedIn) {
          return NextResponse.redirect(new URL("/login", nextUrl));
        }
        if (role !== "ADMIN" && role !== "BARBER") {
          return NextResponse.redirect(new URL("/", nextUrl));
        }
      }

      if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/book", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
