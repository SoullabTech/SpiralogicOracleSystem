// Oracle Turn API - Orchestrates hybrid Sesame·Claude·Oracle2·PSI·AIN system
// Accepts voice/text input, coordinates providers, returns unified response
import { NextRequest, NextResponse } from 'next/server';
import { buildContextPack } from '@/lib/context/buildContext';
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
    sesame?: boolean;
    claude?: boolean;
    oracle2?: boolean;
    psi?: boolean;
    ain?: boolean;
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
    pipeline?: any;
    micropsi?: any;
    context?: any;
    flags?: any;
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
  sesame: true,
  claude: true,
  oracle2: false,
  psi: true,
  ain: true,
};

// Background TTS generation
async function generateTTSInBackground(turnId: string, text: string, preferences: any): Promise<void> {
  const { setTTSResult } = await import('@/lib/tts-storage');
  setTTSResult(turnId, { status: 'pending' });
  try {
    const { synthesize } = await import('@/lib/voice');
    const audioUrl = await synthesize({
      voiceId: preferences.voice_id,
      text: text.slice(0, 1000),
      rate: preferences.speech_rate || 1.0,
      pitch: preferences.speech_pitch || 1.0,
      provider: preferences.voice_provider || 'elevenlabs',
    });
    setTTSResult(turnId, { status: 'ready', audioUrl });
  } catch (error) {
    console.error('TTS generation failed:', error);
    setTTSResult(turnId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'TTS failed',
    });
  }
}

// Helper: stitch blocks for prompt
function stitchContextBlocks(pack: any): string {
  const blocks = [];

  if (pack?.ainSnippets?.length > 0) {
    const snippets = pack.ainSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Recent threads\n${snippets}`);
  }

  if (pack?.soulSnippets?.length > 0) {
    const snippets = pack.soulSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Sacred moments\n${snippets}`);
  }

  if (pack?.uploads?.items?.length > 0) {
    const { formatUploadContextForPrompt } = require('@/lib/context/attachUploads');
    const uploadContext = formatUploadContextForPrompt(pack.uploads.items);
    if (uploadContext) blocks.push(uploadContext);
  }

  if (pack?.facetHints && Object.keys(pack.facetHints).length > 0) {
    const hints = Object.entries(pack.facetHints)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Facet hints\n${hints}`);
  }

  if (pack?.micropsi?.driveVector) {
    const drives = Object.entries(pack.micropsi.driveVector)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Active drives\n${drives}`);
  }

  return blocks.join('\n\n');
}

async function postHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TurnRequest = await request.json();
    const { input, providers = DEFAULT_PROVIDERS, meta } = body;

    if (process.env.NODE_ENV === 'development' && meta?.source === 'voice') {
      console.info('[voice→turn] received', {
        textLength: input.text?.length,
        providers: Object.keys(providers || {}),
        conversationId: input.context?.conversationId,
      });
    }

    if (!input?.text?.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    const conversationId =
      input.context?.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ——— Auth (used later for prefs/memory/events) ———
    let userId = 'anonymous';
    let authenticatedUser: any = null;
    let supabase: any = null;
    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        authenticatedUser = user;
      }
    } catch (error) {
      console.warn('Failed to get user for context:', error);
    }

    // ——— Context pack (MicroPsi) ———
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

    // ——— Providers ———
    const providerResults: any = {};
    const activeProviders: string[] = [];

    // 1) Sesame
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
        providerResults.sesame = { intent: 'general', entities: [], needsSpecialist: false };
      }
    }

    // 2) PSI & 3) AIN (parallel)
    const psiPromise = providers.psi
      ? (async () => {
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
        })()
      : Promise.resolve();

    const ainPromise = providers.ain
      ? (async () => {
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
        })()
      : Promise.resolve();

    await Promise.all([psiPromise, ainPromise]);

    // 4) Oracle2 (conditional)
    const needsSpecialist =
      providerResults.sesame?.needsSpecialist || input.text.toLowerCase().includes('oracle');

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

    // 5) Claude (primary, modulated)
    const useClaudePrimary = process.env.USE_CLAUDE === 'true';
    const demoDisabled = process.env.DEMO_PIPELINE_DISABLED === 'true';

    if (providers.claude !== false && useClaudePrimary) {
      try {
        const baseTemp = 0.7;
        const temperature = micropsiModulation?.temperature ?? baseTemp;
        const maxTokens = Math.round(600 + (micropsiModulation?.depthBias ?? 0.55) * 200);

        const { generateClaudeResponse } = await import('@/lib/providers/air');
        providerResults.claude = await generateClaudeResponse({
          text: input.text,
          context: {
            ...input.context,
            contextBlocks: contextPack ? stitchContextBlocks(contextPack) : undefined,
          },
          sesameAnalysis: contextPack?.nlu || providerResults.sesame,
          psiAnalysis: contextPack?.psi || providerResults.psi,
          ainContext: contextPack?.ainSnippets || providerResults.ain,
          oracle2Response: providerResults.oracle2,
          conversationId,
          maxTokens,
          temperature,
          topP: 0.95,
          conversationalMode: true,
          micropsiModulation: contextPack?.micropsi,
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

    // ——— Synthesize draft ———
    let draftResponse =
      providerResults.claude?.text ||
      providerResults.oracle2?.text ||
      "I'm not able to process that request right now.";

    // 6) Sacred synthesis
    let sacredSynthesis: any = null;
    if (!demoDisabled) {
      try {
        const { synthesizeSacredResponse } = await import('@/lib/providers/sacred');
        sacredSynthesis = await synthesizeSacredResponse({
          draft: draftResponse,
          nlu: contextPack?.nlu || providerResults.sesame,
          psi: contextPack?.psi || providerResults.psi,
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

    // ——— MAYA (no dependency on dualMemoryResult) ———
    let finalResponse = draftResponse;
    let greetingApplied = false;
    let greetingText = '';
    let validationResult: any = null;

    try {
      const { generateFirstTurnGreeting } = await import('@/lib/greetings');
      const { createConversationalValidator } = await import('@/lib/validators/conversational');
      const { MayaPromptProcessor } = await import('@/lib/shared/maya/mayaSystemPrompt');

      // Greeting (first-turn heuristic)
      const greetingContext = {
        userId,
        conversationId,
        archetypeHint: providerResults.sesame?.spiralogic?.archetypeHints?.[0]?.name,
        soulPhase: undefined, // dual memory not yet written
        sentiment: providerResults.sesame?.conversationFlow?.sentiment,
        userInput: input.text,
        messageCount: undefined,
        themeExchangeCount: undefined,
      };
      const maybeGreeting = await generateFirstTurnGreeting(greetingContext);

      if (maybeGreeting) {
        greetingApplied = true;
        greetingText = maybeGreeting;
        const connector = Math.random() < 0.3 ? ' So, ' : ' ';
        finalResponse = maybeGreeting + connector + finalResponse;
      }

      // Maya authenticity/wisdom pass — **no** dualMemoryResult usage here
      const mayaContext = {
        spiralogicPhase: (providerResults.psi?.elementRecommendation || 'air') as any,
        archetypeDetected: providerResults.sesame?.spiralogic?.archetypeHints?.[0]?.name || 'guide',
        userProjectionLevel: 'low' as any,
        dependencyRisk: false,
        shadowWorkIndicated: false, // was using dualMemoryResult; decoupled to break cycle
      };
      const mayaResponse = MayaPromptProcessor.applyMayaFramework(finalResponse, mayaContext);
      finalResponse = mayaResponse.content;

      // Conversational validation
      const validator = createConversationalValidator();
      const validation = await validator.validate(finalResponse, input.text);
      validationResult = validation;

      if (validation.valid || process.env.ATTENDING_ENFORCEMENT_MODE === 'relaxed') {
        finalResponse = validation.text;
      }

      if (process.env.NODE_ENV === 'development') {
        if (maybeGreeting) console.log('Applied greeting:', maybeGreeting.slice(0, 80) + '...');
        if (validation.corrections?.length > 0) {
          console.log('Conversational validation:', {
            corrections: validation.corrections,
            metadata: validation.metadata,
          });
        }
      }
    } catch (error) {
      console.warn('Maya processing failed:', error);
    }

    // ——— Actions ———
    const actions: any[] = [];
    if (providerResults.sesame?.suggestedPage) {
      actions.push({ type: 'navigate', payload: { page: providerResults.sesame.suggestedPage } });
    }
    if (providerResults.psi?.elementRecommendation) {
      actions.push({ type: 'element_focus', payload: { element: providerResults.psi.elementRecommendation } });
    }

    // ——— User preferences & TTS ———
    let userPreferences: any = null;
    let audioPending = false;
    let turnId: string | null = null;

    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try oracle_preferences first, fallback to user_preferences
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
            oraclePrefs = userPrefs || null;
          }

          userPreferences = oraclePrefs;

          if (userPreferences?.tts_enabled && userPreferences?.voice_id) {
            turnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            audioPending = true;
            // fire-and-forget
            generateTTSInBackground(turnId, finalResponse, userPreferences);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch user preferences:', error);
    }

    // ——— Dual memory write (now that finalResponse is ready) ———
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
          },
          privacy: { never_quote: false, redacted: false },
        });

        if (process.env.NODE_ENV === 'development' && dualMemoryResult?.enrichment) {
          console.log('Memory enriched:', {
            soulMemoryId: dualMemoryResult.soulMemoryId,
            sacredMoment: dualMemoryResult.enrichment.sacredMoment,
            archetypes: dualMemoryResult.enrichment.archetypes?.length || 0,
            shadowScore: dualMemoryResult.enrichment.shadowScore,
          });
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

    // ——— Beta events (safe to reference dualMemoryResult now) ———
    if (authenticatedUser) {
      try {
        await emitBetaEventServer(authenticatedUser.id, 'oracle_turn', {
          conversationId,
          responseLength: finalResponse.length,
          sacredDetected: !!sacredSynthesis?.text,
          shadowScore: dualMemoryResult?.enrichment?.shadowScore || 0,
        });

        if (sacredSynthesis?.text && contextPack?.ainSnippets?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'weave_created', {
            conversationId,
            threadCount: contextPack.ainSnippets.length,
            synthesisStrength: 0.8,
          });
        }

        if ((dualMemoryResult?.enrichment?.shadowScore ?? 0) >= 0.7) {
          await emitBetaEventServer(authenticatedUser.id, 'shadow_safe', {
            conversationId,
            shadowScore: dualMemoryResult.enrichment.shadowScore,
            category: 'conversation',
          });
        }

        if (sacredSynthesis?.text && contextPack?.ainSnippets?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'graduation_offer_shown', {
            conversationId,
            trigger: 'thread_weave_completion',
          });
        }

        if (contextPack?.uploads?.items?.length > 0) {
          await emitBetaEventServer(authenticatedUser.id, 'upload_context_used', {
            conversationId,
            upload_count: contextPack.uploads.items.length,
            mentioned_explicitly: contextPack.uploads.mentioned,
            keywords: contextPack.uploads.keywords,
          });
        }

        // Soul save event AFTER dual memory stored
        if (dualMemoryResult?.soulMemoryId) {
          await emitBetaEventServer(authenticatedUser.id, 'soul_save', {
            conversationId,
            soulMemoryId: dualMemoryResult.soulMemoryId,
            sacredMoment: dualMemoryResult.enrichment?.sacredMoment || false,
            shadowScore: dualMemoryResult.enrichment?.shadowScore || 0,
          });
        }
      } catch (error) {
        console.warn('Beta event emission failed:', error);
      }
    }

    // ——— Training metrics (non-blocking) ———
    if (process.env.TRAINING_ENABLED === 'true' && Math.random() < Number(process.env.TRAINING_SAMPLE_RATE || '0.20')) {
      try {
        const crypto = await import('crypto');
        const userSalt = process.env.TRAINING_USER_SALT || 'default_salt_change_in_production';
        const userHash = crypto
          .createHash('sha256')
          .update((userId || 'anonymous') + userSalt)
          .digest('hex')
          .substring(0, 16);

        const redactContent = (content: string, maxLength: number = 100): string => {
          let redacted = content
            .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]')
            .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
            .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
          if (redacted.length > maxLength) redacted = redacted.substring(0, maxLength) + '...';
          return redacted;
        };

        const determineAgent = (): 'claude' | 'sacred' | 'micropsi' => {
          if (sacredSynthesis?.text) return 'sacred';
          if (contextPack?.micropsi) return 'micropsi';
          return 'claude';
        };

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
              meaning: contextPack?.micropsi?.driveVector?.meaning,
            },
          },
        };

        fetch('/api/training/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trainingRequest),
        }).catch(() => {});
      } catch (error) {
        console.warn('Training metrics collection failed:', error);
      }
    }

    // ——— Response ———
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
        pipeline: {
          demoDisabled,
          claudePrimary: useClaudePrimary,
          greetingEnabled: process.env.MAYA_GREETING_ENABLED === 'true',
          greetingApplied,
          greetingText: greetingApplied ? greetingText : undefined,
          validationMode: process.env.ATTENDING_ENFORCEMENT_MODE || 'strict',
          sentenceLimits: {
            min: Number(process.env.TURN_MIN_SENTENCES) || 2,
            max: Number(process.env.TURN_MAX_SENTENCES) || 7,
          },
          validation: validationResult
            ? {
                valid: validationResult.valid,
                corrections: validationResult.corrections,
                metadata: validationResult.metadata,
              }
            : undefined,
        },
        micropsi: contextPack?.micropsi,
        context: contextPack
          ? {
              ain: contextPack.ainSnippets?.length || 0,
              soul: contextPack.soulSnippets?.length || 0,
              facets: Object.keys(contextPack.facetHints || {}).length,
              uploads: contextPack.uploads
                ? {
                    count: contextPack.uploads.items.length,
                    mentioned: contextPack.uploads.mentioned,
                    keywords: contextPack.uploads.keywords,
                  }
                : undefined,
            }
          : undefined,
        flags: {
          conversationalMode:
            FLAGS.DEMO_PIPELINE_DISABLED &&
            FLAGS.USE_CLAUDE &&
            FLAGS.ATTENDING_ENFORCEMENT_MODE === 'relaxed' &&
            FLAGS.MAYA_GREETING_ENABLED,
          ...FLAGS,
        },
      },
      turnMeta: dualMemoryResult
        ? {
            sacredDetected: dualMemoryResult.enrichment?.sacredMoment || false,
            shadowScore: dualMemoryResult.enrichment?.shadowScore || 0,
            archetypeHint: dualMemoryResult.enrichment?.archetypes?.[0]?.name,
            facetHints: [
              ...(providerResults.psi?.elementRecommendation ? [providerResults.psi.elementRecommendation] : []),
              ...(providerResults.sesame?.spiralogic?.archetypeHints?.map((h: any) => h.name) || []),
            ],
            soulMemoryId: dualMemoryResult.soulMemoryId,
            soulPhase: dualMemoryResult.enrichment?.soulPhase,
            confidence: providerResults.claude?.confidence || 0.8,
          }
        : undefined,
      debug:
        process.env.NODE_ENV === 'development'
          ? {
              sesameResponse: providerResults.sesame,
              claudeResponse: providerResults.claude,
              oracle2Response: providerResults.oracle2,
              psiAnalysis: providerResults.psi,
              ainContext: providerResults.ain,
            }
          : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Oracle Turn API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Something went wrong',
      },
      { status: 500 }
    );
  }
}

export const POST = withTraceNext(postHandler);

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