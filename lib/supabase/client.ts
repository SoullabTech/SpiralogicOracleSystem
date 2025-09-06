import { createBrowserClient } from '@supabase/ssr';

// Check if we're in mock mode
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_SUPABASE === 'true' || process.env.MOCK_SUPABASE === 'true';

export function createClient() {
  // In mock mode, return a stub client that doesn't make real requests
  if (MOCK_MODE) {
    console.log('⚡ [SUPABASE] Frontend in MOCK mode - no real DB calls');
    return {
      from: (table: string) => ({
        insert: async (data: any) => ({ data: null, error: null }),
        upsert: async (data: any) => ({ data: null, error: null }),
        update: async (data: any) => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            then: async (cb: any) => cb({ data: [], error: null })
          }),
          single: async () => ({ data: null, error: null }),
          then: async (cb: any) => cb({ data: [], error: null })
        }),
      }),
      auth: {
        getUser: async () => ({ 
          data: { user: { id: 'mock-user-123', email: 'mock@test.com' } }, 
          error: null 
        }),
        signIn: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ 
          data: { session: null }, 
          error: null 
        }),
        onAuthStateChange: (cb: any) => ({
          data: { subscription: { unsubscribe: () => {} } }
        })
      },
      rpc: async (fn: string, params?: any) => ({ data: null, error: null }),
    } as any;
  }
  
  // Use the configured URL from env, not localhost:54321
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkbetmadzcpoinjogkli.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key || url.includes('localhost:54321')) {
    console.warn('[SUPABASE] Invalid configuration, using mock mode');
    return createClient(); // Recursive call will hit mock mode
  }
  
  console.log('[SUPABASE] Frontend using real Supabase at:', url);
  return createBrowserClient(url, key);
}