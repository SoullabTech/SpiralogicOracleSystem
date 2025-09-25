'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const MayaChat = dynamic(
  () => import('@/components/maya/MayaChat'),
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
    // Check if user has beta access - also check localStorage for persistence
    const explorerId = sessionStorage.getItem('betaUserId') ||
                      sessionStorage.getItem('explorerId') ||
                      localStorage.getItem('betaUserId') ||
                      localStorage.getItem('explorerId');
    const explorerName = sessionStorage.getItem('explorerName') ||
                        localStorage.getItem('explorerName');

    if (!explorerId || !explorerName) {
      // Check if returning user - try beta signin first
      const hasUsedBefore = localStorage.getItem('betaOnboardingComplete') === 'true';
      if (hasUsedBefore) {
        router.push('/beta-signin');
      } else {
        router.push('/beta-signup');
      }
    } else {
      setIsAuthorized(true);
      // Ensure session storage is populated from localStorage if needed
      if (!sessionStorage.getItem('explorerId') && localStorage.getItem('explorerId')) {
        sessionStorage.setItem('explorerId', localStorage.getItem('explorerId') || '');
        sessionStorage.setItem('explorerName', localStorage.getItem('explorerName') || '');
        sessionStorage.setItem('betaUserId', localStorage.getItem('betaUserId') || '');
      }
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-amber-400">Verifying access...</div>
      </div>
    );
  }

  return <MayaChat />;
}