// src/pages/GetTokenDebug.tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export default function GetTokenDebug() {
  useEffect(() => {
    const getToken = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting JWT token:', error);
      } else {
        console.log('✅ Your JWT Token:', session?.access_token);
      }
    };

    getToken();
  }, []);

  return (
    <div className="text-center mt-20 text-lg text-purple-600">
      🔐 Getting your JWT token... Check the browser console!
    </div>
  );
}