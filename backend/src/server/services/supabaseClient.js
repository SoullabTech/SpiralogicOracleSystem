"use strict";
// oracle-backend/src/services/supabaseClient.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
exports.getSupabaseAdmin = getSupabaseAdmin;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("../config");
const { url, anonKey, serviceRoleKey } = config_1.config.supabase;
if (!url || !anonKey) {
    throw new Error('❌ Missing Supabase configuration in environment variables.');
}
// Public client (used by frontend-safe operations)
exports.supabase = (0, supabase_js_1.createClient)(url, anonKey);
// Admin client (used for backend server-side operations)
exports.supabaseAdmin = serviceRoleKey
    ? (0, supabase_js_1.createClient)(url, serviceRoleKey)
    : null;
function getSupabaseAdmin() {
    if (!exports.supabaseAdmin) {
        console.warn('⚠️ Falling back to public Supabase client. Admin operations may be restricted.');
        return exports.supabase;
    }
    return exports.supabaseAdmin;
}
