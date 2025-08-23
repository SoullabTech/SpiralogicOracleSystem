// Soul Memory Client - API-based interface for soul memory operations

export interface MemoryEntry {
  id: string;
  content: string;
  metadata?: {
    sessionId?: string;
    conversationId?: string;
    redacted?: boolean;
    never_quote?: boolean;
    shadow_score?: number;
  };
  created_at: string;
}

export interface MemoryRetrievalOptions {
  limit?: number;
  offset?: number;
  filterSensitive?: boolean;
}

/**
 * Client-side interface for soul memory operations
 * Uses API endpoints instead of direct backend imports
 */
export class SoulMemoryClient {
  /**
   * Get recent memories for a user with conversation filtering
   */
  static async retrieveConversationMemories(
    userId: string,
    conversationId: string,
    options: MemoryRetrievalOptions = {}
  ): Promise<MemoryEntry[]> {
    const response = await fetch('/api/soul-memory/retrieve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        conversationId,
        ...options,
      }),
    });

    if (!response.ok) {
      console.warn('Soul memory retrieval failed, returning empty array');
      return [];
    }

    const data = await response.json();
    return data.memories || [];
  }

  /**
   * Get or create a memory system for a user
   */
  static async initializeUserMemory(userId: string): Promise<{ initialized: boolean }> {
    const response = await fetch('/api/soul-memory/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return { initialized: false };
    }

    return response.json();
  }

  /**
   * Store a bookmark for later retrieval
   */
  static async storeBookmark(params: {
    userId: string;
    content: string;
    context?: any;
  }): Promise<{ id: string }> {
    const response = await fetch('/api/soul-memory/bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Bookmark storage failed: ${response.statusText}`);
    }

    return response.json();
  }
}