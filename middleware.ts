import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const teacherId = request.cookies.get("teacher_id")?.value;
  const { pathname } = request.nextUrl;

  // Define public/auth routes
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Define routes that should be protected (Dashboard and its sub-routes)
  // Since most routes are under (dashboard), we protect everything except auth and public assets
  const isProtectedRoute =
    !isAuthRoute &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico" &&
    pathname !== "/questions";

  if (isProtectedRoute && !teacherId) {
    // Redirect to login if trying to access a protected route without a session
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && teacherId) {
    // Redirect to dashboard if trying to access login/signup with an active session
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
