/**
 * Next.js middleware — gates the authenticated app routes.
 *
 * For simplicity we look for a Better-Auth session cookie; full session
 * validation happens in the route handlers via `requireUser()`.
 */
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/editor", "/wizard", "/projects", "/credits", "/account"];

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const hasSession = SESSION_COOKIE_NAMES.some((n) => req.cookies.get(n));
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/wizard/:path*", "/projects/:path*", "/credits/:path*", "/account/:path*"],
};
