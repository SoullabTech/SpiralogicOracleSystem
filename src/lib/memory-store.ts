import { createClient } from '@supabase/supabase-js';
import type { Memory } from './types';

export class MemoryStore {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async storeMemory(memory: Omit<Memory, 'id'>): Promise<Memory> {
    const { data, error } = await this.supabase
      .from('memories')
      .insert({
        content: memory.content,
        type: memory.type,
        metadata: memory.metadata,
        strength: memory.strength
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMemories(options: {
    type?: string;
    minStrength?: number;
    limit?: number;
  } = {}): Promise<Memory[]> {
    let query = this.supabase
      .from('memories')
      .select('*');

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.minStrength) {
      query = query.gte('strength', options.minStrength);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async connectMemories(sourceId: string, targetId: string, strength = 1.0): Promise<void> {
    const { error } = await this.supabase
      .from('memory_connections')
      .insert({
        source_memory_id: sourceId,
        target_memory_id: targetId,
        strength
      });

    if (error) throw error;
  }

  async getConnectedMemories(memoryId: string): Promise<Memory[]> {
    const { data, error } = await this.supabase
      .from('memory_connections')
      .select(`
        target_memory:memories!target_memory_id (*),
        source_memory:memories!source_memory_id (*)
      `)
      .or(`source_memory_id.eq.${memoryId},target_memory_id.eq.${memoryId}`);

    if (error) throw error;

    const connectedMemories = data.map(connection => {
      return connection.source_memory.id === memoryId
        ? connection.target_memory
        : connection.source_memory;
    });

    return connectedMemories;
  }

  async createSharedSpace(name: string, description?: string): Promise<void> {
    const { error } = await this.supabase
      .from('shared_spaces')
      .insert({
        name,
        description
      });

    if (error) throw error;
  }

  async addMemberToSpace(spaceId: string, userId: string, role = 'member'): Promise<void> {
    const { error } = await this.supabase
      .from('space_members')
      .insert({
        space_id: spaceId,
        user_id: userId,
        role
      });

    if (error) throw error;
  }

  async getSharedSpaces(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('shared_spaces')
      .select(`
        *,
        members:space_members(user_id, role)
      `);

    if (error) throw error;
    return data;
  }

  async subscribeToMemoryUpdates(callback: (memory: Memory) => void): Promise<() => void> {
    const subscription = this.supabase
      .channel('memory_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories'
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}