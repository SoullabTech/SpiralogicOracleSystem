// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './config';
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
    },
});
