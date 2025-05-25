// src/lib/supabaseClient.ts

import { Database } from '@/types/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Detect runtime environment: Vite (browser) or Node (Playwright)
const isViteEnv = typeof import.meta !== 'undefined' && import.meta.env;
const viteEnv = isViteEnv ? import.meta.env : undefined;
const nodeEnv = !isViteEnv && (globalThis as any)?.import?.meta?.env
  ? (globalThis as any).import.meta.env
  : process.env;

// ✅ Pull in the correct Supabase credentials
const supabaseUrl = viteEnv?.VITE_SUPABASE_URL || nodeEnv?.VITE_SUPABASE_URL;
const supabaseAnonKey = viteEnv?.VITE_SUPABASE_ANON_KEY || nodeEnv?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('⛔ VITE_SUPABASE_URL:', supabaseUrl);
  console.error('⛔ VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  throw new Error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment');
}

// ✅ Create Supabase client
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ─────────────────────────────────────────────────
// 🔧 Utility: Fetch user profile
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching user profile:', error.message);
    return null;
  }

  return data;
};

// 🔧 Utility: Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: { full_name?: string; role?: string }
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Error updating user profile:', error.message);
    return null;
  }

  return data;
};

// 📩 Utility: Send magic link
export const signInWithMagicLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    console.error('❌ Error sending magic link:', error.message);
    return false;
  }

  return true;
};

// 🚪 Utility: Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('❌ Error signing out:', error.message);
  }
};
