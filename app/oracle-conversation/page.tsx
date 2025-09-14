'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, Suspense } from 'react';

// Force client-side only rendering to completely avoid server-side initialization issues
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation').then(mod => ({
    default: mod.OracleConversation
  })),
  {
    ssr: false, // NO server-side rendering - fixes ReferenceError issues
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔮</div>
          <div className="text-xl text-white">Loading Oracle...</div>
          <div className="text-sm text-purple-300 mt-2">Initializing sacred systems</div>
        </div>
      </div>
    )
  }
);

export default function OracleConversationPage() {
  const [userId, setUserId] = useState<string>();
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    setSessionId(sessionId);

    // Get or generate user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('userId', userId);
    }
    setUserId(userId);
  }, []);

  if (!userId || !sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg font-light">Connecting to Maya...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Preparing sacred space...</div>
      </div>
    }>
      <OracleConversation
        userId={userId}
        sessionId={sessionId}
        voiceEnabled={true}
        showAnalytics={false}
      />
    </Suspense>
  );
}