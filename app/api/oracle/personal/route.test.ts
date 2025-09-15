import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log("🔴 TEST API CALLED");

  try {
    const body = await request.json();
    console.log("🔴 TEST API BODY:", body);

    return NextResponse.json({
      text: "TEST RESPONSE - API IS WORKING",
      message: "TEST RESPONSE - API IS WORKING",
      content: "TEST RESPONSE - API IS WORKING",
      timestamp: Date.now(),
      metadata: {
        test: true,
        element: 'water'
      }
    });
  } catch (error: any) {
    console.error("🔴 TEST API ERROR:", error);
    return NextResponse.json({
      text: "TEST API ERROR: " + error.message,
      error: true
    });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'TEST API ROUTE WORKING',
    timestamp: Date.now()
  });
}