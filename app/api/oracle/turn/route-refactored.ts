// Oracle Turn API - Refactored with extracted modules
import { NextRequest, NextResponse } from 'next/server';
import { withTraceNext } from '../_middleware/traceNext';
import { orchestrateProviders, assembleResponse, type TurnResponse } from '@/lib/oracle/response-orchestrator';
import { buildUnifiedContext } from '@/lib/oracle/context-orchestrator';
import { getUserInfo } from '@/lib/oracle/user-manager';
import { setupTTSForUser } from '@/lib/oracle/tts-manager';

// Runtime flags
const DEFAULT_PROVIDERS = {
  sesame: true,
  claude: process.env.USE_CLAUDE === 'true',
  oracle2: false,
  psi: true,
  ain: true,
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

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getDraftResponse(providerResults: any): string {
  return providerResults.claude?.response?.text || 
         providerResults.sacred?.response ||
         providerResults.sesame?.response ||
         "I understand you're reaching out. Let me reflect on this...";
}

async function postHandler(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const body: TurnRequest = await request.json();
    const { input, providers = DEFAULT_PROVIDERS, meta } = body;
    
    // Validation
    if (!input?.text?.trim()) {
      return NextResponse.json(
        { error: 'Input text is required' }, 
        { status: 400 }
      );
    }

    // Setup
    const conversationId = input.context?.conversationId || generateConversationId();
    const userInfo = await getUserInfo();
    const contextPack = await buildUnifiedContext(userInfo.userId, input.text, conversationId);
    
    // Provider orchestration
    const { providerResults, activeProviders, actions } = await orchestrateProviders({
      providers,
      input,
      conversationId,
      contextPack,
      micropsiModulation: contextPack?.micropsi?.modulation
    });

    // Get draft response
    let finalResponse = getDraftResponse(providerResults);

    // Maya processing (if enabled)
    if (process.env.MAYA_GREETING_ENABLED === 'true') {
      try {
        const { processWithMaya } = await import('@/lib/oracle/maya-processor');
        const { finalResponse: mayaResponse } = await processWithMaya(
          finalResponse,
          { userId: userInfo.userId, conversationId, userInput: input.text },
          providerResults,
          contextPack?.micropsi?.modulation
        );
        finalResponse = mayaResponse;
      } catch (error) {
        console.warn('Maya processing failed:', error);
      }
    }

    // TTS setup
    const { audioPending, turnId } = await setupTTSForUser(
      userInfo.userId, 
      finalResponse, 
      conversationId
    );

    // Background tasks (fire and forget)
    Promise.all([
      // Memory storage
      import('@/lib/oracle/memory-manager').then(({ storeTurnMemory }) =>
        storeTurnMemory({
          userId: userInfo.userId,
          conversationId,
          text: input.text,
          response: finalResponse,
          meta: { providers: activeProviders, actions }
        }, providerResults.claude?.shouldRemember !== false)
      ),
      // Beta events
      import('@/lib/oracle/beta-events').then(({ emitOracleTurnEvents }) =>
        emitOracleTurnEvents(
          userInfo.authenticatedUser,
          conversationId,
          finalResponse,
          providerResults.sacred,
          contextPack,
          null
        )
      ),
      // Training metrics
      import('@/lib/oracle/training-collector').then(({ collectTrainingMetrics }) =>
        collectTrainingMetrics(
          userInfo.userId,
          conversationId,
          input.text,
          finalResponse,
          contextPack,
          providerResults.sacred
        )
      )
    ]).catch(error => {
      console.warn('Background task failed:', error);
    });

    // Response assembly
    const response = assembleResponse(finalResponse, {
      providers: activeProviders,
      confidence: providerResults.claude?.confidence || 0.8,
      processingTime: Date.now() - startTime,
      conversationId,
      actions,
      audioPending,
      turnId
    });

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