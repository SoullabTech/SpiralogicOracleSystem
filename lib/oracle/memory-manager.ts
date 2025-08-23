export interface TurnMemoryInput {
  userId: string;
  conversationId: string;
  text: string;
  response: string;
  meta: {
    providers: string[];
    actions?: any[];
    [key: string]: any;
  };
}

export async function storeTurnMemory(
  input: TurnMemoryInput,
  shouldRemember: boolean = true
): Promise<any> {
  if (!shouldRemember) {
    return null;
  }

  try {
    const { enrichSoulMemory } = await import('@/lib/shared/memory/soulMemoryBridge');
    const { storeAINMemory } = await import('@/lib/providers/ain');
    
    // Store in soul memory system
    const soulMemoryResult = await enrichSoulMemory({
      userId: input.userId,
      conversationId: input.conversationId,
      userInput: input.text,
      oracleResponse: input.response,
      context: input.meta
    });

    // Store in AIN system  
    const ainMemoryResult = await storeAINMemory({
      userId: input.userId,
      conversationId: input.conversationId,
      interaction: {
        user: input.text,
        oracle: input.response,
        timestamp: new Date().toISOString(),
        providers: input.meta.providers
      }
    });

    return {
      soulMemory: soulMemoryResult,
      ainMemory: ainMemoryResult
    };
  } catch (error) {
    console.warn('Memory storage failed:', error);
    return null;
  }
}