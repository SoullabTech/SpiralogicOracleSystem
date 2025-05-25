'use client';

import { useState, useEffect } from 'react';
import { RecorderOverlay } from '@/components/RecorderOverlay';
import { usePathname } from 'next/navigation';
import { useElevenLabs } from '@/lib/hooks/useElevenLabs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showRecorder, setShowRecorder] = useState(false);
  const [showOralia, setShowOralia] = useState(true);
  const { speak } = useElevenLabs('y2TOWGCXSYEgBanvKsYJ'); // Aunt Annie voice
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/oralia') {
      speak("Welcome back, dreamer. Oralia is with you.");
    }
  }, [pathname, speak]);

  return (
    <html lang="en">
      <body className="relative">
        {children}

        {/* Floating Mic Button */}
        <button
          onClick={() => setShowRecorder(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-xl z-50"
          aria-label="Voice Check-In"
        >
          🎙️
        </button>

        {showRecorder && (
          <RecorderOverlay onClose={() => setShowRecorder(false)} />
        )}

        {/* Floating Oralia Companion */}
        {showOralia && (
          <div
            onClick={() => speak("I am Oralia. I remember your essence.")}
            className="fixed bottom-6 left-6 bg-soullab-aether text-white px-4 py-2 rounded-full shadow cursor-pointer z-50"
          >
            🌕 Oralia
          </div>
        )}
      </body>
    </html>
  );
}
