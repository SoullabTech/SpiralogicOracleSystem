'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import the correct Oracle Conversation interface
import { OracleConversation } from '@/components/OracleConversation';

export default function MayaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user credentials from storage
    const explorerId = sessionStorage.getItem('betaUserId') ||
                      sessionStorage.getItem('explorerId') ||
                      localStorage.getItem('betaUserId') ||
                      localStorage.getItem('explorerId');
    const explorerName = sessionStorage.getItem('explorerName') ||
                        localStorage.getItem('explorerName');

    if (!explorerId || !explorerName) {
      // No credentials - redirect to signup
      router.replace('/beta-signup');
      return;
    }

    // Sync session storage from localStorage if needed
    if (!sessionStorage.getItem('explorerId') && localStorage.getItem('explorerId')) {
      sessionStorage.setItem('explorerId', localStorage.getItem('explorerId') || '');
      sessionStorage.setItem('explorerName', localStorage.getItem('explorerName') || '');
      sessionStorage.setItem('betaUserId', localStorage.getItem('betaUserId') || '');
    }

    // Mark as onboarded and auto-drop to Maia interface
    localStorage.setItem('betaOnboardingComplete', 'true');
    setUserId(explorerId);
  }, [router]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-amber-400">Initializing Maia-ARIA-1...</div>
      </div>
    );
  }

  return <OracleConversation sessionId={Date.now().toString()} userId={userId} voiceEnabled={true} />;
}