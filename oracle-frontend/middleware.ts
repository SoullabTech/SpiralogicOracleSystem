// File: middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession();

    const protectedPaths = ['/profile', '/survey', '/dream', '/oracle', '/dashboard'];
    const authPaths = ['/signin', '/signup'];
    const pathname = req.nextUrl.pathname;
    
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

    // Redirect to signin if accessing protected route without session
    if (isProtected && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/signin';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if accessing auth routes with active session
    if (isAuthPath && session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware auth check failed:', error);
    // Allow request to continue on error
    return res;
  }
}

export const config = {
  matcher: [
    '/profile/:path*', 
    '/survey/:path*', 
    '/dream/:path*', 
    '/oracle/:path*',
    '/dashboard/:path*',
    '/signin',
    '/signup'
  ],
};
