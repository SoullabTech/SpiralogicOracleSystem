import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Legacy route redirects - DELETE or REDIRECT these legacy routes
  const legacyRoutes = {
    '/chat-with-guides': '/oracle/meet',
    '/multiple-oracle-options': '/oracle/meet',
    '/open-chat': '/oracle/meet',
    '/random-spiritual-advisor': '/oracle/meet',
    '/guides': '/dashboard/guides',
    '/oracle-chat': '/oracle/meet',
    '/oracle-modes': '/oracle/meet',
    '/spiritual-guidance': '/oracle/meet',
    '/ai-guides': '/oracle/meet',
    '/consciousness-chat': '/consciousness'
  };

  // Check if the current path is a legacy route
  if (legacyRoutes[url.pathname as keyof typeof legacyRoutes]) {
    const redirectTo = legacyRoutes[url.pathname as keyof typeof legacyRoutes];
    console.log(`🚫 Redirecting legacy route ${url.pathname} → ${redirectTo}`);
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Enforce streamlined user flow
  const protectedRoutes = [
    '/oracle/meet',
    '/dashboard',
    '/journal',
    '/astrology',
    '/consciousness'
  ];

  // Check if user is accessing protected routes
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    // In a real app, check authentication status here
    // For now, we'll allow all access but this is where you'd check:
    // const token = request.cookies.get('auth-token');
    // if (!token) {
    //   return NextResponse.redirect(new URL('/auth/signin', request.url));
    // }
  }

  // Redirect root consciousness route to main consciousness page
  if (url.pathname === '/consciousness/') {
    return NextResponse.redirect(new URL('/consciousness', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};