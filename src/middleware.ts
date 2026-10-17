import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Strict Role-Based Access Control (RBAC)
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        // If logged in as student, redirect to student dashboard
        const redirectUrl = new URL(
          token?.role === "STUDENT" ? "/student/dashboard" : "/auth/login",
          req.url
        );
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (pathname.startsWith("/student")) {
      if (token?.role !== "STUDENT") {
        // If logged in as admin, redirect to admin dashboard
        const redirectUrl = new URL(
          token?.role === "ADMIN" ? "/admin/dashboard" : "/auth/login",
          req.url
        );
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Require authentication for all /student/* and /admin/* routes
        if (pathname.startsWith("/student") || pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"],
};
