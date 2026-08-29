// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;
//   const session = await auth();

//   /* Boss login */
//   if (pathname === "/about/bosslogin") {
//     if (session?.user?.role === "admin") {
//       return NextResponse.redirect(new URL("/admin", req.url));
//     }

//     if (session) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }

//     return NextResponse.next();
//   }

//   /* Protect admin */
//   if (pathname.startsWith("/admin") && !session) {
//     return NextResponse.redirect(new URL("/signin", req.url));
//   }

//   /* Protect user */
//   if (pathname.startsWith("/user") && !session) {
//     return NextResponse.redirect(new URL("/signin", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/user/:path*"],
// };

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const session = await auth();

  /**
   * ===========================================
   * Boss Login
   * ===========================================
   */
  if (pathname === "/about/bosslogin") {
    if (session?.user?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (session) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  /**
   * ===========================================
   * Protect Admin
   * ===========================================
   */
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /**
   * ===========================================
   * Protect Customer Dashboard
   * ===========================================
   */
  if (pathname.startsWith("/user")) {
    if (!session) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    if (session.user.role !== "user") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  /**
   * ===========================================
   * Protect Academy Dashboard
   * ===========================================
   */
  if (pathname.startsWith("/academy/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/academy/login", req.url));
    }

    if (session.user.role !== "student") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/academy/dashboard/:path*"],
};
