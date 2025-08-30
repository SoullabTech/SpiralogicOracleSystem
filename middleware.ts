import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createBypassingPreventionMiddleware,
  defaultBypassingPreventionConfig,
} from "./middleware/bypassingPrevention";

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
  "/beta",
];

// Public paths that should never be protected
const PUBLIC_PATHS = [
  "/auth/signin",
  "/auth/callback", 
  "/auth/onboarding",
  "/api/voice/sesame", // Keep voice route callable
  "/api/health",
  "/api/debug", // For debugging endpoints
  "/not-found",
  "/loading",
  "/error",
  "/",
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

  // Check if it's a protected route (but not a public path)
  const isPublicPath = PUBLIC_PATHS.some((publicPath) =>
    path === publicPath || path.startsWith(publicPath)
  );
  const isProtectedRoute = !isPublicPath && protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isMonitoredApi = monitoredApiRoutes.some((route) =>
    path.startsWith(route),
  );

  // For protected routes, check authentication
  if (isProtectedRoute) {
    const token = request.cookies.get("supabase-auth-token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Handle onboarding skip behavior (only for development)
    if (process.env.SKIP_ONBOARDING === 'true' && process.env.NODE_ENV === 'development') {
      // Force redirect to Oracle for testing, unless already there
      if (path !== '/oracle' && !path.startsWith('/oracle/')) {
        return NextResponse.redirect(new URL("/oracle", request.url));
      }
      return NextResponse.next();
    }

    // Beta test: Simplified onboarding check
    // For now, check if the onboarding cookie exists
    const onboardingCookie = request.cookies.get('onboarding-completed');
    const onboardingCompleted = onboardingCookie?.value === 'true';
    
    // Redirect to onboarding if not completed and not already there
    if (!onboardingCompleted && !path.startsWith('/auth/onboarding')) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }
  }

  // Apply bypassing prevention middleware to monitored routes
  if (
    isMonitoredApi ||
    path.startsWith("/elemental") ||
    path.startsWith("/oracle")
  ) {
    return await bypassingPrevention(request);
  }

  // Allow static files and other routes
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
     * - api/auth (authentication endpoints should not be blocked)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
