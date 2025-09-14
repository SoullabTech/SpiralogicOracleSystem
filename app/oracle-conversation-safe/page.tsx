'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Force client-side only rendering to avoid ALL initialization issues
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation').then(mod => ({
    default: mod.OracleConversation
  })),
  {
    ssr: false, // This is the key - NO server-side rendering
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-lg font-light">Connecting to Maya...</p>
        </div>
      </div>
    )
  }
);

export default function OracleConversationSafePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Initializing...</div>
      </div>
    }>
      <OracleConversation
        sessionId={`session-${Date.now()}`}
        voiceEnabled={true}
      />
    </Suspense>
  );
}