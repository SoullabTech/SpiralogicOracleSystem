'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const BetaMinimalMirror = dynamic(
  () => import('@/components/chat/BetaMinimalMirror'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-amber-400">Loading Maia...</div>
      </div>
    )
  }
);

export default function MayaPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user has beta access
    const explorerId = sessionStorage.getItem('betaUserId') || sessionStorage.getItem('explorerId');
    const explorerName = sessionStorage.getItem('explorerName');

    if (!explorerId || !explorerName) {
      // Not authorized - redirect to signup
      router.push('/beta-signup');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-amber-400">Verifying access...</div>
      </div>
    );
  }

  return <BetaMinimalMirror />;
}