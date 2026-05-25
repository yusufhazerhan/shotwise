/**
 * Next.js middleware - sends legacy account-backed routes back to local Studio.
 *
 * The open-source product defaults to `/studio`, so direct visits to the old
 * account-backed app should not surface a login wall.
 */
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/editor", "/projects", "/credits", "/account"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/studio";
  url.searchParams.delete("next");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/projects/:path*", "/credits/:path*", "/account/:path*"],
};
