import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "~/utils/auth";

export const config = {
  matcher: [
    /*
     * Exclude from checking:
     * - API routes (for auth API)
     * - Static files (including favicons, images, etc.)
     * - Authentication routes
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Middleware] Checking auth for path: ${pathname}`);

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    console.log("[Middleware] No auth token found, redirecting to login");
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  try {
    const payload = await verifyToken(token);

    if (!payload) {
      console.log("[Middleware] Invalid auth token, redirecting to login");
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    console.log(`[Middleware] Auth successful for user: ${payload.email}`);

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Auth error:", error);

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
}
