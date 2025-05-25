// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,  // Fetch Supabase URL from environment variables
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Fetch the public API key
);
