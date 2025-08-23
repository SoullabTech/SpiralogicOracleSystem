import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const onboarded = req.cookies.get("onboarded")?.value === "1";
  const isLoggedIn = req.cookies.get("auth")?.value === "1";

  // Admin route protection
  if (url.pathname.startsWith('/admin')) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // If not authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', url.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check admin privileges
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
    const isAdmin = adminEmails.includes(user.email || "");
    
    if (!isAdmin) {
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }
  }

  // API rate limiting for admin endpoints
  if (url.pathname.startsWith('/api/admin')) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(",") || [];
    const isAdmin = adminEmails.includes(user.email || "");
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Add admin action logging header
    const response = NextResponse.next();
    response.headers.set('X-Admin-User', user.email || 'unknown');
    response.headers.set('X-Admin-Action', url.pathname);
    return response;
  }

  // Original protection logic
  const protectedPaths = ["/oracle", "/journal", "/checkin", "/astro", "/actions"];
  const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p));

  if (isProtected && (!isLoggedIn || !onboarded)) {
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/oracle/:path*", 
    "/journal/:path*", 
    "/checkin/:path*", 
    "/astro/:path*", 
    "/actions/:path*",
    "/admin/:path*",
    "/api/admin/:path*"
  ],
};