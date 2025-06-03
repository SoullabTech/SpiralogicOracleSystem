"use strict";
// src/services/sessionService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = require("../../config/index");
const supabase = (0, supabase_js_1.createClient)(index_1.config.supabase.url, index_1.config.supabase.anonKey);
class SessionService {
    // Create a new session
    async createSession(userId, metadata) {
        const { data, error } = await supabase
            .from('sessions')
            .insert([
            {
                user_id: userId,
                started_at: new Date().toISOString(),
                status: 'active',
                metadata: metadata || {},
            },
        ]);
        if (error) {
            throw new Error(`Failed to create session: ${error.message}`);
        }
        return data;
    }
    // End an existing session
    async endSession(sessionId, userId) {
        const { data, error } = await supabase
            .from('sessions')
            .update({
            ended_at: new Date().toISOString(),
            status: 'completed',
        })
            .eq('id', sessionId)
            .eq('user_id', userId);
        if (error) {
            throw new Error(`Failed to end session: ${error.message}`);
        }
        return data;
    }
    // Get session stats for a user
    async getSessionStats(userId, startDate, endDate) {
        let query = supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId);
        if (startDate) {
            query = query.gte('started_at', startDate.toISOString());
        }
        if (endDate) {
            query = query.lte('started_at', endDate.toISOString());
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to get session stats: ${error.message}`);
        }
        const totalSessions = data.length;
        const activeSessions = data.filter((session) => session.status === 'active').length;
        const completedSessions = data.filter((session) => session.status === 'completed').length;
        const lastSessionTime = data.length > 0 ? data[data.length - 1].started_at : null;
        return {
            totalSessions,
            activeSessions,
            completedSessions,
            lastSessionTime,
        };
    }
}
exports.SessionService = SessionService;
