import { NextRequest, NextResponse } from 'next/server';
import { createOracleIntelligence } from '@/backend/src/services/OracleIntelligenceService';
import { v4 as uuidv4 } from 'uuid';

// Enhanced Oracle Chat API with full intelligence integration
export async function POST(request: NextRequest) {
  try {
    const { message, oracle, sessionId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    // Get user session (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const currentSessionId = sessionId || uuidv4();

    // Initialize Oracle Intelligence with full memory and AI integration
    const oracleIntelligence = createOracleIntelligence({
      userId,
      sessionId: currentSessionId,
      oracleName: oracle || 'Maya',
      personality: 'adaptive mystical guide',
      voice: 'maya'
    });

    // Process with full intelligence stack
    const result = await oracleIntelligence.processUserInput(message);

    return NextResponse.json({
      message: result.response,
      element: result.element,
      confidence: result.confidence,
      sessionId: currentSessionId,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Oracle chat error:', error);
    
    // Fallback to simple response if intelligence service fails
    return NextResponse.json({
      message: '✨ The oracle channels are realigning. Please share your question again.',
      element: 'aether',
      confidence: 0.5,
      metadata: {
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const sessionId = request.nextUrl.searchParams.get('sessionId') || uuidv4();

    // Get conversation summary
    const oracleIntelligence = createOracleIntelligence({
      userId,
      sessionId,
      oracleName: 'Maya',
      personality: 'adaptive mystical guide',
      voice: 'maya'
    });

    const summary = await oracleIntelligence.getConversationSummary();

    return NextResponse.json({
      summary,
      sessionId,
      status: 'active'
    });

  } catch (error) {
    console.error('Oracle status error:', error);
    return NextResponse.json({ 
      error: 'Failed to get oracle status',
      status: 'error' 
    }, { status: 500 });
  }
}