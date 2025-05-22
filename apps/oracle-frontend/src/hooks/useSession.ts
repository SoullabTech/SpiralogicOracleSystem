import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // adjust if your Supabase client is in a different path

export function useSession() {
  const [session, setSession] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) console.error('Error fetching session:', error);
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
