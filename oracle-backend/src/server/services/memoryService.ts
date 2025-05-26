// src/services/memoryService.ts

import { supabase } from '../lib/supabaseClient';
import { MemoryItem } from '../types';

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
      console.error('❌ Error storing memory:', error.message);
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
      console.error('❌ Error recalling memories:', error.message);
      return [];
    }

    return data as MemoryItem[];
  },

  update: async (id: string, content: string, userId: string): Promise<MemoryItem | null> => {
    const { data: existing, error: fetchErr } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) return null;

    const { data, error } = await supabase
      .from('memories')
      .update({ content })
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error updating memory:', error.message);
      return null;
    }

    return data as MemoryItem;
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const { data: existing, error: fetchErr } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) return false;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    return !error;
  },

  getMemoryInsights: async (userId: string) => {
    const { data, error } = await supabase
      .from('memories')
      .select('element, count:id')
      .eq('user_id', userId)
      .group('element');

    if (error) {
      console.error('❌ Error fetching memory insights:', error.message);
      return null;
    }

    return data;
  },
};
