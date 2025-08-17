"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserPhase = saveUserPhase;
// backend/server/services/userPhaseService.ts
const supabase_1 = require("@/lib/supabase");
async function saveUserPhase({ userId, phase, archetype, element, }) {
    const { data, error } = await supabase_1.supabase
        .from("user_phases")
        .insert([{ user_id: userId, phase, archetype, element }]);
    if (error)
        throw error;
    return data?.[0];
}
