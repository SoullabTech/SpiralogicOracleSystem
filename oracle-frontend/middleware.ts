// File: middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function middleware(req: NextRequest) {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const protectedPaths = ["/profile", "/survey", "/dream", "/oracle"];
  const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtected && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/signin";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/survey/:path*", "/dream/:path*", "/oracle/:path*"],
};
