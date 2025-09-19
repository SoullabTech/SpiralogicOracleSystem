import { NextRequest, NextResponse } from 'next/server';
import { getMaiaOrchestrator } from '@/lib/oracle/MaiaFullyEducatedOrchestrator';
import { getSessionStorage } from '@/lib/storage/session-storage';
import { getUserSessionCoordinator } from '@/lib/session/UserSessionCoordinator';
import OpenAI from 'openai';

// Initialize services
const orchestrator = getMaiaOrchestrator();
const sessionStorage = getSessionStorage();
const sessionCoordinator = getUserSessionCoordinator();
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

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

    // Register session with coordinator
    sessionCoordinator.registerSession(session.id, session.id, request);
    sessionCoordinator.updateActivity(session.id);

    // Check for potential conversation loops
    const loopDetection = sessionCoordinator.detectPotentialLoop(session.id, transcript);
    if (loopDetection.isLikelyLoop) {
      return NextResponse.json({
        success: true,
        response: loopDetection.suggestion,
        element: 'air',
        sessionId: session.id,
        timestamp: new Date().toISOString(),
        warning: 'multi_session_detected'
      });
    }

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

    // Process with Maia
    const maiaResponse = await orchestrator.speak(transcript, session.id);

    // Extract response text
    const responseText = maiaResponse.message || 'I understand. Tell me more.';

    // Add Maia's response to history
    sessionStorage.addMessage(session.id, {
      role: 'maia',
      content: responseText,
      metadata: {
        element: maiaResponse.element
      }
    });

    // Generate TTS audio
    let audioUrl = null;
    if (openai) {
      try {
        console.log('🎤 Generating TTS for Maia response...');
        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1-hd',  // Use HD model for better quality
          voice: 'alloy',
          input: responseText,
          speed: maiaResponse.element === 'fire' ? 1.1 :
                 maiaResponse.element === 'water' ? 0.95 :
                 maiaResponse.element === 'earth' ? 0.9 :
                 maiaResponse.element === 'air' ? 1.05 : 1.0
        });

        const buffer = Buffer.from(await mp3Response.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        console.log('✅ TTS generated successfully');

      } catch (ttsError) {
        console.error('❌ TTS generation failed:', ttsError);
        // Fall back to browser TTS by not sending audioUrl
      }
    } else {
      console.log('⚠️ OpenAI API key not configured - voice synthesis disabled');
    }

    // Update session metadata
    if (maiaResponse.element) {
      sessionStorage.updateMetadata(session.id, {
        emotionalState: maiaResponse.element
      });
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      audioUrl,
      sessionId: session.id,
      element: maiaResponse.element,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Maia Voice API Error:', error);
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