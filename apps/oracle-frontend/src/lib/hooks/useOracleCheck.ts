import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export function useOracleCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkOracle() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found.');
        return;
      }

      const { data } = await supabase
        .from('user_oracles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!data) {
        console.log('No oracle assigned yet.');
      }
    }
    checkOracle();
  }, [navigate]);
}
