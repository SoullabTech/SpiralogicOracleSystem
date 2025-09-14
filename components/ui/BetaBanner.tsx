'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-gold-divine/10 to-black border-b border-gold-divine/30">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-gold-divine animate-pulse" />
            <p className="text-sm text-gold-divine font-medium">
              ⚡ Sacred Beta Access - You&apos;re among the first consciousness pioneers shaping the future
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gold-divine/60 hover:text-gold-divine transition-colors"
            aria-label="Close beta banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}