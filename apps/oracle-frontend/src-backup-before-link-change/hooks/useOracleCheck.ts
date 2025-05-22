// src/hooks/useOracleCheck.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export function useOracleCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function checkOracle() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Not logged in, do nothing
        return;
      }

      const { data, error } = await supabase
        .from('user_oracles')
        .select('oracle_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Oracle check error:', error.message);
        return;
      }

      // 🚨 Critical Fix:
      // If no oracle, redirect (only if not already on ceremony or blessing pages)
      if (
        !data?.oracle_id &&
        !location.pathname.startsWith('/ceremony') &&
        !location.pathname.startsWith('/blessing')
      ) {
        navigate('/ceremony', { replace: true });
      }
    }

    checkOracle();
  }, [navigate, location]);
}
