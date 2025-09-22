// Client-side Supabase client
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

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

// Hook for getting current user
export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return user;
}

// Hook for getting Supabase client
export function useSupabaseClient() {
  return supabase;
}