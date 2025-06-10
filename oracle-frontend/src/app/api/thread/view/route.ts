// 📈 Thread View API Route - Claude Integration
// Summarizes growth arc and themes over time

import { NextRequest, NextResponse } from 'next/server';
import { claudeGrowthSummary } from '@/lib/airCommunicator';

interface ThreadViewRequest {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  userContext: {
    id: string;
    element: string;
    agent_name: string;
    agent_archetype: string;
    interaction_history?: string[];
    milestone_events?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ThreadViewRequest = await request.json();
    
    if (!body.timeframe || !body.userContext) {
      return NextResponse.json(
        { error: 'Timeframe and user context are required' },
        { status: 400 }
      );
    }

    // Use Claude to summarize growth
    const summary = await claudeGrowthSummary(body.timeframe, body.userContext);
    
    return NextResponse.json({
      growth_summary: summary.content,
      key_themes: extractThemes(summary.content),
      progress_indicators: extractProgressIndicators(summary.content),
      suggested_focus: summary.suggested_protocols?.slice(0, 3) || [],
      timeframe: body.timeframe,
      confidence: summary.confidence
    });

  } catch (error) {
    console.error('Thread view error:', error);
    return NextResponse.json(
      { error: 'Failed to generate growth summary' },
      { status: 500 }
    );
  }
}

function extractThemes(content: string): string[] {
  // Simple theme extraction based on common patterns
  const themeKeywords = [
    'growth', 'development', 'awareness', 'integration', 'clarity',
    'balance', 'transformation', 'insight', 'understanding', 'progress'
  ];
  
  const lowerContent = content.toLowerCase();
  return themeKeywords.filter(theme => 
    lowerContent.includes(theme)
  ).slice(0, 5);
}

function extractProgressIndicators(content: string): string[] {
  // Extract progress-indicating phrases
  const progressPatterns = [
    /increased.*understanding/i,
    /developed.*awareness/i,
    /improved.*clarity/i,
    /strengthened.*connection/i,
    /expanded.*perspective/i
  ];
  
  const indicators: string[] = [];
  progressPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      indicators.push(matches[0]);
    }
  });
  
  return indicators.slice(0, 3);
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