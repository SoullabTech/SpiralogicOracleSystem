import { NextRequest, NextResponse } from 'next/server';
import { buildContextPack } from '@/lib/context/buildContext';

export async function POST(request: NextRequest) {
  try {
    const { text, userId, conversationId } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text parameter is required' },
        { status: 400 }
      );
    }

    const pack = await buildContextPack({ 
      userId: userId || 'anonymous', 
      text, 
      conversationId 
    });

    return NextResponse.json({
      ain: pack.ainSnippets?.length || 0,
      soul: pack.soulSnippets?.length || 0,
      facetKeys: Object.keys(pack.facetHints || {}).length,
      nlu: pack.nlu,
      psi: !!pack.psi,
      micropsi: pack.micropsi,
      debug: {
        ainSnippets: pack.ainSnippets?.slice(0, 3).map(s => ({ id: s.id, preview: s.text?.slice(0, 80) + '...' })),
        soulSnippets: pack.soulSnippets?.slice(0, 3).map(s => ({ id: s.id, preview: s.text?.slice(0, 80) + '...' })),
        topFacets: Object.entries(pack.facetHints || {})
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]: any) => ({ facet: k, score: v }))
      }
    });

  } catch (error) {
    console.error('Debug context endpoint error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : 'Context debug failed'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'debug/context',
    description: 'Debug endpoint for context pack analysis',
    methods: ['POST'],
    requiredParams: ['text'],
    optionalParams: ['userId', 'conversationId'],
    timestamp: new Date().toISOString()
  });
}