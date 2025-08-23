// Oracle Turn API - Orchestrates hybrid Sesame·Claude·Oracle2·PSI·AIN system
// Accepts voice/text input, coordinates providers, returns unified response
import { NextRequest, NextResponse } from 'next/server';
import { buildContextPack } from '@/lib/context/buildContext';
import { betaEvents } from '@/lib/beta/events';
import { emitBetaEventServer } from '@/lib/beta/emit';
import { withTraceNext } from '../_middleware/traceNext';

// Runtime flags - prevents conversational pipeline regression
const FLAGS = {
  USE_CLAUDE: process.env.USE_CLAUDE === 'true',
  DEMO_PIPELINE_DISABLED: process.env.DEMO_PIPELINE_DISABLED === 'true',
  ATTENDING_ENFORCEMENT_MODE: process.env.ATTENDING_ENFORCEMENT_MODE ?? 'relaxed',
  MAYA_GREETING_ENABLED: process.env.MAYA_GREETING_ENABLED === 'true',
  MAYA_MODE_DEFAULT: process.env.MAYA_MODE_DEFAULT ?? 'conversational',
  START_SERVER: process.env.START_SERVER ?? 'full',
  UPLOADS_ENABLED: process.env.UPLOADS_ENABLED === 'true',
  MICROPSI_ENABLED: process.env.USE_MICROPSI_BACH === 'true',
  SOUL_MEMORY_ENRICH_SYNC: process.env.SOUL_MEMORY_ENRICH_SYNC === 'true',
  SOUL_MEMORY_ENRICH_BUDGET_MS: Number(process.env.SOUL_MEMORY_ENRICH_BUDGET_MS ?? 350),
};

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
  meta?: {
    source?: 'text' | 'voice';
    [key: string]: any;
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
  turnMeta?: {
    sacredDetected: boolean;
    shadowScore: number;
    archetypeHint?: string;
    facetHints: string[];
    soulMemoryId?: string | null;
    soulPhase?: string;
    confidence?: number;
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
  const { setTTSResult } = await import('@/lib/tts-storage');
  
  setTTSResult(turnId, { status: 'pending' });

  try {
    const { synthesize } = await import('@/lib/voice');
    
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

async function postHandler(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TurnRequest = await request.json();
    const { input, providers = DEFAULT_PROVIDERS, meta } = body;
    
    // Log voice→turn routing in development
    if (process.env.NODE_ENV === 'development' && meta?.source === 'voice') {
      console.info('[voice→turn] received', { 
        textLength: input.text?.length,
        providers: Object.keys(providers || {}),
        conversationId: input.context?.conversationId
      });
    }
    
    if (!input?.text?.trim()) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Generate conversation ID if not provided
    const conversationId = input.context?.conversationId || 
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get user ID for context building
    let userId = 'anonymous';
    let authenticatedUser: any = null;
    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        authenticatedUser = user;
      }
    } catch (error) {
      console.warn('Failed to get user for context:', error);
    }

    // Build unified context pack with MicroPsi modulation
    let contextPack: any = null;
    let micropsiModulation: any = null;
    if (process.env.USE_MICROPSI_BACH === 'true') {
      try {
        contextPack = await buildContextPack({ userId, text: input.text, conversationId });
        micropsiModulation = contextPack.micropsi?.modulation;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[micropsi] modulation applied:', micropsiModulation);
        }
      } catch (error) {
        console.warn('Context pack building failed:', error);
      }
    }

    // Initialize provider responses
    const providerResults: any = {};
    const activeProviders: string[] = [];

    // 1. SESAME - Core conversation processing (always first)
    if (providers.sesame !== false) {
      try {
        const { processSesameInput } = await import('@/lib/providers/sesame');
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
        const { analyzePSI } = await import('@/lib/providers/psi');
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
        const { retrieveAINContext } = await import('@/lib/providers/ain');
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
        const { consultOracle2 } = await import('@/lib/providers/oracle2');
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

    // 5. CLAUDE - Primary conversation generator (with MicroPsi modulation)
    const useClaudePrimary = process.env.USE_CLAUDE === 'true';
    const demoDisabled = process.env.DEMO_PIPELINE_DISABLED === 'true';
    
    if (providers.claude !== false && useClaudePrimary) {
      try {
        // Apply MicroPsi modulation to generation parameters
        const baseTemp = 0.7;
        const temperature = micropsiModulation?.temperature ?? baseTemp;
        const maxTokens = Math.round(600 + (micropsiModulation?.depthBias ?? 0.55) * 200);
        
        const { generateClaudeResponse } = await import('@/lib/providers/air');
        providerResults.claude = await generateClaudeResponse({
          text: input.text,
          context: {
            ...input.context,
            // Add context from memory layers
            contextBlocks: contextPack ? stitchContextBlocks(contextPack) : undefined
          },
          sesameAnalysis: contextPack?.nlu || providerResults.sesame,
          psiAnalysis: contextPack?.psi || providerResults.psi,
          ainContext: contextPack?.ainSnippets || providerResults.ain,
          oracle2Response: providerResults.oracle2,
          conversationId,
          // MicroPsi-modulated parameters
          maxTokens,
          temperature,
          topP: 0.95,
          conversationalMode: true,
          micropsiModulation: contextPack?.micropsi
        });
        activeProviders.push('claude');
        
        if (process.env.NODE_ENV === 'development' && micropsiModulation) {
          console.log('[claude] modulated params:', { temperature, maxTokens, depthBias: micropsiModulation.depthBias });
        }
      } catch (error) {
        console.warn('Claude provider failed:', error);
        providerResults.claude = {
          text: "I'm experiencing a communication disruption. Please try again.",
          confidence: 0.3,
        };
      }
    }

    // Synthesize draft response
    let draftResponse = providerResults.claude?.text || 
      providerResults.oracle2?.text ||
      "I'm not able to process that request right now.";

    // 6. SACRED INTELLIGENCE - Synthesis with drive awareness
    let sacredSynthesis = null;
    if (!demoDisabled) {
      try {
        const { synthesizeSacredResponse } = await import('@/lib/providers/sacred');
        sacredSynthesis = await synthesizeSacredResponse({
          draft: draftResponse,
          nlu: contextPack?.nlu || providerResults.sesame,
          psi: contextPack?.psi || providerResults.psi,
          drives: contextPack?.micropsi?.driveVector,
          conversational: true,
          context: input.context,
        });
        if (sacredSynthesis?.text) {
          draftResponse = sacredSynthesis.text;
        }
      } catch (error) {
        console.warn('Sacred Intelligence synthesis failed:', error);
      }
    }

    // Get user info for greeting personalization  
    userId = userId || undefined; // reuse existing variable from above
    let userDisplayName: string | undefined;
    
    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
      
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, first_name, name')
          .eq('id', userId)
          .single();
        
        if (profile) {
          userDisplayName = profile.display_name || profile.first_name || profile.name;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch user info for greeting:', error);
    }

    // 7. MAYA - Voice, connection, and greeting layer
    let finalResponse = draftResponse;
    let greetingApplied = false;
    let greetingText = '';
    let validationResult: any = null;
    
    try {
      const { generateFirstTurnGreeting } = await import('@/lib/greetings');
      const { createConversationalValidator } = await import('@/lib/validators/conversational');
      const { MayaPromptProcessor } = await import('@/lib/shared/maya/mayaSystemPrompt');
      
      // Determine if this is first turn and apply greeting
      const greetingContext = {
        userId,
        conversationId,
        archetypeHint: providerResults.sesame?.spiralogic?.archetypeHints?.[0]?.name,
        soulPhase: undefined, // dualMemoryResult not yet available at this point
        sentiment: providerResults.sesame?.conversationFlow?.sentiment,
        userInput: input.text,
        messageCount: undefined, // Could be enhanced with conversation state
        themeExchangeCount: undefined
      };
      
      const greeting = await generateFirstTurnGreeting(greetingContext);
      
      if (greeting) {
        greetingApplied = true;
        greetingText = greeting;
        // Apply greeting with natural connective
        const connector = Math.random() < 0.3 ? ' So, ' : ' ';
        finalResponse = greeting + connector + finalResponse;
      }
      
      // Apply Maya authenticity and wisdom processing
      const mayaContext = {
        spiralogicPhase: (providerResults.psi?.elementRecommendation || 'air') as any,
        archetypeDetected: providerResults.sesame?.spiralogic?.archetypeHints?.[0]?.name || 'guide',
        userProjectionLevel: 'low' as any,
        dependencyRisk: false,
        shadowWorkIndicated: dualMemoryResult?.enrichment?.shadowScore > 0.7
      };
      
      const mayaResponse = MayaPromptProcessor.applyMayaFramework(finalResponse, mayaContext);
      finalResponse = mayaResponse.content;
      
      // Apply conversational validation with MicroPsi-influenced invite count
      const invitesAllowed = micropsiModulation?.inviteCount ?? 1;
      const validator = createConversationalValidator({
        minSentences: Number(process.env.TURN_MIN_SENTENCES) || 4,
        maxSentences: Number(process.env.TURN_MAX_SENTENCES) || 12,
        maxInvites: invitesAllowed
      });
      const validation = await validator.validate(finalResponse, input.text);
      validationResult = validation;
      
      if (validation.valid || process.env.ATTENDING_ENFORCEMENT_MODE === 'relaxed') {
        finalResponse = validation.text;
      }
      
      if (process.env.NODE_ENV === 'development') {
        if (greeting) {
          console.log('Applied greeting:', greeting.slice(0, 80) + '...');
        }
        if (validation.corrections.length > 0) {
          console.log('Conversational validation:', {
            corrections: validation.corrections,
            metadata: validation.metadata
          });
        }
      }
      
    } catch (error) {
      console.warn('Maya processing failed:', error);
    }

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

    // Training metrics collection (non-blocking)
    if (process.env.TRAINING_ENABLED === 'true' && Math.random() < Number(process.env.TRAINING_SAMPLE_RATE || '0.20')) {
      try {
        // Create stable user hash
        const crypto = await import('crypto');
        const userSalt = process.env.TRAINING_USER_SALT || 'default_salt_change_in_production';
        const userHash = crypto.createHash('sha256').update((userId || 'anonymous') + userSalt).digest('hex').substring(0, 16);
        
        // Redact content for privacy
        const redactContent = (content: string, maxLength: number = 100): string => {
          let redacted = content
            .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]')
            .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
            .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
          
          if (redacted.length > maxLength) {
            redacted = redacted.substring(0, maxLength) + '...';
          }
          return redacted;
        };
        
        // Determine primary agent
        const determineAgent = (): 'claude' | 'sacred' | 'micropsi' => {
          if (sacredSynthesis?.text) return 'sacred';
          if (contextPack?.micropsi) return 'micropsi';
          return 'claude';
        };
        
        // Build training request payload
        const trainingRequest = {
          agent: determineAgent(),
          user_hash: userHash,
          conv_id: conversationId,
          prompt_summary: redactContent(input.text, 150),
          response_summary: redactContent(finalResponse, 200),
          context_meta: {
            drives: contextPack?.micropsi?.driveVector,
            facets: contextPack?.facetHints,
            micropsi: {
              arousal: contextPack?.micropsi?.affect?.arousal,
              valence: contextPack?.micropsi?.affect?.valence,
              meaning: contextPack?.micropsi?.driveVector?.meaning
            }
          }
        };
        
        // Fire-and-forget evaluation call
        fetch('/api/training/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingRequest)
        }).catch(() => {}); // Silent fail for non-blocking
        
      } catch (error) {
        console.warn('Training metrics collection failed:', error);
      }
    }

    // Beta Events: Emit oracle turn event (new beta system)
    if (authenticatedUser) {
      try {
        await emitBetaEventServer(authenticatedUser.id, 'oracle_turn', {
          conversationId,
          responseLength: finalResponse.length,
          sacredDetected: !!sacredSynthesis?.text,
          shadowScore: dualMemoryResult?.enrichment?.shadowScore || 0
        });
        
        // Check for thread weaving
        if (sacredSynthesis?.text && contextPack?.ainSnippets?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'weave_created', {
            conversationId,
            threadCount: contextPack.ainSnippets.length,
            synthesisStrength: 0.8 // Could be calculated from actual synthesis quality
          });
        }

        // Check for shadow work
        if (dualMemoryResult?.enrichment?.shadowScore >= 0.7) {
          await emitBetaEventServer(authenticatedUser.id, 'shadow_safe', {
            conversationId,
            shadowScore: dualMemoryResult.enrichment.shadowScore,
            category: 'conversation'
          });
        }

        // Check for graduation eligibility on thread weave
        if (sacredSynthesis?.text && contextPack?.ainSnippets?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'graduation_offer_shown', {
            conversationId,
            trigger: 'thread_weave_completion'
          });
        }

        // Check for upload context usage
        if (contextPack?.uploads?.items?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'upload_context_used', {
            conversationId,
            upload_count: contextPack.uploads.items.length,
            mentioned_explicitly: contextPack.uploads.mentioned,
            keywords: contextPack.uploads.keywords
          });
        }
      } catch (error) {
        console.warn('Beta event emission failed:', error);
      }
    }

    // Memory storage to both AIN and Soul Memory systems
    let dualMemoryResult: any = null;
    if (providerResults.claude?.shouldRemember !== false) {
      try {
        const { writeDualMemory } = await import('@/lib/shared/memory/soulMemoryBridge');
        
        dualMemoryResult = await writeDualMemory({
          userId: userId || 'anonymous',
          conversationId,
          text: input.text,
          response: finalResponse,
          meta: {
            element: providerResults.psi?.elementRecommendation,
            emotionalTone: providerResults.claude?.emotion,
            preferences: userPreferences ? {
              agent_name: userPreferences.agent_name,
              voice_id: userPreferences.voice_id,
            } : null,
          },
          privacy: { 
            never_quote: false,
            redacted: false 
          },
        });

        // Log enrichment results in development
        if (process.env.NODE_ENV === 'development' && dualMemoryResult.enrichment) {
          console.log('Memory enriched:', {
            soulMemoryId: dualMemoryResult.soulMemoryId,
            sacredMoment: dualMemoryResult.enrichment.sacredMoment,
            archetypes: dualMemoryResult.enrichment.archetypes?.length || 0,
            shadowScore: dualMemoryResult.enrichment.shadowScore,
          });
        }

        // Beta Events: Emit soul memory saved event (new beta system)
        if (authenticatedUser && dualMemoryResult.soulMemoryId) {
          try {
            await emitBetaEventServer(authenticatedUser.id, 'soul_save', {
              conversationId,
              soulMemoryId: dualMemoryResult.soulMemoryId,
              sacredMoment: dualMemoryResult.enrichment?.sacredMoment || false,
              shadowScore: dualMemoryResult.enrichment?.shadowScore || 0
            });
          } catch (error) {
            console.warn('Beta soul memory event failed:', error);
          }
        }
      } catch (error) {
        console.warn('Dual memory storage failed:', error);
        // Fallback to AIN only if bridge fails
        try {
          const { storeAINMemory } = await import('@/lib/providers/ain');
          await storeAINMemory({
            text: input.text,
            response: finalResponse,
            context: input.context,
            conversationId,
          });
        } catch (fallbackError) {
          console.error('Memory storage completely failed:', fallbackError);
        }
      }
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
        // Debug information for conversational pipeline
        pipeline: {
          demoDisabled,
          claudePrimary: useClaudePrimary,
          greetingEnabled: process.env.MAYA_GREETING_ENABLED === 'true',
          greetingApplied,
          greetingText: greetingApplied ? greetingText : undefined,
          validationMode: process.env.ATTENDING_ENFORCEMENT_MODE || 'strict',
          sentenceLimits: {
            min: Number(process.env.TURN_MIN_SENTENCES) || 2,
            max: Number(process.env.TURN_MAX_SENTENCES) || 7
          },
          validation: validationResult ? {
            valid: validationResult.valid,
            corrections: validationResult.corrections,
            metadata: validationResult.metadata
          } : undefined
        },
        // MicroPsi and context information
        micropsi: contextPack?.micropsi,
        context: contextPack ? {
          ain: contextPack.ainSnippets?.length || 0,
          soul: contextPack.soulSnippets?.length || 0,
          facets: Object.keys(contextPack.facetHints || {}).length,
          uploads: contextPack.uploads ? {
            count: contextPack.uploads.items.length,
            mentioned: contextPack.uploads.mentioned,
            keywords: contextPack.uploads.keywords
          } : undefined
        } : undefined,
        // Runtime flags - prevents regression
        flags: {
          conversationalMode:
            FLAGS.DEMO_PIPELINE_DISABLED &&
            FLAGS.USE_CLAUDE &&
            FLAGS.ATTENDING_ENFORCEMENT_MODE === 'relaxed' &&
            FLAGS.MAYA_GREETING_ENABLED,
          ...FLAGS,
        }
      },
      turnMeta: dualMemoryResult ? {
        sacredDetected: dualMemoryResult.enrichment?.sacredMoment || false,
        shadowScore: dualMemoryResult.enrichment?.shadowScore || 0,
        archetypeHint: dualMemoryResult.enrichment?.archetypes?.[0]?.name,
        facetHints: [
          ...(providerResults.psi?.elementRecommendation ? [providerResults.psi.elementRecommendation] : []),
          ...(providerResults.sesame?.spiralogic?.archetypeHints?.map((h: any) => h.name) || [])
        ],
        soulMemoryId: dualMemoryResult.soulMemoryId,
        soulPhase: dualMemoryResult.enrichment?.soulPhase,
        confidence: providerResults.claude?.confidence || 0.8,
      } : undefined,
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

export const POST = withTraceNext('oracle/turn', postHandler);

// Helper function to stitch context blocks for prompt
function stitchContextBlocks(pack: any): string {
  const blocks = [];
  
  if (pack.ainSnippets?.length > 0) {
    const snippets = pack.ainSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Recent threads\n${snippets}`);
  }
  
  if (pack.soulSnippets?.length > 0) {
    const snippets = pack.soulSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Sacred moments\n${snippets}`);
  }
  
  if (pack.uploads?.items?.length > 0) {
    const { formatUploadContextForPrompt } = require('@/lib/context/attachUploads');
    const uploadContext = formatUploadContextForPrompt(pack.uploads.items);
    if (uploadContext) {
      blocks.push(uploadContext);
    }
  }
  
  if (pack.facetHints && Object.keys(pack.facetHints).length > 0) {
    const hints = Object.entries(pack.facetHints)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Facet hints\n${hints}`);
  }
  
  if (pack.micropsi?.driveVector) {
    const drives = Object.entries(pack.micropsi.driveVector)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Active drives\n${drives}`);
  }
  
  return blocks.join('\n\n');
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