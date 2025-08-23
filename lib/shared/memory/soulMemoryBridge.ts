// Soul Memory Bridge - Client-side interface for memory operations

export interface DualMemoryParams {
  userId: string;
  conversationId: string;
  text: string;
  response: string;
  meta?: {
    element?: string;
    emotionalTone?: number;
    preferences?: {
      agent_name?: string;
      voice_id?: string;
    };
  };
  privacy?: {
    never_quote: boolean;
    redacted: boolean;
  };
}

export interface DualMemoryResult {
  soulMemoryId?: string;
  ainMemoryId?: string;
  enrichment?: {
    sacredMoment?: string;
    archetypes?: any[];
    shadowScore?: number;
  };
}

/**
 * Client-side bridge function to write to dual memory systems
 * This should be called via API routes, not directly importing backend modules
 */
export async function writeDualMemory(params: DualMemoryParams): Promise<DualMemoryResult> {
  // This should be replaced with an API call in production
  // For now, provide a client-safe interface
  const response = await fetch('/api/soul-memory/write', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Memory write failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Record an AIN bridge exchange - simplified interface
 */
export async function recordAINBridgeExchange(params: {
  userId: string;
  conversationId: string;
  ainId?: string;
  text: string;
  metadata?: any;
}): Promise<{ id: string }> {
  const response = await fetch('/api/soul-memory/record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    // Graceful fallback for development
    return { id: `tmp_${Date.now()}` };
  }

  return response.json();
}