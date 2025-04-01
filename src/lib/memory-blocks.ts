import { createClient } from '@supabase/supabase-js';
import type { MemoryBlock } from '../types';

export class MemoryBlockManager {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async createMemoryBlock(block: Omit<MemoryBlock, 'id' | 'created_at' | 'updated_at'>): Promise<MemoryBlock> {
    const { data, error } = await this.supabase
      .from('memory_blocks')
      .insert(block)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMemoryBlocks(userId: string, options: {
    type?: string;
    minImportance?: number;
    limit?: number;
  } = {}): Promise<MemoryBlock[]> {
    let query = this.supabase
      .from('memory_blocks')
      .select('*')
      .eq('user_id', userId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.minImportance) {
      query = query.gte('importance', options.minImportance);
    }

    query = query.order('importance', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateMemoryBlock(id: string, updates: Partial<MemoryBlock>): Promise<MemoryBlock> {
    const { data, error } = await this.supabase
      .from('memory_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMemoryBlock(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('memory_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async subscribeToMemoryBlocks(
    userId: string,
    callback: (block: MemoryBlock) => void
  ): Promise<() => void> {
    const subscription = this.supabase
      .channel('memory_blocks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_blocks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as MemoryBlock)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}