import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require staff authentication
const STAFF_PROTECTED_ROUTES = ["/dashboard/counselor", "/admin"];

// Routes restricted by role
const ROLE_ROUTES: Record<string, string[]> = {
  "/dashboard/counselor": ["counselor"],
  "/admin": ["admin"],
};

// Routes only for staff guests
const STAFF_GUEST_ONLY_ROUTES = ["/staff/login", "/staff/register", "/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from cookie (set during login)
  const token = request.cookies.get("healin_staff_token")?.value;
  const role = request.cookies.get("healin_role")?.value;

  const isStaffAuthenticated = Boolean(token);

  if (
    isStaffAuthenticated &&
    STAFF_GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    const dashboardPath =
      role === "admin"
        ? "/admin"
        : role === "counselor"
        ? "/dashboard/counselor"
        : "/staff/login";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Anonymous-user routes are public.
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/anonymous") ||
    pathname.startsWith("/dashboard/user") ||
    pathname.startsWith("/chat")
  ) {
    return NextResponse.next();
  }

  const isProtected = STAFF_PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isRoleProtected = Object.keys(ROLE_ROUTES).some((r) =>
    pathname.startsWith(r)
  );

  if ((isProtected || isRoleProtected) && !isStaffAuthenticated) {
    const loginUrl = new URL(
      pathname.startsWith("/admin") ? "/admin/login" : "/staff/login",
      request.url
    );
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  if (isStaffAuthenticated && role) {
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
