import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url =
    process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'local-dev-only';

  return createClient(url, key, { auth: { persistSession: false } });
}

export type SupabaseServer = ReturnType<typeof supabaseServer>;
export default supabaseServer;