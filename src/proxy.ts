import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 "proxy" (formerly middleware): first line of defence for protected pages.
// Every admin page and API route also re-checks the role on the server.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (!user) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
