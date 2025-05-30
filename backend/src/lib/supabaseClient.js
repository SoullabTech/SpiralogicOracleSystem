// oracle-backend/src/lib/supabaseClient.ts
export { supabase } from './supabase';
// Re-export for backwards compatibility
import { supabase } from './supabase';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
export async function saveJournalEntry(entry) {
    const { data, error } = await supabase
        .from('oracle_memories')
        .insert([entry]);
    if (error) {
        logger.error(`Failed to save journal entry: ${error.message}`);
        throw createError('Failed to save journal entry', 500);
    }
    return data;
}
export async function getSymbolThreads(userId) {
    const { data, error } = await supabase
        .from('oracle_memories')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false });
    if (error) {
        logger.error(`Failed to fetch memory threads: ${error.message}`);
        throw createError('Failed to fetch memory threads', 500);
    }
    return data;
}
export async function semanticSearch(userId, query) {
    const { data, error } = await supabase
        .rpc('semantic_memory_search', {
        user_id: userId,
        query_text: query
    });
    if (error) {
        logger.error(`Semantic search failed: ${error.message}`);
        throw createError('Semantic search failed', 500);
    }
    return data;
}
