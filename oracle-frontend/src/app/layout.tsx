// oracle-frontend/src/app/layout.tsx

import { useState } from 'react';
import { RecorderOverlay } from '@/components/RecorderOverlay';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showRecorder, setShowRecorder] = useState(false);

  return (
    <html lang="en">
      <body className="relative">
        {children}

        {/* Floating Mic Button */}
        <button
          onClick={() => setShowRecorder(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-xl"
          aria-label="Voice Check-In"
        >
          🎙️
        </button>

        {showRecorder && (
          <RecorderOverlay onClose={() => setShowRecorder(false)} />
        )}
      </body>
    </html>
  );
}
