'use client';

import { lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for better code splitting
const BetaRitualDashboard = dynamic(
  () => import("@/components/BetaRitualDashboard"),
  {
    ssr: true,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-purple-400 animate-pulse">Loading dashboard...</div>
      </div>
    )
  }
);

// Lazy load the ARIA dashboard for logged in users
const ARIADashboard = lazy(() => import("@/components/ARIADashboard"));

export default function DashboardPage() {
  // Check if we should show ARIA dashboard (based on user session/flag)
  const showARIA = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('aria') === 'true';

  if (showARIA) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
          <div className="text-4xl animate-spin">🦋</div>
        </div>
      }>
        <ARIADashboard />
      </Suspense>
    );
  }

  return <BetaRitualDashboard />;
}