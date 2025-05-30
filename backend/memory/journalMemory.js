import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function storeJournalEntry(userId, content, symbols = []) {
    const { data, error } = await supabase.from('journal_entries').insert({
        user_id: userId,
        content,
        symbols,
    });
    if (error)
        throw new Error(error.message);
    return data;
}
export async function retrieveJournalEntries(userId) {
    const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
    if (error)
        throw new Error(error.message);
    return data;
}
