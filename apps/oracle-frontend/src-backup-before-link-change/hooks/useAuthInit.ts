// src/hooks/useAuthInit.ts
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export function useAuthInit() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('🔒 Supabase session error:', error.message);
        } else {
          console.log('🔑 Supabase session:', session ? '✅ found' : '❌ not found');
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
      } finally {
        setAuthReady(true);
      }
    };

    checkSession();
  }, []);

  return authReady;
}
