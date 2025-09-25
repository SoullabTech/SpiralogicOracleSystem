'use client';

import dynamic from 'next/dynamic';

// Dynamic import with loading state
const ARIADashboard = dynamic(
  () => import("@/components/ARIADashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl animate-pulse">🦋</div>
          <div className="text-amber-400">Loading Maya Dashboard...</div>
        </div>
      </div>
    )
  }
);

export default function ARIADashboardPage() {
  return <ARIADashboard />;
}