/**
 * 🌟 Maya Oracle API Route - Simplified to prevent build errors
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, sessionId } = await request.json();
    
    // Redirect to personal route which is working
    return NextResponse.json({
      message: "Maya route is temporarily redirected to personal route",
      redirect: "/api/oracle/personal"
    });
    
  } catch (error) {
    console.error('Maya route error:', error);
    return NextResponse.json(
      { error: 'Maya route unavailable' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Maya route available but redirects to personal route',
    redirect: "/api/oracle/personal"
  });
}