'use client';

import { useState } from 'react';
import { X, Crown } from 'lucide-react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-md border-b border-[#D4B896]/20">
      <div className="container mx-auto px-4 pb-2 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-[#D4B896]" />
            <p className="text-sm text-[#D4B896] font-light">
              Sacred Beta Access • You&apos;re among the first consciousness pioneers shaping the future
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#D4B896]/60 hover:text-[#D4B896] transition-colors"
            aria-label="Close beta banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}