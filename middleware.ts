import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, Role } from "@/lib/constants";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  name: string;
  exp?: number;
}

function decodeJwtInEdge(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64URL decode in standard web standard Edge runtime
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload: DecodedToken = JSON.parse(jsonPayload);

    // Verify expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? decodeJwtInEdge(token) : null;

  // 1. Admin UI routes guard
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== Role.ADMIN) {
      // Forbidden: redirect customer to shop home
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }
  }

  // 2. Protected customer UI routes: /checkout, /orders, /account
  const protectedCustomerRoutes = ["/checkout", "/orders", "/account"];
  const isProtectedCustomerRoute = protectedCustomerRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedCustomerRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Admin API routes guard
  if (pathname.startsWith("/api/admin")) {
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    if (user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Access forbidden. Admin role required." },
        { status: 403 }
      );
    }
  }

  // 4. State-changing customer API routes protection
  const protectedApis = ["/api/orders", "/api/addresses", "/api/reviews", "/api/payments/verify"];
  const isProtectedApi = protectedApis.some(
    (api) => pathname === api || pathname.startsWith(`${api}/`)
  );

  if (isProtectedApi && request.method !== "GET") {
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/api/orders/:path*",
    "/api/addresses/:path*",
    "/api/reviews/:path*",
    "/api/payments/verify",
  ],
};
