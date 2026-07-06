import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Edge-safe config: no Prisma adapter, no bcrypt, no providers with DB access.
// Imported by proxy.ts (which runs on the Edge runtime) and merged into the
// full config in auth.ts (which runs in Node and can talk to the database).
//
// jwt/session live here (not just in auth.ts) because the middleware builds
// its own separate NextAuth(authConfig) instance — without these callbacks
// here too, that instance falls back to NextAuth's default session shaping,
// which does NOT forward custom claims like `role` onto `auth.user`. That
// silently broke role-based route gating at the edge: `auth.user.role` was
// always undefined in middleware even though the full session correctly had it.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CLIENT" | "ADMIN" | "BARBER";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const isAdminRoute = nextUrl.pathname.startsWith("/dashboard");
      const isPortalRoute = nextUrl.pathname.startsWith("/portal");
      const isAppointmentsRoute = nextUrl.pathname.startsWith("/appointments");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      function redirectToLogin(callbackPath: string) {
        const url = new URL("/login", nextUrl);
        url.searchParams.set("callbackUrl", callbackPath);
        return NextResponse.redirect(url);
      }

      if (isAdminRoute) {
        if (!isLoggedIn) return redirectToLogin(nextUrl.pathname);
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", nextUrl));
        }
      }

      if (isPortalRoute) {
        if (!isLoggedIn) return redirectToLogin(nextUrl.pathname);
        if (role !== "BARBER") {
          return NextResponse.redirect(new URL("/", nextUrl));
        }
      }

      if (isAppointmentsRoute && !isLoggedIn) {
        return redirectToLogin(nextUrl.pathname);
      }

      if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/book", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
