export interface MayaContext {
  userId?: string;
  conversationId: string;
  archetypeHint?: string;
  soulPhase?: string;
  sentiment?: string;
  userInput: string;
  messageCount?: number;
  themeExchangeCount?: number;
}

export interface MayaResult {
  finalResponse: string;
  greetingApplied: boolean;
  greetingText: string;
  validationResult: any;
}

export async function processWithMaya(
  draftResponse: string,
  context: MayaContext,
  providerResults: any,
  micropsiModulation?: any
): Promise<MayaResult> {
  try {
    const { applyGreeting } = await import('@/lib/greetings');
    const { validateConversational } = await import('@/lib/validators/conversational');
    
    // Apply Maya greeting logic
    const { response: greetedResponse, applied, greetingText } = await applyGreeting(
      draftResponse,
      {
        userId: context.userId,
        conversationId: context.conversationId,
        userInput: context.userInput,
        mode: process.env.MAYA_MODE_DEFAULT || 'conversational'
      }
    );

    // Conversational validation
    const validationResult = await validateConversational(greetedResponse, {
      userInput: context.userInput,
      micropsiModulation,
      sentiment: context.sentiment
    });

    return {
      finalResponse: greetedResponse,
      greetingApplied: applied,
      greetingText: greetingText || '',
      validationResult
    };
  } catch (error) {
    console.warn('Maya processing failed:', error);
    return {
      finalResponse: draftResponse,
      greetingApplied: false,
      greetingText: '',
      validationResult: null
    };
  }
}