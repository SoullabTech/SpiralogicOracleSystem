'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OracleConversationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Sacred Oracle page which has the proper Tesla-style design
    router.push('/sacred-oracle');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gold-divine text-lg font-light">Loading Sacred Technology...</p>
      </div>
    </div>
  );
}