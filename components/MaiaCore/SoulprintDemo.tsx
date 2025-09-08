"use client";

import React from 'react';
import SoulprintMilestoneFlow from '@/components/MaiaCore/SoulprintMilestoneFlow';

// Demo component to test the complete soulprint system
export default function SoulprintDemo() {
  const handleComplete = (soulprintId: string) => {
    console.log('🎉 Soulprint completed!', { soulprintId });
    // Could trigger celebration animations, notifications, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-light text-white">
            Sacred Soulprint System
          </h1>
          <p className="text-white/70 text-lg">
            Journey through five milestones of spiritual awakening
          </p>
          <p className="text-white/50 text-sm max-w-2xl mx-auto">
            Interact with the 12 elemental petals to capture your soul's resonance. 
            Each session creates a soulprint that tracks your evolution across the sacred milestones.
          </p>
        </div>

        {/* Main Flow */}
        <SoulprintMilestoneFlow
          initialMilestone="first-bloom"
          onComplete={handleComplete}
          className="w-full"
        />

        {/* Footer */}
        <div className="text-center mt-12 text-white/40 text-xs">
          <p>Built with sacred intention • Every interaction is witnessed • Your journey matters</p>
        </div>
      </div>
    </div>
  );
}