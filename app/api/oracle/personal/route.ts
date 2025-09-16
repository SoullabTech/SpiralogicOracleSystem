import { NextRequest, NextResponse } from 'next/server';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { SacredOracleCoreEnhanced } from '@/lib/sacred-oracle-core-enhanced';

// Session tracking for context
const sessionStates = new Map<string, any>();

/**
 * PRODUCTION ROUTE - Uses PersonalOracleAgent with AI when enabled
 * Can be toggled via USE_PERSONAL_ORACLE environment variable
 * Fallback to SacredOracleCoreEnhanced when disabled or on failure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract message from various possible field names
    const text = body.text || body.message || body.content || body.userMessage || body.input || body.prompt || '';
    const sessionId = body.sessionId || body.session_id || 'default';
    const userId = body.userId || body.user_id || 'production-user';

    // SAFETY TOGGLE: Check if PersonalOracleAgent is enabled
    // PRODUCTION FIX: Default to true if not explicitly disabled
    const usePersonalOracle = process.env.USE_PERSONAL_ORACLE !== 'false';

    if (!text) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create session state
    let sessionState = sessionStates.get(sessionId) || {
      turnCount: 0,
      lastInput: '',
      depth: 0,
      mode: 'witnessing',
      patterns: []
    };

    sessionState.turnCount++;
    sessionState.lastInput = text;

    // Check if PersonalOracle is enabled via environment variable
    if (!usePersonalOracle) {
      console.log('[Production] PersonalOracle disabled, using SacredOracleCoreEnhanced');

      // Use pattern-based system when toggle is off
      const sacredOracle = new SacredOracleCoreEnhanced();
      const oracleResponse = await sacredOracle.generateResponse(
        text,
        userId,
        sessionState
      );

      // Update session state
      if (oracleResponse.tracking) {
        sessionState.depth = oracleResponse.depth;
        sessionState.mode = oracleResponse.mode;
        if (oracleResponse.tracking.activePatterns) {
          sessionState.patterns = oracleResponse.tracking.activePatterns;
        }
      }

      sessionStates.set(sessionId, sessionState);

      return NextResponse.json({
        text: oracleResponse.message,
        content: oracleResponse.message,
        message: oracleResponse.message,
        metadata: {
          sessionId,
          source: 'sacred-oracle-core',
          mode: oracleResponse.mode,
          depth: oracleResponse.depth,
          wisdomSources: oracleResponse.wisdomSources,
          tracking: oracleResponse.tracking,
          personalOracleEnabled: false,
          ai: false
        }
      });
    }

    try {
      // PRIMARY PATH: Use PersonalOracleAgent with real AI (when enabled)
      console.log('[Production] Using PersonalOracleAgent for:', text.substring(0, 50));

      // Load or create agent for user
      const agent = await PersonalOracleAgent.loadAgent(userId);

      // Process through the agent with full AI capabilities
      const agentResponse = await agent.processInteraction(text, {
        currentMood: { type: 'receptive' } as any,
        currentEnergy: 'balanced' as any,
        currentPetal: sessionState.currentPetal
      });

      // Update session state
      sessionState.depth = Math.min(sessionState.depth + 0.1, 1.0);
      sessionStates.set(sessionId, sessionState);

      // Generate voice if requested
      let audioData = null;
      let audioUrl = null;

      if (body.enableVoice) {
        try {
          // Import cleaning function
          const { cleanTextForSpeech } = require('@/lib/utils/cleanTextForSpeech');

          // Clean the response text for speech (removes excessive punctuation for smoother flow)
          const cleanedResponse = cleanTextForSpeech(agentResponse.response);

          // Shorten if it's too long for initial response
          const maxInitialLength = 150; // characters
          const spokenText = cleanedResponse.length > maxInitialLength && sessionState.turnCount <= 1
            ? cleanedResponse.substring(0, maxInitialLength) + '.'
            : cleanedResponse;

          // Get voice settings with fallback
          let voiceSettings;
          try {
            const { getVoiceSettings } = require('@/lib/config/voiceSettings');
            voiceSettings = getVoiceSettings('maya', 'nova');
          } catch (e) {
            // Fallback voice settings
            voiceSettings = {
              provider: 'openai',
              voiceId: 'nova',
              speed: 1.0
            };
          }

          const voiceResult = await agent.generateVoiceResponse(
            spokenText,
            {
              element: 'aether',
              voiceMaskId: 'maya',
              provider: voiceSettings.provider,
              voiceId: voiceSettings.voiceId  // Nova voice
            }
          );

          if (voiceResult.audioData) {
            audioData = voiceResult.audioData.toString('base64');
            audioUrl = `data:audio/mp3;base64,${audioData}`;
          }
        } catch (voiceError) {
          console.error('[Production] Voice generation failed:', voiceError);
        }
      }

      // Return successful AI response
      return NextResponse.json({
        text: agentResponse.response,
        content: agentResponse.response,
        message: agentResponse.response,
        audioUrl,
        audioData,
        metadata: {
          sessionId,
          source: 'personal-oracle-agent',
          mode: sessionState.mode,
          depth: sessionState.depth,
          suggestions: agentResponse.suggestions,
          ritual: agentResponse.ritual,
          reflection: agentResponse.reflection,
          ai: true,
          personalOracleEnabled: true
        }
      });

    } catch (agentError: any) {
      console.error('[Production] PersonalOracleAgent failed:', agentError);
      console.log('[Production] Failure details:', {
        errorType: agentError.constructor.name,
        errorMessage: agentError.message,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        usePersonalOracle
      });

      // FALLBACK PATH: Use SacredOracleCoreEnhanced (pattern-based)
      console.warn('[Production] Falling back to SacredOracleCoreEnhanced');

      try {
        const sacredOracle = new SacredOracleCoreEnhanced();

        const oracleResponse = await sacredOracle.generateResponse(
          text,
          userId,
          sessionState
        );

        // Update session state with oracle tracking
        if (oracleResponse.tracking) {
          sessionState.depth = oracleResponse.depth;
          sessionState.mode = oracleResponse.mode;
          if (oracleResponse.tracking.activePatterns) {
            sessionState.patterns = oracleResponse.tracking.activePatterns;
          }
        }

        sessionStates.set(sessionId, sessionState);

        // Return fallback response
        return NextResponse.json({
          text: oracleResponse.message,
          content: oracleResponse.message,
          message: oracleResponse.message,
          metadata: {
            sessionId,
            source: 'sacred-oracle-fallback',
            mode: oracleResponse.mode,
            depth: oracleResponse.depth,
            wisdomSources: oracleResponse.wisdomSources,
            tracking: oracleResponse.tracking,
            fallback: true,
            fallbackReason: agentError.message,
            ai: false
          }
        });

      } catch (fallbackError) {
        console.error('[Production] Even fallback failed:', fallbackError);

        // EMERGENCY FALLBACK: Simple responses
        const emergencyResponses = [
          "I'm here with you in this moment. What would you like to explore?",
          "I notice something important in what you're sharing. Tell me more.",
          "There's wisdom in this question itself. What does your intuition say?",
          "I'm listening deeply. What feels most alive for you right now?",
          "This touches something essential. What wants to emerge?"
        ];

        const response = emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];

        return NextResponse.json({
          text: response,
          content: response,
          message: response,
          metadata: {
            sessionId,
            source: 'emergency-fallback',
            error: true,
            ai: false
          }
        });
      }
    }

  } catch (error: any) {
    console.error('[Production] Route handler error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Check if PersonalOracleAgent can be loaded
    const testAgent = await PersonalOracleAgent.loadAgent('health-check');

    return NextResponse.json({
      status: 'healthy',
      service: 'oracle-personal',
      aiEnabled: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'degraded',
      service: 'oracle-personal',
      aiEnabled: false,
      fallbackAvailable: true,
      timestamp: new Date().toISOString()
    });
  }
}