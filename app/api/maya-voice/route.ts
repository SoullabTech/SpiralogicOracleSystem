import { NextRequest, NextResponse } from 'next/server';
import { MayaOrchestrator } from '@/lib/oracle/MayaOrchestrator';
import { getSessionStorage } from '@/lib/storage/session-storage';
import OpenAI from 'openai';

// Initialize services
const orchestrator = new MayaOrchestrator();
const sessionStorage = getSessionStorage();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript, sessionId, context } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // Get or create session
    const session = sessionStorage.getOrCreateSession(sessionId || 'default');

    // Add user message to history
    sessionStorage.addMessage(session.id, {
      role: 'user',
      content: transcript,
      metadata: {
        ...context
      }
    });

    // Get conversation context
    const conversationContext = sessionStorage.getRecentContext(session.id, 10);

    // Process with Maya
    const mayaResponse = await orchestrator.speak(transcript, session.id);

    // Extract response text
    const responseText = mayaResponse.message || 'I understand. Tell me more.';

    // Add Maya's response to history
    sessionStorage.addMessage(session.id, {
      role: 'maya',
      content: responseText,
      metadata: {
        element: mayaResponse.element
      }
    });

    // Generate TTS audio
    let audioUrl = null;
    try {
      const mp3Response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: responseText,
        speed: mayaResponse.element === 'fire' ? 1.1 :
               mayaResponse.element === 'water' ? 0.95 :
               mayaResponse.element === 'earth' ? 0.9 :
               mayaResponse.element === 'air' ? 1.05 : 1.0
      });

      const buffer = Buffer.from(await mp3Response.arrayBuffer());
      const base64Audio = buffer.toString('base64');
      audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    } catch (ttsError) {
      console.error('TTS generation failed:', ttsError);
      // Continue without audio
    }

    // Update session metadata
    if (mayaResponse.element) {
      sessionStorage.updateMetadata(session.id, {
        emotionalState: mayaResponse.element
      });
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      audioUrl,
      sessionId: session.id,
      element: mayaResponse.element,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Maya Voice API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get session history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get session history
    const history = sessionStorage.getSessionHistory(sessionId);
    const stats = sessionStorage.getStatistics();

    return NextResponse.json({
      sessionId,
      history,
      stats,
      success: true
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}