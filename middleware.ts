import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const onboarded = req.cookies.get("onboarded")?.value === "1";
  const isLoggedIn = req.cookies.get("auth")?.value === "1";

  const protectedPaths = ["/oracle", "/journal", "/checkin", "/astro", "/actions"];
  const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p));

  if (isProtected && (!isLoggedIn || !onboarded)) {
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/oracle/:path*", "/journal/:path*", "/checkin/:path*", "/astro/:path*", "/actions/:path*"],
};