// src/services/memoryService.ts

import { supabase } from '../lib/supabaseClient';
import type { MemoryItem } from '../types';

export const memoryService = {
  store: async (
    userId: string,
    content: string,
    element?: string,
    sourceAgent?: string,
    confidence?: number,
    metadata?: any
  ): Promise<MemoryItem | null> => {
    const { data, error } = await supabase
      .from('memories')
      .insert([
        {
          user_id: userId,
          content,
          element,
          source_agent: sourceAgent,
          confidence,
          metadata,
          timestamp: new Date().toISOString(),
        },
      ])
      .single();

    if (error) {
      console.error('Error storing memory:', error.message);
      return null;
    }
    return data as MemoryItem;
  },

  recall: async (userId: string): Promise<MemoryItem[]> => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error recalling memories:', error.message);
      return [];
    }
    return data as MemoryItem[];
  },

  update: async (id: string, content: string, userId: string): Promise<MemoryItem | null> => {
    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      console.error('Memory not found or unauthorized');
      return null;
    }

    const { data, error } = await supabase
      .from('memories')
      .update({ content })
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error updating memory:', error.message);
      return null;
    }

    return data as MemoryItem;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      console.error('Memory not found or unauthorized');
      return false;
    }

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting memory:', error.message);
      return false;
    }
    return true;
  },

  getMemoryInsights: async (userId?: string) => {
    if (!userId) return null;

    // Example aggregation: count memories by element
    const { data, error } = await supabase
      .from('memories')
      .select('element, count:id')
      .eq('user_id', userId)
      .group('element');

    if (error) {
      console.error('Error fetching memory insights:', error.message);
      return null;
    }

    return data;
  },
};
