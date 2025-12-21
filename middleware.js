import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await auth();

  /* Boss login */
  if (pathname === "/about/bosslogin") {
    if (session?.user?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (session) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  /* Protect admin */
  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  /* Protect user */
  if (pathname.startsWith("/user") && !session) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
