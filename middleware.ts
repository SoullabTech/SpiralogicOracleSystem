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

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
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

    // Skip onboarding check if env flag is set (for testing)
    if (process.env.SKIP_ONBOARDING === 'true') {
      return NextResponse.next();
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
