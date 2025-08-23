import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId, query, limit = 6 } = await request.json();

    // Validate input
    if (!userId || !query) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // For now, return mock data - replace with actual Soul Memory implementation
    // when backend service is properly connected
    const mockResults = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: `soul-${Date.now()}-${i}`,
      text: `Soul memory result ${i + 1} for query: ${query}`,
      ts: Date.now() - i * 60000,
      meta: {
        relevance: 0.9 - i * 0.1,
        source: 'soul-memory'
      }
    }));

    return NextResponse.json({
      results: mockResults,
      query,
      userId
    });
  } catch (error) {
    console.error('Soul Memory search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}