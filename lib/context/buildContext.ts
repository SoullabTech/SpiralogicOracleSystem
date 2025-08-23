import { soulMemoryClient } from '../services/soul-memory-client';
import { getRecentUploadContext, UploadContextItem, detectUploadReferences } from './attachUploads';

export type ContextPack = {
  ainSnippets: Array<{ id: string; text: string; ts: number }>;
  soulSnippets: Array<{ id: string; text: string; ts: number; meta?: any }>;
  facetHints: Record<string, number>;
  nlu: {
    intent?: string;
    entities?: Array<{ type: string; value: string }>;
    sentiment?: { valence: number; arousal: number };
    topics?: string[];
  };
  psi: {
    userState?: any;
    recs?: string[];
    elementRecommendation?: string;
    mood?: number;
    socialNeed?: number;
  };
  micropsi?: {
    driveVector?: Record<string, number>;
    affect?: { valence: number; arousal: number; confidence: number };
    modulation?: { temperature?: number; depthBias?: number; inviteCount?: 1 | 2 };
  };
  uploads?: {
    items: UploadContextItem[];
    mentioned: boolean;
    keywords: string[];
  };
};

export async function buildContextPack({
  userId,
  text,
  conversationId,
  topK = {
    ain: Number(process.env.CONTEXT_AIN_TOPK ?? 6),
    soul: Number(process.env.CONTEXT_SOUL_TOPK ?? 6),
    facet: Number(process.env.CONTEXT_FACET_TOPK ?? 8),
  }
}: {
  userId: string;
  text: string;
  conversationId?: string;
  topK?: any;
}): Promise<ContextPack> {
  // Parallel recalls with time budget
  const budget = Number(process.env.CONTEXT_SEMANTIC_TIMEOUT_MS ?? 300);
  const withTimeout = <T>(p: Promise<T>) =>
    Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve([] as any), budget))]);

  const [ainSnippets, soulSnippets, facetHints, nlu, psi, uploadContext] = await Promise.all([
    // AIN recall
    withTimeout(readNearbyMemories(userId, text, topK.ain)),
    // Soul Memory semantic recall
    withTimeout(soulMemoryClient.search(userId, text, topK.soul)),
    // Trait hints
    withTimeout(getFacetVectorForUser(userId, topK.facet)),
    // NLU processing
    processSesameInput({ text, context: { conversationId } }),
    // Personal tendencies/state
    analyzePSI({ text, context: { userId, conversationId } }),
    // Upload context
    withTimeout(getRecentUploadContext(userId, conversationId, 3))
  ]);

  // MicroPsi/Bach appraisal → conversational modulation
  let micropsiOut: ContextPack['micropsi'] = undefined;
  if (process.env.USE_MICROPSI_BACH === 'true') {
    const { micropsi } = await import('../psi/micropsiBach');
    micropsiOut = await micropsi.appraise({
      text,
      nlu,
      psi,
      facetHints,
      history: [...ainSnippets, ...soulSnippets].slice(0, 10)
    });
  }

  // Analyze upload references in user message
  const uploadReferences = detectUploadReferences(text);

  return {
    ainSnippets,
    soulSnippets,
    facetHints,
    nlu,
    psi,
    micropsi: micropsiOut,
    uploads: uploadContext.length > 0 ? {
      items: uploadContext,
      mentioned: uploadReferences.mentioned,
      keywords: uploadReferences.keywords
    } : undefined
  };
}

// Helper imports - these would come from your existing providers
async function readNearbyMemories(userId: string, text: string, topK: number): Promise<any[]> {
  try {
    const { retrieveAINContext } = await import('../providers/ain');
    const result = await retrieveAINContext({ text, context: { userId }, conversationId: '' });
    return result.relevantMemories || [];
  } catch (error) {
    console.warn('AIN recall failed:', error);
    return [];
  }
}

async function getFacetVectorForUser(userId: string, topK: number): Promise<Record<string, number>> {
  try {
    // Mock implementation - replace with your actual facet reading
    const facets = ['fire', 'water', 'earth', 'air', 'aether', 'shadow'];
    const vector: Record<string, number> = {};
    facets.forEach(f => {
      vector[f] = Math.random() * 0.8 + 0.2;
    });
    return vector;
  } catch (error) {
    console.warn('Facet vector failed:', error);
    return {};
  }
}

async function processSesameInput(params: any) {
  try {
    const { processSesameInput } = await import('../providers/sesame');
    const result = await processSesameInput(params);
    return {
      intent: result.intent,
      entities: result.entities,
      sentiment: result.sentiment || { valence: 0.5, arousal: 0.5 },
      topics: result.topics || []
    };
  } catch (error) {
    console.warn('Sesame NLU failed:', error);
    return {};
  }
}

async function analyzePSI(params: any) {
  try {
    const { analyzePSI } = await import('../providers/psi');
    const result = await analyzePSI(params);
    return {
      userState: result.userState,
      recs: result.recommendations || [],
      elementRecommendation: result.elementRecommendation,
      mood: result.mood || 0.5,
      socialNeed: result.socialNeed || 0.5
    };
  } catch (error) {
    console.warn('PSI analysis failed:', error);
    return {};
  }
}