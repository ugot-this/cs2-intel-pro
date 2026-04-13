import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasAccess } from "@/lib/subscription";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request });

  // 1. Auth pages: redirect to /dashboard if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Admin routes: require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Authenticated API routes: return 401 JSON if not authenticated
  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/subscriptions") ||
    pathname.startsWith("/api/stripe/checkout") ||
    pathname.startsWith("/api/stripe/portal")
  ) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. Dashboard routes: require auth
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userPlan = (token.planSlug as string) ?? "free";

    // /dashboard/vip/* requires vip plan
    if (pathname.startsWith("/dashboard/vip")) {
      if (!hasAccess(userPlan, "vip")) {
        return NextResponse.redirect(new URL("/pricing?upgrade=vip", request.url));
      }
    }

    // /dashboard/pro/* requires pro or vip plan
    if (pathname.startsWith("/dashboard/pro")) {
      if (!hasAccess(userPlan, "pro")) {
        return NextResponse.redirect(new URL("/pricing?upgrade=pro", request.url));
      }
    }

    return NextResponse.next();
  }

  // 5. All other routes: pass through
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
