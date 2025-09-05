import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';
import {
  createBypassingPreventionMiddleware,
  defaultBypassingPreventionConfig,
} from "./middleware/bypassingPrevention";

// JWT Secret for authentication
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'spiralogic-oracle-secret-key-change-in-production'
);

// Rate limiting store (in-memory for edge runtime)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
if (typeof globalThis !== 'undefined' && globalThis.setInterval) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

// Initialize bypassing prevention middleware with production config
const bypassingPrevention = createBypassingPreventionMiddleware({
  ...defaultBypassingPreventionConfig,
  enableRealTimeDetection: true,
  enableContentGating: true,
  enablePacingAlgorithms: true,
  enableReflectionGaps: true,
  enableCommunityAlerts: true,
});

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/elemental",
  "/integration",
  "/community",
  "/analytics",
  "/oracle",
  "/onboarding",
  "/beta",
];

// API routes that need bypassing prevention
const monitoredApiRoutes = [
  "/api/oracle",
  "/api/elemental",
  "/api/content",
  "/api/insights",
  "/api/integration",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static files
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/public') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (path.startsWith('/api/')) {
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${clientIp}:${path}`;
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = path.includes('/oracle/chat') ? 30 : 100; // Different limits for different endpoints

    const current = rateLimitStore.get(rateLimitKey);
    
    if (!current || current.resetTime < now) {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
    } else if (current.count >= maxRequests) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((current.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
        },
      });
    } else {
      current.count++;
    }
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isMonitoredApi = monitoredApiRoutes.some((route) =>
    path.startsWith(route),
  );

  // For protected routes, check authentication
  if (isProtectedRoute || isMonitoredApi) {
    // Check for JWT token in cookies or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('supabase-auth-token')?.value;

    if (!token) {
      // Redirect to onboarding if accessing protected route without auth
      if (!path.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', String(payload.userId || ''));
      requestHeaders.set('x-user-email', String(payload.email || ''));

      // Apply bypassing prevention middleware to monitored routes
      if (
        isMonitoredApi ||
        path.startsWith("/elemental") ||
        path.startsWith("/oracle")
      ) {
        return await bypassingPrevention(request);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('JWT verification failed:', error);
      
      // Clear invalid token
      const response = !path.startsWith('/api/') 
        ? NextResponse.redirect(new URL('/onboarding', request.url))
        : new NextResponse('Unauthorized', { status: 401 });
        
      response.cookies.delete('auth-token');
      response.cookies.delete('supabase-auth-token');
      return response;
    }
  }

  // Apply bypassing prevention middleware to monitored routes (non-authenticated)
  if (
    isMonitoredApi ||
    path.startsWith("/elemental") ||
    path.startsWith("/oracle")
  ) {
    return await bypassingPrevention(request);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  
  // CORS headers for API routes
  if (path.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (authentication endpoints should not be blocked)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
