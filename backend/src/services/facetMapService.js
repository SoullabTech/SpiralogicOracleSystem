import { supabase } from '../lib/supabaseClient';
export const facetMapService = {
    async getUserFacetMap(userId) {
        const { data, error } = await supabase
            .from('facet_map')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    },
    async upsertFacet(userId, facetData) {
        const { data, error } = await supabase
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
        const { error } = await supabase
            .from('facet_map')
            .delete()
            .eq('user_id', userId)
            .eq('facet', facet);
        if (error)
            throw new Error(error.message);
        return true;
    }
};
