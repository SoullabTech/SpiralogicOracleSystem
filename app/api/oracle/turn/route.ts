// Oracle Turn API - Orchestrates hybrid Sesame·Claude·Oracle2·PSI·AIN system
// Accepts voice/text input, coordinates providers, returns unified response
import { NextRequest, NextResponse } from 'next/server';

export interface TurnRequest {
  input: {
    text: string;
    voiceMeta?: {
      confidence: number;
      isFinal: boolean;
      timestamp: number;
      language: string;
    };
    context?: {
      currentPage?: string;
      elementFocus?: string;
      conversationId?: string;
    };
  };
  providers?: {
    sesame?: boolean;      // Conversation core (always true)
    claude?: boolean;      // Air communicator 
    oracle2?: boolean;     // Specialist consults
    psi?: boolean;         // User tendencies analysis
    ain?: boolean;         // Memory storage/retrieval
  };
}

export interface TurnResponse {
  response: {
    text: string;
    audioUrl?: string;
    audioPending?: boolean;
    turnId?: string | null;
    actions?: Array<{
      type: 'navigate' | 'element_focus' | 'journal_entry' | 'spiral_update';
      payload: any;
    }>;
  };
  metadata: {
    providers: string[];
    confidence: number;
    processingTime: number;
    conversationId: string;
    elementRecommendation?: string;
  };
  debug?: {
    sesameResponse?: any;
    claudeResponse?: any;
    oracle2Response?: any;
    psiAnalysis?: any;
    ainContext?: any;
  };
}

// Default provider configuration
const DEFAULT_PROVIDERS = {
  sesame: true,    // Always active - conversation core
  claude: true,    // Default to Air communicator
  oracle2: false,  // Only for specialist requests
  psi: true,       // Analyze user patterns
  ain: true,       // Memory context
};

// Background TTS generation
async function generateTTSInBackground(turnId: string, text: string, preferences: any): Promise<void> {
  const { setTTSResult } = await import('../../../../lib/tts-storage');
  
  setTTSResult(turnId, { status: 'pending' });

  try {
    const { synthesize } = await import('../../../../lib/voice');
    
    const audioUrl = await synthesize({
      voiceId: preferences.voice_id,
      text: text.slice(0, 1000), // Limit TTS length
      rate: preferences.speech_rate || 1.0,
      pitch: preferences.speech_pitch || 1.0,
      provider: preferences.voice_provider || 'elevenlabs',
    });

    setTTSResult(turnId, { status: 'ready', audioUrl });

  } catch (error) {
    console.error('TTS generation failed:', error);
    setTTSResult(turnId, { 
      status: 'failed', 
      error: error instanceof Error ? error.message : 'TTS failed' 
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TurnRequest = await request.json();
    const { input, providers = DEFAULT_PROVIDERS } = body;
    
    if (!input?.text?.trim()) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Generate conversation ID if not provided
    const conversationId = input.context?.conversationId || 
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize provider responses
    const providerResults: any = {};
    const activeProviders: string[] = [];

    // 1. SESAME - Core conversation processing (always first)
    if (providers.sesame !== false) {
      try {
        const { processSesameInput } = await import('../../../../lib/providers/sesame');
        providerResults.sesame = await processSesameInput({
          text: input.text,
          context: input.context,
          conversationId,
        });
        activeProviders.push('sesame');
      } catch (error) {
        console.warn('Sesame provider failed:', error);
        providerResults.sesame = { 
          intent: 'general',
          entities: [],
          needsSpecialist: false 
        };
      }
    }

    // 2. PSI - User tendencies analysis (parallel with memory)
    const psiPromise = providers.psi ? (async () => {
      try {
        const { analyzePSI } = await import('../../../../lib/providers/psi');
        providerResults.psi = await analyzePSI({
          text: input.text,
          context: input.context,
          conversationId,
        });
        activeProviders.push('psi');
      } catch (error) {
        console.warn('PSI provider failed:', error);
        providerResults.psi = { elementRecommendation: 'air' };
      }
    })() : Promise.resolve();

    // 3. AIN - Memory context retrieval (parallel with PSI)
    const ainPromise = providers.ain ? (async () => {
      try {
        const { retrieveAINContext } = await import('../../../../lib/providers/ain');
        providerResults.ain = await retrieveAINContext({
          text: input.text,
          context: input.context,
          conversationId,
        });
        activeProviders.push('ain');
      } catch (error) {
        console.warn('AIN provider failed:', error);
        providerResults.ain = { relevantMemories: [] };
      }
    })() : Promise.resolve();

    // Wait for parallel providers
    await Promise.all([psiPromise, ainPromise]);

    // 4. Oracle2 - Specialist consultation (conditional)
    const needsSpecialist = providerResults.sesame?.needsSpecialist || 
      input.text.toLowerCase().includes('oracle');
    
    if ((providers.oracle2 || needsSpecialist) && needsSpecialist) {
      try {
        const { consultOracle2 } = await import('../../../../lib/providers/oracle2');
        providerResults.oracle2 = await consultOracle2({
          text: input.text,
          context: input.context,
          sesameAnalysis: providerResults.sesame,
          conversationId,
        });
        activeProviders.push('oracle2');
      } catch (error) {
        console.warn('Oracle2 provider failed:', error);
      }
    }

    // 5. CLAUDE - Air communicator (final synthesis)
    if (providers.claude !== false) {
      try {
        const { generateClaudeResponse } = await import('../../../../lib/providers/air');
        providerResults.claude = await generateClaudeResponse({
          text: input.text,
          context: input.context,
          sesameAnalysis: providerResults.sesame,
          psiAnalysis: providerResults.psi,
          ainContext: providerResults.ain,
          oracle2Response: providerResults.oracle2,
          conversationId,
        });
        activeProviders.push('claude');
      } catch (error) {
        console.warn('Claude provider failed:', error);
        providerResults.claude = {
          text: "I'm experiencing a communication disruption. Please try again.",
          confidence: 0.3,
        };
      }
    }

    // Synthesize final response
    const finalResponse = providerResults.claude?.text || 
      providerResults.oracle2?.text ||
      "I'm not able to process that request right now.";

    // Extract actions from provider responses
    const actions: any[] = [];
    
    // Navigation actions from Sesame
    if (providerResults.sesame?.suggestedPage) {
      actions.push({
        type: 'navigate',
        payload: { page: providerResults.sesame.suggestedPage }
      });
    }

    // Element focus from PSI
    if (providerResults.psi?.elementRecommendation) {
      actions.push({
        type: 'element_focus',
        payload: { element: providerResults.psi.elementRecommendation }
      });
    }

    // Fetch user preferences for voice and agent settings
    let userPreferences: any = null;
    let audioPending = false;
    let turnId: string | null = null;

    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Try oracle_preferences first, fall back to user_preferences
        let { data: oraclePrefs } = await supabase
          .from('oracle_preferences')
          .select('agent_name, voice_id, tts_enabled, speech_rate, speech_pitch, voice_provider')
          .eq('user_id', user.id)
          .single();

        if (!oraclePrefs) {
          const { data: userPrefs } = await supabase
            .from('user_preferences')
            .select('agent_name, voice_id, tts_enabled, speech_rate, speech_pitch, voice_provider')
            .eq('user_id', user.id)
            .single();
          oraclePrefs = userPrefs;
        }

        userPreferences = oraclePrefs;

        // Generate turn ID for TTS tracking
        if (userPreferences?.tts_enabled && userPreferences?.voice_id) {
          turnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          audioPending = true;

          // Kick off TTS generation in background (don't await)
          generateTTSInBackground(turnId, finalResponse, userPreferences);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch user preferences:', error);
    }

    // Memory storage to AIN (include preferences for traceability)
    if (providerResults.claude?.shouldRemember) {
      const { storeAINMemory } = await import('../../../../lib/providers/ain');
      await storeAINMemory({
        text: input.text,
        response: finalResponse,
        context: {
          ...input.context,
          preferences: userPreferences ? {
            agent_name: userPreferences.agent_name,
            voice_id: userPreferences.voice_id,
          } : null,
        },
        conversationId,
      });
    }

    const processingTime = Date.now() - startTime;

    const response: TurnResponse = {
      response: {
        text: finalResponse,
        actions,
        audioPending,
        turnId,
      },
      metadata: {
        providers: activeProviders,
        confidence: providerResults.claude?.confidence || 0.8,
        processingTime,
        conversationId,
        elementRecommendation: providerResults.psi?.elementRecommendation,
      },
      debug: process.env.NODE_ENV === 'development' ? {
        sesameResponse: providerResults.sesame,
        claudeResponse: providerResults.claude,
        oracle2Response: providerResults.oracle2,
        psiAnalysis: providerResults.psi,
        ainContext: providerResults.ain,
      } : undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Oracle Turn API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    providers: {
      sesame: 'active',
      claude: 'active', 
      oracle2: 'conditional',
      psi: 'active',
      ain: 'active',
    },
    timestamp: new Date().toISOString(),
  });
}