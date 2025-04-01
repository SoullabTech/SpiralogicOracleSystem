import { createClient } from '@supabase/supabase-js';
import type { Memory } from '../types';

export class MemorySaver {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async saveOracleInsight(userId: string, insight: string, options: {
    importance?: number;
    type?: string;
    metadata?: Record<string, any>;
  } = {}): Promise<void> {
    try {
      // Save as memory block
      const { error: blockError } = await this.supabase
        .from('memory_blocks')
        .insert({
          user_id: userId,
          label: 'Oracle Insight',
          value: insight,
          importance: options.importance || 7,
          type: options.type || 'oracle-note',
          metadata: options.metadata || {}
        });

      if (blockError) throw blockError;

      // Save as memory for connection analysis
      const { error: memoryError } = await this.supabase
        .from('memories')
        .insert({
          user_id: userId,
          content: insight,
          type: 'insight',
          metadata: {
            source: 'oracle',
            ...options.metadata
          },
          strength: (options.importance || 7) / 10
        });

      if (memoryError) throw memoryError;
    } catch (error) {
      console.error('Failed to save memory:', error);
      throw new Error('Failed to save Oracle insight to memory');
    }
  }

  async getRecentInsights(userId: string, limit = 5): Promise<Memory[]> {
    const { data, error } = await this.supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'insight')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async analyzeAndConnect(userId: string, newInsight: string): Promise<void> {
    try {
      // Get recent insights for comparison
      const recentInsights = await this.getRecentInsights(userId);
      
      // Find potential connections based on content similarity
      const connections = recentInsights.filter(insight => 
        this.calculateSimilarity(newInsight, insight.content) > 0.3
      );

      // Create connections in the memory_connections table
      for (const connection of connections) {
        const { error } = await this.supabase
          .from('memory_connections')
          .insert({
            source_memory_id: connection.id,
            target_memory_id: connection.id,
            strength: this.calculateSimilarity(newInsight, connection.content)
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to analyze and connect memories:', error);
      // Don't throw here - connection creation is non-critical
    }
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple word overlap similarity for now
    const words1 = new Set(text1.toLowerCase().split(' '));
    const words2 = new Set(text2.toLowerCase().split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }
}

// Create singleton instance
export const memorySaver = new MemorySaver();