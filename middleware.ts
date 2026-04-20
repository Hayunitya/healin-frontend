import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (any role)
const PROTECTED_ROUTES = ["/dashboard", "/chat", "/session"];

// Routes restricted by role
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/user": ["user"],
  "/dashboard/counselor": ["counselor"],
  "/admin": ["admin"],
};

// Routes only for guests (redirect to dashboard if already logged in)
const GUEST_ONLY_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set during login)
  const token = request.cookies.get("healin_token")?.value;
  const role = request.cookies.get("healin_role")?.value;

  const isAuthenticated = Boolean(token);

  // Redirect authenticated users away from guest-only pages
  if (isAuthenticated && GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    const dashboardPath =
      role === "admin"
        ? "/admin"
        : role === "counselor"
        ? "/dashboard/counselor"
        : "/dashboard/user";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Redirect unauthenticated users away from protected pages
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isRoleProtected = Object.keys(ROLE_ROUTES).some((r) =>
    pathname.startsWith(r)
  );

  if ((isProtected || isRoleProtected) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (isAuthenticated && role) {
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};