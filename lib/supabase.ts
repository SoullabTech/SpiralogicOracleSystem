// Supabase client for both server and client use
import { createClient } from '@supabase/supabase-js';

// Re-export createClient for compatibility
export { createClient };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Helper function for components that need createClientComponentClient
export function createClientComponentClient() {
  return supabase;
}