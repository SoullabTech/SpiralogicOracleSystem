import { supabase } from '@/lib/supabaseClient';
import type { SymbolicTag } from '@/types/symbolicTag';

export async function insertSymbolicTag(tag: Omit<SymbolicTag, 'id'>) {
  const { data, error } = await supabase.from('symbolic_tags').insert(tag).single();

  if (error) throw error;
  return data;
}

export async function fetchSymbolicTags(filters: {
  symbol?: string;
  agent?: string;
  since?: string;
}) {
  let query = supabase.from('symbolic_tags').select('*');

  if (filters.symbol) query = query.eq('symbol', filters.symbol);
  if (filters.agent) query = query.eq('agent', filters.agent);
  if (filters.since) query = query.gte('timestamp', filters.since);

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
