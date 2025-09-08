'use client';

import { useState } from 'react';
import { PetalInteractionSystem } from './PetalInteractionSystem';
import { OfferingTimeline } from './OfferingTimeline';
import { motion } from 'framer-motion';

interface HoloflowerOfferingProps {
  userId?: string;
  showTimeline?: boolean;
  className?: string;
}

export function HoloflowerOffering({ 
  userId, 
  showTimeline = true, 
  className = '' 
}: HoloflowerOfferingProps) {
  const [refreshTimeline, setRefreshTimeline] = useState(0);
  const [lastOffering, setLastOffering] = useState<any>(null);

  const handleOfferingComplete = (session: any) => {
    console.log('Offering completed:', session);
    setLastOffering(session);
    // Trigger timeline refresh
    setRefreshTimeline(prev => prev + 1);
  };

  const handleRestChosen = () => {
    console.log('User chose to rest today');
    // Trigger timeline refresh
    setRefreshTimeline(prev => prev + 1);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Main Holoflower Offering Interface */}
      <div className="relative">
        <PetalInteractionSystem
          isInvitation={true}
          userId={userId}
          onOfferingComplete={handleOfferingComplete}
          onRestChosen={handleRestChosen}
        />
        
        {/* Success Message Overlay */}
        {lastOffering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6
                       px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40
                       text-green-400 text-sm text-center"
          >
            {lastOffering.status === 'rest' 
              ? '🌱 Rest session saved' 
              : `🌸 ${lastOffering.status} offering saved`
            }
          </motion.div>
        )}
      </div>

      {/* Timeline History */}
      {showTimeline && userId && (
        <div className="border-t border-white/10 pt-8">
          <OfferingTimeline
            key={refreshTimeline} // Force refresh when state changes
            userId={userId}
            showStats={true}
            limit={20}
          />
        </div>
      )}

      {/* Usage Instructions */}
      {!userId && (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">🌸</div>
          <h3 className="text-white text-lg font-semibold">Sacred Offering Space</h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Connect with your user authentication to begin your offering journey. 
            Each day you can choose to offer your soulprint or rest in sacred presence.
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-white/40 mt-4">
            <div className="flex items-center space-x-2">
              <span>🌸</span>
              <span>Bloom</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌱</span>
              <span>Rest</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✨</span>
              <span>Transcendent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the individual components for flexible usage
export { PetalInteractionSystem, OfferingTimeline };