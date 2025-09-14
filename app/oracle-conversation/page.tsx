'use client';

import dynamic from 'next/dynamic';

// Import with client-side only rendering to avoid SSR issues
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation').then(mod => mod.OracleConversation),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-gold-divine border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gold-divine text-lg font-light">Loading Sacred Technology...</p>
        </div>
      </div>
    )
  }
);

export default function OracleConversationPage() {
  return <OracleConversation sessionId="main" />;
}