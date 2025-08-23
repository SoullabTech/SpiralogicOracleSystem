import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url =
    process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'local-dev-only';

  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

// Alias for compatibility with admin pages
export const createClient = supabaseServer;

export type SupabaseServer = ReturnType<typeof supabaseServer>;
export default supabaseServer;