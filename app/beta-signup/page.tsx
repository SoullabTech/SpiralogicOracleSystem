'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BetaSignup() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to minimal entry - no heavy onboarding!
    router.push('/beta-entry');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-amber-400">Entering Soullab...</div>
    </div>
  );
}