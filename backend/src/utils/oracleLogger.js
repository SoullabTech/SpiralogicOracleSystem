import { supabase } from '../lib/supabaseClient';
import logger from './logger';
// 🧠 1. Log an insight
export async function logOracleInsight(entry) {
    try {
        const { data, error } = await supabase
            .from('insight_history')
            .insert({
            anon_id: entry.anon_id,
            archetype: entry.archetype,
            element: entry.element,
            content: entry.insight.message,
            metadata: {
                raw_input: entry.insight.raw_input,
                emotion: entry.emotion,
                phase: entry.phase,
                context: entry.context || [],
            },
        })
            .select('id')
            .single();
        if (error || !data)
            throw error || new Error('No data returned');
        logger.info('[OracleLog] Insight logged', { id: data.id, ...entry });
        return { id: data.id };
    }
    catch (err) {
        logger.error('Failed to log Oracle insight:', { error: err.message || err });
        throw err;
    }
}
// 📜 2. Retrieve insight history for user
export async function getInsightHistory(userId, { type, limit = 50, offset = 0, }) {
    try {
        const query = supabase
            .from('insight_history')
            .select('*')
            .eq('anon_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (type) {
            query.eq('metadata->>phase', type);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data || [];
    }
    catch (err) {
        logger.error('Failed to retrieve insight history', { error: err.message || err });
        throw err;
    }
}
// 📊 3. Aggregate stats (insights per element or phase)
export async function getInsightStats(userId) {
    try {
        const { data, error } = await supabase
            .from('insight_history')
            .select('element, metadata->>phase')
            .eq('anon_id', userId);
        if (error)
            throw error;
        const stats = {
            total: data.length,
            byElement: {},
            byPhase: {},
        };
        for (const row of data) {
            const el = row.element;
            const phase = row['metadata->>phase'];
            stats.byElement[el] = (stats.byElement[el] || 0) + 1;
            stats.byPhase[phase] = (stats.byPhase[phase] || 0) + 1;
        }
        return stats;
    }
    catch (err) {
        logger.error('Failed to get insight stats', { error: err.message || err });
        throw err;
    }
}
// 📦 Export all in a grouped object if preferred
export const oracleLogger = {
    logInsight: logOracleInsight,
    getInsightHistory,
    getInsightStats,
};
