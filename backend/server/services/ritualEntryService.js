"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRitualEntry = logRitualEntry;
// backend/server/services/ritualEntryService.ts
const supabase_1 = require("@/lib/supabase");
async function logRitualEntry({ userId, ritualType, linkedDreamId, notes, }) {
    const { data, error } = await supabase_1.supabase.from("ritual_entries").insert([
        {
            user_id: userId,
            ritual_type: ritualType,
            linked_dream_id: linkedDreamId,
            notes,
        },
    ]);
    if (error)
        throw error;
    return data?.[0];
}
