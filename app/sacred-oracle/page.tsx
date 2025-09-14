'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SacredOraclePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper Oracle Conversation with Tesla design
    router.push('/oracle-conversation');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gold-divine text-lg font-light">Redirecting to Sacred Technology...</p>
      </div>
    </div>
  );
}