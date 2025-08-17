"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJournalEntry = saveJournalEntry;
// backend/server/services/journalService.ts
const supabase_1 = require("@/lib/supabase");
async function saveJournalEntry({ userId, content, mood, petalData, archetypeTag, elementalTag, ritual, phase, metadata = {}, }) {
    const { data, error } = await supabase_1.supabase.from("journal_entries").insert([
        {
            user_id: userId,
            content,
            mood,
            elemental_tag: elementalTag,
            archetype_tag: archetypeTag,
            ritual,
            phase,
            progression_in: petalData,
            metadata,
        },
    ]);
    if (error)
        throw error;
    return data?.[0];
}
