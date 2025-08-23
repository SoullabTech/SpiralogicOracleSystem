// Enhanced Oracle Turn API with MicroPsi/Bach and unified context
import { NextRequest, NextResponse } from 'next/server';
import { buildContextPack } from '@/lib/context/buildContext';

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
  userId?: string; // For authenticated context
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TurnRequest = await request.json();
    const { input, providers = {}, meta } = body;
    
    if (!input?.text?.trim()) {
      return NextResponse.json(
        { error: 'Input text is required' },
        { status: 400 }
      );
    }

    // Get user info for context building
    let userId = body.userId || 'anonymous';
    let userDisplayName: string | undefined;
    
    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
      const { cookies } = await import('next/headers');
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userId = user.id;
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
      console.warn('Failed to fetch user info:', error);
    }

    const conversationId = input.context?.conversationId || 
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build unified context pack with all memory layers
    const pack = await buildContextPack({ 
      userId, 
      text: input.text, 
      conversationId 
    });

    // Log voice routing with context
    if (process.env.NODE_ENV === 'development' && meta?.source === 'voice') {
      console.info('[voice→turn] with context', { 
        textLength: input.text?.length,
        ainMemories: pack.ainSnippets.length,
        soulMemories: pack.soulSnippets.length,
        micropsi: pack.micropsi?.affect
      });
    }

    // MicroPsi modulation of Claude parameters
    const baseTemp = 0.7;
    const temperature = pack.micropsi?.modulation?.temperature ?? baseTemp;
    const maxTokens = Math.round(500 + (pack.micropsi?.modulation?.depthBias ?? 0.55) * 200);

    // Build context blocks for prompt
    const contextBlocks = [
      stitchMemories('Recent threads', pack.ainSnippets),
      stitchMemories('Sacred moments', pack.soulSnippets),
      stitchFacetHints(pack.facetHints),
      stitchMicroPsiDrives(pack.micropsi?.driveVector)
    ].filter(Boolean).join('\n\n');

    // Generate with Claude using modulated parameters
    let draftResponse = '';
    if (process.env.USE_CLAUDE === 'true') {
      try {
        const { generateClaudeResponse } = await import('@/lib/providers/air');
        const claudeResult = await generateClaudeResponse({
          text: input.text,
          context: {
            ...input.context,
            contextBlocks,
            userName: userDisplayName || process.env.MAYA_FORCE_NAME || 'friend'
          },
          conversationId,
          temperature,
          maxTokens,
          topP: 0.95,
          conversationalMode: true,
          // Pass intelligence insights
          sesameAnalysis: pack.nlu,
          psiAnalysis: pack.psi,
          micropsiModulation: pack.micropsi
        });
        draftResponse = claudeResult.text;
      } catch (error) {
        console.warn('Claude generation failed:', error);
        draftResponse = "I'm experiencing a moment of disruption. Let me gather myself and try again.";
      }
    }

    // Sacred Intelligence synthesis with drive awareness
    let sacredText = draftResponse;
    if (process.env.DEMO_PIPELINE_DISABLED !== 'true') {
      try {
        const { synthesizeSacredResponse } = await import('@/lib/providers/sacred');
        const sacredResult = await synthesizeSacredResponse({
          draft: draftResponse,
          nlu: pack.nlu,
          psi: pack.psi,
          drives: pack.micropsi?.driveVector,
          conversational: true,
          context: input.context
        });
        if (sacredResult?.text) {
          sacredText = sacredResult.text;
        }
      } catch (error) {
        console.warn('Sacred synthesis failed:', error);
      }
    }

    // Maya greeting and voice application
    let finalResponse = sacredText;
    let greetingApplied = false;
    
    if (process.env.MAYA_GREETING_ENABLED === 'true' && isFirstTurn(conversationId)) {
      try {
        const { generateFirstTurnGreeting } = await import('@/lib/greetings');
        const greeting = await generateFirstTurnGreeting({
          userId,
          conversationId,
          archetypeHint: pack.facetHints ? Object.entries(pack.facetHints).sort((a,b) => b[1] - a[1])[0]?.[0] : undefined,
          sentiment: pack.nlu?.sentiment,
          userInput: input.text
        });
        
        if (greeting) {
          greetingApplied = true;
          const connector = Math.random() < 0.3 ? ' So, ' : ' ';
          finalResponse = greeting + connector + finalResponse;
        }
      } catch (error) {
        console.warn('Maya greeting failed:', error);
      }
    }

    // Conversational validation with MicroPsi-influenced invite count
    const invitesAllowed = pack.micropsi?.modulation?.inviteCount ?? 1;
    try {
      const { createConversationalValidator } = await import('@/lib/validators/conversational');
      const validator = createConversationalValidator({
        minSentences: Number(process.env.TURN_MIN_SENTENCES) || 4,
        maxSentences: Number(process.env.TURN_MAX_SENTENCES) || 12,
        maxInvites: invitesAllowed
      });
      
      const validation = await validator.validate(finalResponse, input.text);
      if (validation.valid || process.env.ATTENDING_ENFORCEMENT_MODE === 'relaxed') {
        finalResponse = validation.text;
      }
    } catch (error) {
      console.warn('Validation failed:', error);
    }

    // Dual memory write with enrichment
    let dualMemoryResult: any = null;
    try {
      const { writeDualMemory } = await import('@/lib/shared/memory/soulMemoryBridge');
      
      dualMemoryResult = await writeDualMemory({
        userId,
        conversationId,
        text: input.text,
        response: finalResponse,
        meta: {
          element: pack.psi?.elementRecommendation,
          nlu: pack.nlu,
          drives: pack.micropsi?.driveVector,
          affect: pack.micropsi?.affect
        },
        privacy: { 
          never_quote: false,
          redacted: false 
        }
      });
    } catch (error) {
      console.warn('Dual memory storage failed:', error);
    }

    const processingTime = Date.now() - startTime;

    // Build response with full metadata
    const response = {
      response: {
        text: finalResponse,
        audioPending: false,
        turnId: null,
        actions: buildActions(pack)
      },
      metadata: {
        providers: ['sesame', 'psi', 'micropsi', 'ain', 'soul', 'claude', 'sacred', 'maya'],
        confidence: pack.micropsi?.affect?.confidence || 0.8,
        processingTime,
        conversationId,
        elementRecommendation: pack.psi?.elementRecommendation,
        micropsi: pack.micropsi,
        context: {
          ain: pack.ainSnippets?.length,
          soul: pack.soulSnippets?.length,
          facets: Object.keys(pack.facetHints || {}).length
        },
        pipeline: {
          claudeTemp: temperature,
          claudeTokens: maxTokens,
          greetingApplied,
          invitesAllowed,
          validationMode: process.env.ATTENDING_ENFORCEMENT_MODE || 'strict'
        }
      },
      turnMeta: dualMemoryResult ? {
        sacredDetected: dualMemoryResult.enrichment?.sacredMoment || false,
        shadowScore: dualMemoryResult.enrichment?.shadowScore || 0,
        archetypeHint: dualMemoryResult.enrichment?.archetypes?.[0]?.name,
        facetHints: Object.keys(pack.facetHints || {}),
        soulMemoryId: dualMemoryResult.soulMemoryId,
        soulPhase: dualMemoryResult.enrichment?.soulPhase,
        confidence: pack.micropsi?.affect?.confidence || 0.8
      } : undefined
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

// Helper functions
function stitchMemories(label: string, rows?: Array<{text: string}>) {
  if (!rows?.length) return '';
  const body = rows.slice(0, 6).map(r => `• ${r.text}`).join('\n');
  return `## ${label}\n${body}`;
}

function stitchFacetHints(hints?: Record<string, number>) { 
  if (!hints) return '';
  const top = Object.entries(hints)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => `${k}:${v.toFixed(2)}`)
    .join(', ');
  return `## Facet hints\n${top}`;
}

function stitchMicroPsiDrives(drives?: Record<string, number>) {
  if (!drives) return '';
  const formatted = Object.entries(drives)
    .map(([k, v]) => `${k}:${v.toFixed(2)}`)
    .join(', ');
  return `## Active drives\n${formatted}`;
}

function isFirstTurn(conversationId?: string) { 
  return !conversationId || conversationId.includes('_0') || conversationId.includes('new');
}

function buildActions(pack: any) {
  const actions: any[] = [];
  
  // Element focus from PSI
  if (pack.psi?.elementRecommendation) {
    actions.push({
      type: 'element_focus',
      payload: { element: pack.psi.elementRecommendation }
    });
  }
  
  // Drive-based actions from MicroPsi
  if (pack.micropsi?.driveVector?.clarity > 0.7) {
    actions.push({
      type: 'journal_entry',
      payload: { prompt: 'clarity' }
    });
  }
  
  return actions;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    providers: {
      sesame: 'active',
      claude: 'active',
      psi: 'active',
      micropsi: process.env.USE_MICROPSI_BACH === 'true' ? 'active' : 'disabled',
      ain: 'active',
      soul: 'active',
      sacred: 'active',
      maya: 'active'
    },
    timestamp: new Date().toISOString()
  });
}