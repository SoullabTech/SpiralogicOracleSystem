// API endpoint to fetch error logs for dashboard
import { NextRequest, NextResponse } from 'next/server';
import { getRecentErrors } from '@/lib/logger';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function GET(request: NextRequest) {
  try {
    // Check for admin auth later - for now allow access
    const limit = request.nextUrl.searchParams.get('limit') || '100';
    const errors = await getRecentErrors(parseInt(limit));

    return NextResponse.json({
      errors,
      count: errors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch error logs:', error);
    return NextResponse.json(
      { error: 'Failed to load error logs' },
      { status: 500 }
    );
  }
}