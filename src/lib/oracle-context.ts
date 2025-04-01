import { createClient } from '@supabase/supabase-js';
import type { Memory, MemoryBlock } from './types';

export class OracleContextBuilder {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async buildContext(userId: string): Promise<string> {
    try {
      // Fetch memory blocks
      const { data: blocks, error: blocksError } = await this.supabase
        .from('memory_blocks')
        .select('label, value, type, importance')
        .eq('user_id', userId)
        .order('importance', { ascending: false })
        .limit(5);

      if (blocksError) throw blocksError;

      // Fetch recent memories
      const { data: memories, error: memoriesError } = await this.supabase
        .from('memories')
        .select('content, type, metadata, strength')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (memoriesError) throw memoriesError;

      let context = '🧠 Oracle Memory Context:\n\n';

      // Add memory blocks
      if (blocks && blocks.length > 0) {
        context += '📌 Key Memory Blocks:\n';
        context += blocks
          .map(block => `- (${block.label}) ${block.value}`)
          .join('\n');
        context += '\n\n';
      }

      // Add recent memories
      if (memories && memories.length > 0) {
        context += '💭 Recent Memories:\n';
        context += memories
          .map(memory => `- [${memory.type}] ${memory.content}`)
          .join('\n');
        context += '\n\n';
      }

      context += 'Use this context to provide personalized guidance and maintain continuity in the conversation.';

      return context;
    } catch (error) {
      console.error('Failed to build Oracle context:', error);
      return 'Unable to access memory context. Proceeding with base guidance.';
    }
  }

  async updateContextWithInsight(
    userId: string,
    insight: string,
    importance = 5
  ): Promise<void> {
    try {
      // Store as memory block
      await this.supabase
        .from('memory_blocks')
        .insert({
          user_id: userId,
          label: 'Insight',
          value: insight,
          type: 'insight',
          importance
        });

      // Store as memory
      await this.supabase
        .from('memories')
        .insert({
          user_id: userId,
          content: insight,
          type: 'insight',
          metadata: { source: 'oracle', importance },
          strength: importance / 10
        });
    } catch (error) {
      console.error('Failed to update context with insight:', error);
      throw error;
    }
  }

  async getTopInsights(userId: string, limit = 3): Promise<MemoryBlock[]> {
    const { data, error } = await this.supabase
      .from('memory_blocks')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'insight')
      .order('importance', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}