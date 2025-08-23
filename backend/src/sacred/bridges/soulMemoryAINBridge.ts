import { SoulMemory } from '../../services/soulMemoryService';

export async function recordAINBridgeExchange(params: {
  userId: string;
  conversationId: string;
  ainId?: string;
  text: string;
  metadata?: any;
}) {
  // Delegate to SoulMemory (singleton). Safe no-op if storage not initialized yet.
  try {
    return await SoulMemory.recordExchange({
      userId: params.userId,
      conversationId: params.conversationId,
      ainId: params.ainId,
      text: params.text,
      metadata: params.metadata,
    });
  } catch {
    return { id: `tmp_${Date.now()}` };
  }
}
