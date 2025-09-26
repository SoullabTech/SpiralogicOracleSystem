/**
 * Symbol Extraction API
 * Automatically extracts symbols, archetypes, emotions from text
 */

import { NextRequest, NextResponse } from 'next/server';
import { symbolExtractor } from '@/lib/intelligence/SymbolExtractionEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, userId, autoTrack = false } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = await symbolExtractor.extract(text, autoTrack ? userId : undefined);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Symbol extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Symbol Extraction API',
    endpoints: {
      'POST /api/intelligence/extract-symbols': 'Extract symbols from text',
      'POST /api/intelligence/extract-batch': 'Extract symbols from multiple texts'
    }
  });
}