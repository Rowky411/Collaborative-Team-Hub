import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/api"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasAccessToken = Boolean(req.cookies.get("access_token"));
  const hasRefreshToken = Boolean(req.cookies.get("refresh_token"));
  const isAuthed = hasAccessToken || hasRefreshToken;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isAuthed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthed && isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/workspaces";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
