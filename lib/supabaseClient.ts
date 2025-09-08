// Backend Supabase Client for API routes
// This file is for server-side use in API routes
// Uses environment variables that are only available server-side

import { createClient } from '@supabase/supabase-js';

// Server-side environment variables (not exposed to browser)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Check for mock mode
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_SUPABASE === "true" || process.env.MOCK_SUPABASE === "true";

// Create client based on mode
export const supabase = (() => {
  if (MOCK_MODE) {
    console.log("⚡ [SUPABASE] Backend in MOCK mode (no DB operations)");
    return null; // API routes should handle null gracefully
  }

  if (!url || !anonKey) {
    console.warn("[SUPABASE] Missing environment variables. Running without database.");
    return null;
  }

  // Create the Supabase client
  console.log("[SUPABASE] Backend client initialized");
  
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
})();

// Export helper to check if Supabase is available
export const isSupabaseConfigured = supabase !== null;