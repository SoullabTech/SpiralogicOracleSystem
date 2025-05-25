// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './config';

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = env;
// … rest as before …
// ─────────────────────────────────────────────────────────────────────────────
// 🌱 Validation
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('❌ Missing required Supabase public environment variables.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY — admin client disabled.');
}

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Clients
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdmin: SupabaseClient | null = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ─────────────────────────────────────────────────────────────────────────────
// 🧪 Safe Admin Access
export function useSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    console.warn('⚠️ Falling back to public Supabase client — admin actions may fail.');
    return supabase;
  }
  return supabaseAdmin;
}
