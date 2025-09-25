'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to avoid initialization issues
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-600 to-blue-600 opacity-50"></div>
            <p className="text-xl">Initializing Sacred Oracle...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function OracleConversationDynamic() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only render after mount to avoid hydration issues
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Oracle System...</div>
      </div>
    }>
      <OracleConversation />
    </Suspense>
  );
}