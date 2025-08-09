// /oracle-backend/memory/journalMemory.ts
import { createClient } from '@supabase/supabase-js';
import { memoryConfig } from './memgpt.config';
import { Database } from '@/lib/database.types';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function storeJournalEntry(userId: string, content: string, symbols: string[] = []) {
  const { data, error } = await supabase.from('journal_entries').insert({
    user_id: userId,
    content,
    symbols,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function retrieveJournalEntries(userId: string) {
  const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data;
}