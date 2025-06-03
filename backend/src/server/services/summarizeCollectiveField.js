"use strict";
// 📁 File: src/services/summarizeCollectiveField.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeCollectiveField = summarizeCollectiveField;
const supabaseClient_1 = require("@lib/supabaseClient");
const emotionParser_1 = require("@lib/emotionParser");
const symbolMatcher_1 = require("@lib/symbolMatcher");
async function summarizeCollectiveField() {
    const since = new Date();
    since.setDate(since.getDate() - 1);
    const sinceIso = since.toISOString();
    const { data: memoryItems, error } = await supabaseClient_1.supabase
        .from('memory_items')
        .select('content, created_at, user_id')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false });
    if (error || !memoryItems) {
        console.error('[summarizeCollectiveField] Error fetching memory_items:', error);
        return null;
    }
    const fullText = memoryItems.map(item => item.content).join('\n\n');
    const emotions = (0, emotionParser_1.parseEmotions)(fullText);
    const symbols = (0, symbolMatcher_1.matchSymbols)(fullText);
    // Simulate elemental scoring (stubbed for now)
    const elementIndex = {
        fire: Math.random().toFixed(2),
        water: Math.random().toFixed(2),
        air: Math.random().toFixed(2),
        earth: Math.random().toFixed(2),
        aether: Math.random().toFixed(2),
    };
    // Simulate oracle echo generation
    const oracleEcho = symbols.length > 0
        ? `The field speaks in symbols: ${symbols.join(', ')}. Trust what emerges.`
        : 'The field is quiet today, listening between the lines.';
    return {
        date: new Date().toISOString().split('T')[0],
        topSymbols: symbols,
        elementIndex,
        emotionalPulse: emotions,
        oracleEcho,
        recalibrationInsights: [], // Future: Insert recalibration entries here
    };
}
