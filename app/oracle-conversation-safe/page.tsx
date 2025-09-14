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

export default function OracleConversationSafePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Preparing sacred space...</div>
      </div>
    }>
      <OracleConversation
        sessionId={`session-${Date.now()}`}
        voiceEnabled={true}
      />
    </Suspense>
  );
}