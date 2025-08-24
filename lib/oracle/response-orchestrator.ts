export interface OrchestrationConfig {
  providers: any;
  input: any;
  conversationId: string;
  contextPack: any;
  micropsiModulation?: any;
}

export interface OrchestrationResult {
  providerResults: any;
  activeProviders: string[];
  actions: any[];
}

export async function orchestrateProviders(config: OrchestrationConfig): Promise<OrchestrationResult> {
  const { providers, input, conversationId, contextPack, micropsiModulation } = config;
  const providerResults: any = {};
  const activeProviders: string[] = [];
  const actions: any[] = [];

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
      providerResults.sesame = { intent: 'general', context: {} };
    }
  }

  // 2. CLAUDE/AIR - Enhanced conversational AI
  if (providers.claude !== false) {
    try {
      const { generateClaudeResponse } = await import('@/lib/providers/air');
      const claudeResult = await generateClaudeResponse({
        text: input.text,
        context: input.context,
        conversationId,
        contextPack,
        micropsiModulation,
      });
      providerResults.claude = claudeResult;
      activeProviders.push('claude');
      
      if (claudeResult.actions?.length > 0) {
        actions.push(...claudeResult.actions);
      }
    } catch (error) {
      console.warn('Claude provider failed:', error);
    }
  }

  // 3. PSI - Psychological insights
  if (providers.psi !== false) {
    try {
      const { analyzePSI } = await import('@/lib/providers/psi');
      providerResults.psi = await analyzePSI({
        text: input.text,
        context: input.context,
      });
      activeProviders.push('psi');
    } catch (error) {
      console.warn('PSI provider failed:', error);
    }
  }

  // 4. AIN - Advanced Intelligence Network
  if (providers.ain !== false) {
    try {
      const { retrieveAINContext, storeAINMemory } = await import('@/lib/providers/ain');
      const ainContext = await retrieveAINContext({
        text: input.text,
        userId: input.context?.userId,
        conversationId,
      });
      providerResults.ain = ainContext;
      activeProviders.push('ain');
    } catch (error) {
      console.warn('AIN provider failed:', error);
    }
  }

  // 5. SACRED - Sacred intelligence synthesis
  if (providers.sacred !== false) {
    try {
      const { synthesizeSacredResponse } = await import('@/lib/providers/sacred');
      const sacredResult = await synthesizeSacredResponse({
        input: input.text,
        providerResults,
        contextPack,
        conversationId,
      });
      providerResults.sacred = sacredResult;
      activeProviders.push('sacred');
    } catch (error) {
      console.warn('Sacred provider failed:', error);
    }
  }

  return { providerResults, activeProviders, actions };
}

export interface TurnResponse {
  text: string;
  conversationId: string;
  providers: string[];
  confidence: number;
  processingTime: number;
  actions?: any[];
  audio?: {
    pending: boolean;
    turnId?: string;
  };
  meta?: any;
}

export function assembleResponse(
  finalResponse: string,
  metadata: {
    providers: string[];
    confidence: number;
    processingTime: number;
    conversationId: string;
    actions?: any[];
    audioPending?: boolean;
    turnId?: string | null;
  },
  turnMeta?: any,
  debug?: any
): TurnResponse {
  return {
    text: finalResponse,
    conversationId: metadata.conversationId,
    providers: metadata.providers,
    confidence: metadata.confidence,
    processingTime: metadata.processingTime,
    actions: metadata.actions?.length > 0 ? metadata.actions : undefined,
    audio: metadata.audioPending ? {
      pending: true,
      turnId: metadata.turnId || null,
    } : undefined,
    meta: turnMeta,
  };
}