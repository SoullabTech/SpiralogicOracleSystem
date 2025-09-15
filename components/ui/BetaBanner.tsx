'use client';

import { useState } from 'react';
import { X, Crown } from 'lucide-react';

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-neutral-silver/10">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-neutral-silver" />
            <p className="text-sm text-neutral-silver font-light">
              Sacred Beta Access • You&apos;re among the first consciousness pioneers shaping the future
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-neutral-silver/60 hover:text-neutral-silver transition-colors"
            aria-label="Close beta banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}