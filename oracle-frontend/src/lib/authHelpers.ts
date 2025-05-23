// 📁 src/lib/authHelpers.ts
import { supabase } from '@/lib/supabaseClient';

export const getJwt = async (): Promise<string | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return session?.access_token || null;
};
