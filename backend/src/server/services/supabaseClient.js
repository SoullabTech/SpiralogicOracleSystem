// oracle-backend/src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
const { url, anonKey, serviceRoleKey } = config.supabase;
if (!url || !anonKey) {
    throw new Error('❌ Missing Supabase configuration in environment variables.');
}
// Public client (used by frontend-safe operations)
export const supabase = createClient(url, anonKey);
// Admin client (used for backend server-side operations)
export const supabaseAdmin = serviceRoleKey
    ? createClient(url, serviceRoleKey)
    : null;
export function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        console.warn('⚠️ Falling back to public Supabase client. Admin operations may be restricted.');
        return supabase;
    }
    return supabaseAdmin;
}
