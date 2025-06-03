"use strict";
// 📁 File: src/lib/symbolicIntel.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserSymbols = fetchUserSymbols;
exports.fetchEmotionalTone = fetchEmotionalTone;
const supabaseClient_1 = require("./supabaseClient");
const emotionParser_1 = require("./emotionParser");
const symbolMatcher_1 = require("./symbolMatcher");
/**
 * Fetch symbolic motifs from a user's recent memory content.
 */
async function fetchUserSymbols(userId) {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from('memories')
            .select('content')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        const allText = data.map((entry) => entry.content).join(' ');
        return (0, symbolMatcher_1.matchSymbolsFromText)(allText);
    }
    catch (err) {
        console.error('[SymbolicIntel] Error fetching symbols:', err);
        return [];
    }
}
/**
 * Fetch emotional tone based on user's memory content.
 */
async function fetchEmotionalTone(userId) {
    try {
        const { data, error } = await supabaseClient_1.supabase
            .from('memories')
            .select('content')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        const combinedText = data.map((entry) => entry.content).join(' ');
        return (0, emotionParser_1.parseEmotions)(combinedText);
    }
    catch (err) {
        console.error('[SymbolicIntel] Error parsing emotions:', err);
        return {};
    }
}
