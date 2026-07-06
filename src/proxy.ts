import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Deliberately built from the Edge-safe authConfig only (no Prisma import here) —
// this runs on the Edge runtime, which can't load Prisma's Node query engine.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/appointments/:path*",
    "/login",
    "/register",
  ],
};
