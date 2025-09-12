/**
 * 🌟 Sacred Oracle API - Simplified to prevent build errors
 * Redirects to the working personal route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Redirect to personal route which is working properly
    return NextResponse.json({
      message: "Oracle route redirects to personal route",
      redirect: "/api/oracle/personal",
      data: {
        message: "Please use /api/oracle/personal for Maya conversations",
        audio: 'web-speech-fallback',
        element: 'balanced',
        confidence: 1.0
      }
    });
    
  } catch (error) {
    console.error('Oracle route error:', error);
    return NextResponse.json(
      { error: 'Oracle route unavailable, use /api/oracle/personal' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Oracle route available but redirects to personal route',
    redirect: "/api/oracle/personal",
    message: "Use /api/oracle/personal for Maya conversations"
  });
}