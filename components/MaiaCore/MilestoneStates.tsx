"use client";

import React from 'react';
import EnhancedPetalScaffold from '@/components/MaiaCore/EnhancedPetalScaffold';

interface MilestoneProps {
  onComplete: (scores: any) => void;
  size?: number;
}

export function FirstBloom({ onComplete, size = 400 }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white/90">First Bloom</h2>
        <p className="text-white/60 text-sm">Your first soulprint blooms</p>
      </div>
      <EnhancedPetalScaffold
        mode="guided"
        onComplete={onComplete}
        size={size}
        showLabels={true}
      />
    </div>
  );
}

export function PatternKeeper({ onComplete, size = 400 }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white/90">Pattern Keeper</h2>
        <p className="text-white/60 text-sm">Your flower remembers your rhythms</p>
      </div>
      <EnhancedPetalScaffold
        mode="guided"
        onComplete={onComplete}
        size={size}
        showLabels={true}
      />
    </div>
  );
}

export function DepthSeeker({ onComplete, size = 400 }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white/90">Depth Seeker</h2>
        <p className="text-white/60 text-sm">Every element has layers</p>
      </div>
      <EnhancedPetalScaffold
        mode="intuitive"
        onComplete={onComplete}
        size={size}
        showLabels={false}
      />
    </div>
  );
}

export function SacredGardener({ onComplete, size = 400 }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white/90">Sacred Gardener</h2>
        <p className="text-white/60 text-sm">The complete mandala reveals itself</p>
      </div>
      <EnhancedPetalScaffold
        mode="intuitive"
        onComplete={onComplete}
        size={size}
        showLabels={false}
      />
    </div>
  );
}

export function WisdomKeeper({ onComplete, size = 400 }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-light text-white/90">Wisdom Keeper</h2>
        <p className="text-white/60 text-sm">Your wisdom ripples outward</p>
      </div>
      <EnhancedPetalScaffold
        mode="intuitive"
        onComplete={onComplete}
        size={size}
        showLabels={false}
      />
    </div>
  );
}