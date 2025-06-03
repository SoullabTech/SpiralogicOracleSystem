"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facetMapService = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
exports.facetMapService = {
    async getUserFacetMap(userId) {
        const { data, error } = await supabaseClient_1.supabase
            .from('facet_map')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    },
    async upsertFacet(userId, facetData) {
        const { data, error } = await supabaseClient_1.supabase
            .from('facet_map')
            .upsert([
            {
                user_id: userId,
                ...facetData,
                updated_at: new Date().toISOString(),
            }
        ], { onConflict: 'user_id,facet' });
        if (error)
            throw new Error(error.message);
        return data;
    },
    async deleteFacet(userId, facet) {
        const { error } = await supabaseClient_1.supabase
            .from('facet_map')
            .delete()
            .eq('user_id', userId)
            .eq('facet', facet);
        if (error)
            throw new Error(error.message);
        return true;
    }
};
