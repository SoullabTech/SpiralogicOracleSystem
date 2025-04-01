import { createClient } from '@supabase/supabase-js';
import type { Memory } from './types';

export class MemoryContextBuilder {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async getMemoryContext(client_id: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("memory_blocks")
        .select("label, value, importance")
        .eq("client_id", client_id)
        .order("importance", { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching memory blocks:', error);
        return "";
      }

      if (!data || data.length === 0) {
        return "No previous context available.";
      }

      // Format memory blocks into a readable context
      const context = data
        .map(block => `(${block.label}) ${block.value}`)
        .join("\n");

      return `Previous Context:\n${context}`;
    } catch (error) {
      console.error('Failed to build memory context:', error);
      return "";
    }
  }

  async storeMemory(memory: Omit<Memory, 'id'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("memory_blocks")
        .insert({
          client_id: memory.user_id,
          label: memory.type,
          value: memory.content,
          importance: Math.round(memory.strength * 10),
          type: 'memory'
        });

      if (error) {
        console.error('Error storing memory:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  async getRecentMemories(client_id: string, limit = 3): Promise<Memory[]> {
    try {
      const { data, error } = await this.supabase
        .from("memories")
        .select("*")
        .eq("user_id", client_id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent memories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get recent memories:', error);
      throw error;
    }
  }

  async updateMemoryStrength(memory_id: string, strength_delta: number): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('update_memory_strength', {
        p_memory_id: memory_id,
        p_strength_delta: strength_delta
      });

      if (error) {
        console.error('Error updating memory strength:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update memory strength:', error);
      throw error;
    }
  }

  async findRelatedMemories(content: string, client_id: string): Promise<Memory[]> {
    try {
      // For now, use simple text matching
      // In production, you'd want to use embeddings or more sophisticated matching
      const { data, error } = await this.supabase
        .from("memories")
        .select("*")
        .eq("user_id", client_id)
        .textSearch('content', content)
        .limit(5);

      if (error) {
        console.error('Error finding related memories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to find related memories:', error);
      throw error;
    }
  }

  async createMemoryConnection(
    source_id: string,
    target_id: string,
    strength = 1.0
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("memory_connections")
        .insert({
          source_memory_id: source_id,
          target_memory_id: target_id,
          strength
        });

      if (error) {
        console.error('Error creating memory connection:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to create memory connection:', error);
      throw error;
    }
  }
}