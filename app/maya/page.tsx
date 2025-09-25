'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import the correct Oracle Conversation interface
import { OracleConversation } from '@/components/OracleConversation';

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
        router.replace('/beta-signin');
      } else {
        router.replace('/beta-entry');
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

  const explorerId = sessionStorage.getItem('explorerId') || localStorage.getItem('explorerId') || 'anonymous';
  return <OracleConversation sessionId={Date.now().toString()} userId={explorerId} />;
}