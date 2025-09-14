// API endpoint for logging client-side errors
import { NextRequest, NextResponse } from 'next/server';
import { logServerError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stack, context, metadata, url, userAgent } = body;

    // Log the client error using our server logger
    await logServerError(
      new Error(message),
      `CLIENT: ${context}`,
      {
        ...metadata,
        url,
        userAgent,
        clientSide: true
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log client error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}