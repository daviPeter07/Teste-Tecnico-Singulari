import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_LOGIN_PATH,
  AUTH_REDIRECT_PATH,
  AUTH_REGISTER_PATH,
} from "@/modules/auth/types/auth.constants";

const AUTH_ROUTES = new Set([AUTH_LOGIN_PATH, AUTH_REGISTER_PATH]);
const PROTECTED_PREFIXES = ["/preferences"];

const isProtectedRoute = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );

  if (isProtectedRoute(pathname) && !hasSessionCookie) {
    return NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
  }

  if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL(AUTH_REDIRECT_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
