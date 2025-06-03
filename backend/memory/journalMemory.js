"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeJournalEntry = storeJournalEntry;
exports.retrieveJournalEntries = retrieveJournalEntries;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function storeJournalEntry(userId, content, symbols = []) {
    const { data, error } = await supabase.from('journal_entries').insert({
        user_id: userId,
        content,
        symbols,
    });
    if (error)
        throw new Error(error.message);
    return data;
}
async function retrieveJournalEntries(userId) {
    const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
    if (error)
        throw new Error(error.message);
    return data;
}
