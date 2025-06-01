import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '~/utils/auth';


const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  
  if (!token || !(await verifyToken(token))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  
  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 