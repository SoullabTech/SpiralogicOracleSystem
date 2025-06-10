// 🔄 Protocol Suggestion API Route - Claude Integration
// Returns next-step reflective protocols based on user state

import { NextRequest, NextResponse } from 'next/server';
import { claudeProtocolSuggestion } from '@/lib/airCommunicator';

interface ProtocolRequest {
  currentState: string;
  userContext: {
    id: string;
    element: string;
    agent_name: string;
    agent_archetype: string;
    recent_interactions?: string[];
    focus_areas?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ProtocolRequest = await request.json();
    
    if (!body.currentState || !body.userContext) {
      return NextResponse.json(
        { error: 'Current state and user context are required' },
        { status: 400 }
      );
    }

    // Use Claude to suggest protocols
    const suggestion = await claudeProtocolSuggestion(body.currentState, body.userContext);
    
    return NextResponse.json({
      suggested_protocols: suggestion.suggested_protocols,
      rationale: suggestion.content,
      timeframe: 'next_24_hours',
      difficulty_level: 'moderate',
      confidence: suggestion.confidence,
      focus_areas: suggestion.suggested_protocols?.slice(0, 3) || []
    });

  } catch (error) {
    console.error('Protocol suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest protocols' },
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