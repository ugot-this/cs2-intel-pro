import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * NextAuth v5 session cookie нэрүүд.
 * Proxy-д token decode хийхгүй — зөвхөн cookie байгаа эсэхийг шалгана.
 * Бүрэн auth verify нь requireAuth() / requireAdmin() -д хийгдэнэ.
 */
function hasSession(request: NextRequest): boolean {
  return !!(
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("next-auth.session-token") // fallback
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasSession(request);

  // 1. Auth pages — нэвтэрсэн бол dashboard руу
  if (pathname === "/login" || pathname === "/register") {
    if (loggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin routes — нэвтрээгүй бол login руу
  //    Role check нь requireAdmin() дотор хийгдэнэ
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!loggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 3. Authenticated API routes — cookie байхгүй бол 401
  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/subscriptions") ||
    pathname.startsWith("/api/stripe/checkout") ||
    pathname.startsWith("/api/stripe/portal") ||
    pathname.startsWith("/api/qpay/checkout") ||
    pathname.startsWith("/api/qpay/check")
  ) {
    if (!loggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. Dashboard routes — нэвтрээгүй бол login руу
  //    Plan-based гating нь page дотор хийгдэнэ
  if (pathname.startsWith("/dashboard")) {
    if (!loggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Бусад бүх route — нэвтрэх
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/users/:path*",
    "/api/subscriptions/:path*",
    "/api/stripe/checkout",
    "/api/stripe/portal",
    "/api/admin/:path*",
  ],
};
