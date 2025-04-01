import { createClient } from '@supabase/supabase-js';

interface MemoryBlock {
  user_id: string;
  label: string;
  value: string;
  importance?: number;
  type?: string;
}

export class MemoryBlockStore {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async storeMemoryBlock(block: MemoryBlock): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('memory_blocks')
        .insert({
          user_id: block.user_id,
          label: block.label,
          value: block.value,
          importance: block.importance || 5,
          type: block.type || 'insight'
        });

      if (error) {
        console.error('Memory block store failed:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store memory block:', error);
      throw error;
    }
  }

  async getMemoryBlocks(userId: string, options: {
    type?: string;
    minImportance?: number;
    limit?: number;
  } = {}): Promise<MemoryBlock[]> {
    try {
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

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Memory block retrieval failed:', error.message);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get memory blocks:', error);
      throw error;
    }
  }

  async updateMemoryBlock(blockId: string, updates: Partial<MemoryBlock>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('memory_blocks')
        .update(updates)
        .eq('id', blockId);

      if (error) {
        console.error('Memory block update failed:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update memory block:', error);
      throw error;
    }
  }

  async deleteMemoryBlock(blockId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('memory_blocks')
        .delete()
        .eq('id', blockId);

      if (error) {
        console.error('Memory block deletion failed:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete memory block:', error);
      throw error;
    }
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

// Export singleton instance
export const memoryBlockStore = new MemoryBlockStore();