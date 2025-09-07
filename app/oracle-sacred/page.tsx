'use client';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR to avoid build errors
const SacredPortal = dynamic(
  () => import('./sacred-portal-component'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Sacred Portal...</div>
      </div>
    )
  }
);

export default function OracleSacredPage() {
  return <SacredPortal />;
}