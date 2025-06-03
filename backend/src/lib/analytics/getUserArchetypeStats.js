"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserArchetypeStats = void 0;
const supabaseClient_1 = require("@/lib/supabaseClient");
const getUserArchetypeStats = async (userId) => {
    const { data, error } = await supabaseClient_1.supabase
        .from('user_phases')
        .select('archetype, element')
        .eq('user_id', userId);
    if (error || !data)
        return [];
    const countMap = new Map();
    data.forEach(({ archetype, element }) => {
        if (!archetype)
            return;
        if (countMap.has(archetype)) {
            countMap.get(archetype).count += 1;
        }
        else {
            countMap.set(archetype, { count: 1, element });
        }
    });
    return Array.from(countMap.entries()).map(([archetype, { count, element }]) => ({
        archetype,
        count,
        element,
    }));
};
exports.getUserArchetypeStats = getUserArchetypeStats;
