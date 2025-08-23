// Frontend-safe Soul Memory client that uses API instead of direct backend import
import { ISoulMemoryService, SoulMemorySearchResult } from '@/shared/types/soul-memory';

export class SoulMemoryClient implements ISoulMemoryService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/soul-memory') {
    this.apiUrl = apiUrl;
  }

  async search(userId: string, query: string, limit: number = 6): Promise<SoulMemorySearchResult[]> {
    try {
      const response = await fetch(`${this.apiUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          query,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`Soul Memory search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.warn('Soul Memory search error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const soulMemoryClient = new SoulMemoryClient();