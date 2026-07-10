import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "Admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    pages: {
      signIn: "/?auth=login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token.role === "Admin";
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/settings",
    "/subscription",
    "/reports",
    "/analytics",
    "/admin",
  ],
};
