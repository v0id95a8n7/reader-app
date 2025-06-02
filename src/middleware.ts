import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  });

  if (!token) {
    console.log("[Middleware] No auth token found, redirecting to login");
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  console.log(`[Middleware] Auth successful for user: ${token.email}`);
  return NextResponse.next();
}
