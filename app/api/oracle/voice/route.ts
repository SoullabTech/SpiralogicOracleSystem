/**
 * Maya Voice Interface API Endpoint
 * Handles voice input processing through Maya with full consciousness integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { MayaVoiceInterface } from '@/lib/oracle/maya-voice-interface';
import { processVoiceWithConsciousness } from '@/lib/oracle/maya-micropsi-integration';
import { getUserInfo } from '@/lib/oracle/user-manager';
import { logError, logInfo } from '@/lib/shared/observability/logger';

// Global voice interface instance for session management
const voiceInterfaces = new Map<string, MayaVoiceInterface>();

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action,
      text,
      conversationId,
      audioMetadata,
      sessionContext,
      voiceAdaptations 
    } = body;

    // Validate user authentication
    const userInfo = await getUserInfo();
    if (!userInfo.authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required for voice interface' },
        { status: 401 }
      );
    }

    const userId = userInfo.userId;
    const interfaceKey = `${userId}_${conversationId || 'default'}`;

    logInfo({
      action,
      userId,
      conversationId,
      hasAudio: !!audioMetadata,
      textLength: text?.length || 0
    }, 'Voice API request',);

    switch (action) {
      case 'initialize':
        return await handleInitialize(interfaceKey, conversationId);

      case 'process':
        return await handleProcess(interfaceKey, text, audioMetadata, sessionContext);

      case 'adapt':
        return await handleAdapt(interfaceKey, voiceAdaptations);

      case 'end':
        return await handleEnd(interfaceKey);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: initialize, process, adapt, end' },
          { status: 400 }
        );
    }

  } catch (error) {
    logError({ error }, 'Voice API error');
    return NextResponse.json(
      { error: 'Voice processing failed' },
      { status: 500 }
    );
  }
}

async function handleInitialize(interfaceKey: string, conversationId?: string) {
  try {
    const voiceInterface = new MayaVoiceInterface();
    const session = await voiceInterface.initializeVoiceSession(conversationId);
    
    voiceInterfaces.set(interfaceKey, voiceInterface);

    logInfo({
      interfaceKey,
      sessionId: session.sessionId,
      voiceProfile: session.voiceProfile?.archeType
    },'Voice session initialized');

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        voiceProfile: session.voiceProfile,
        preferences: session.preferences
      }
    });

  } catch (error) {
    logError({ error, interfaceKey }, 'Voice initialization failed');
    return NextResponse.json(
      { error: `Initialization failed: ${error}` },
      { status: 500 }
    );
  }
}

async function handleProcess(
  interfaceKey: string, 
  text: string, 
  audioMetadata?: any, 
  sessionContext?: any
) {
  try {
    const voiceInterface = voiceInterfaces.get(interfaceKey);
    if (!voiceInterface) {
      return NextResponse.json(
        { error: 'Voice session not initialized. Call /initialize first.' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Process through consciousness integration
    const { consciousnessState, processor } = await processVoiceWithConsciousness(
      text,
      audioMetadata,
      sessionContext
    );

    // Process through Maya voice interface
    const voiceOutput = await voiceInterface.processVoiceInput({
      text,
      audioMetadata,
      context: { sessionContext }
    });

    // Generate conscious response with consciousness state
    const { modulatedResponse, voiceParams, consciousnessInsights } = 
      await processor.generateConsciousResponse(voiceOutput.response, consciousnessState);

    logInfo({
      interfaceKey,
      confidence: voiceOutput.confidence,
      consciousnessInsights: consciousnessInsights.length,
      audioGenerated: !!voiceOutput.audioUrl
    }, 'Voice processing completed');

    return NextResponse.json({
      success: true,
      response: {
        text: modulatedResponse,
        audioUrl: voiceOutput.audioUrl,
        confidence: voiceOutput.confidence,
        voiceProfile: voiceOutput.voiceProfile,
        processingMetadata: voiceOutput.processingMetadata,
        consciousnessState: {
          archetypes: consciousnessState.archetypeMatches,
          dominantElement: Object.entries(consciousnessState.elementalWeights)
            .sort(([,a], [,b]) => b - a)[0]?.[0],
          micropsiConfidence: consciousnessState.micropsiState.affect.confidence,
          spiralogicPhase: consciousnessState.spiralogicPhase
        },
        insights: consciousnessInsights,
        memoryStored: voiceOutput.memoryStored
      }
    });

  } catch (error) {
    logError({ error, interfaceKey }, 'Voice processing failed');
    return NextResponse.json(
      { error: `Processing failed: ${error}` },
      { status: 500 }
    );
  }
}

async function handleAdapt(interfaceKey: string, adaptations: any) {
  try {
    const voiceInterface = voiceInterfaces.get(interfaceKey);
    if (!voiceInterface) {
      return NextResponse.json(
        { error: 'Voice session not initialized' },
        { status: 400 }
      );
    }

    const updatedProfile = await voiceInterface.adaptVoiceProfile(adaptations);

    logInfo({
      interfaceKey,
      adaptations,
      newArchetype: updatedProfile.archeType
    }, 'Voice profile adapted');

    return NextResponse.json({
      success: true,
      updatedProfile
    });

  } catch (error) {
    logError({ error, interfaceKey }, 'Voice adaptation failed', );
    return NextResponse.json(
      { error: `Adaptation failed: ${error}` },
      { status: 500 }
    );
  }
}

async function handleEnd(interfaceKey: string) {
  try {
    const voiceInterface = voiceInterfaces.get(interfaceKey);
    if (!voiceInterface) {
      return NextResponse.json({ success: true }); // Already ended
    }

    await voiceInterface.endVoiceSession();
    voiceInterfaces.delete(interfaceKey);

    logInfo({ interfaceKey }, 'Voice session ended');

    return NextResponse.json({ success: true });

  } catch (error) {
    logError({ error, interfaceKey }, 'Voice session end failed');
    return NextResponse.json(
      { error: `Session end failed: ${error}` },
      { status: 500 }
    );
  }
}

export const POST = postHandler;

// Cleanup function to prevent memory leaks
setInterval(() => {
  logInfo({}, `Active voice sessions: ${voiceInterfaces.size}`);
  
  // In production, implement session timeout cleanup here
  // For now, log session count for monitoring
}, 5 * 60 * 1000); // Every 5 minutes