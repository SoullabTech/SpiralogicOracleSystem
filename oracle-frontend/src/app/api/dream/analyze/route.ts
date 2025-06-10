// 🌙 Dream Analysis API Route - Claude Integration
// Extracts symbols and provides insights from dream content

import { NextRequest, NextResponse } from 'next/server';
import { claudeDreamAnalysis } from '@/lib/airCommunicator';

interface DreamAnalysisRequest {
  dreamContent: string;
  userContext: {
    id: string;
    element: string;
    agent_name: string;
    agent_archetype: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: DreamAnalysisRequest = await request.json();
    
    if (!body.dreamContent || !body.userContext) {
      return NextResponse.json(
        { error: 'Dream content and user context are required' },
        { status: 400 }
      );
    }

    // Use Claude to analyze the dream
    const analysis = await claudeDreamAnalysis(body.dreamContent, body.userContext);
    
    return NextResponse.json({
      symbols_detected: analysis.symbols_detected,
      emotional_tone: analysis.emotional_tone,
      suggested_protocols: analysis.suggested_protocols,
      insights: analysis.content,
      confidence: analysis.confidence
    });

  } catch (error) {
    console.error('Dream analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze dream' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}