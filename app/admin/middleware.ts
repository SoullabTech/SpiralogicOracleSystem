// Admin Gate - Lock /admin/* to owner(s) only
// Uses ADMIN_MODE and ADMIN_ALLOWED_EMAILS environment variables

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only apply to /admin/* routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check if admin mode is enabled
  const adminMode = process.env.ADMIN_MODE === 'true';
  if (!adminMode) {
    return new NextResponse('Admin mode disabled', { status: 404 });
  }

  try {
    // Get user from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse('Authentication required', { status: 401 });
    }

    // Check if user email is in allowed list
    const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS || '').split(',').map(email => email.trim());
    
    if (!allowedEmails.includes(user.email || '')) {
      return new NextResponse('Admin access forbidden', { status: 403 });
    }

    // User is authenticated and authorized
    return NextResponse.next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    return new NextResponse('Admin access error', { status: 500 });
  }
}

export const config = {
  matcher: ['/admin/:path*']
};