"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { QUADRANT_GROUPS, QuadrantManager, createBetaSoulprint, type QuadrantGroup } from './QuadrantGrouping';

interface BetaHoloflowerProps {
  userId: string;
  onSoulprintComplete?: (soulprint: any) => void;
  showOnboarding?: boolean;
}

interface PetalPosition {
  x: number;
  y: number;
  intensity: number; // 0-100 based on distance from center
}

export const BetaHoloflower: React.FC<BetaHoloflowerProps> = ({
  userId,
  onSoulprintComplete,
  showOnboarding = true
}) => {
  const [quadrantIntensities, setQuadrantIntensities] = useState<Record<string, number>>({
    fire: 50,
    water: 50,
    earth: 50,
    air: 50
  });
  
  const [showTooltips, setShowTooltips] = useState(showOnboarding);
  const [isCompleting, setIsCompleting] = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);
  
  const calculateIntensityFromPosition = useCallback((x: number, y: number): number => {
    const center = { x: 200, y: 200 }; // SVG center
    const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
    const maxDistance = 80; // Maximum drag distance
    return Math.min(100, Math.max(0, (distance / maxDistance) * 100));
  }, []);

  const handlePetalDrag = useCallback((element: string, x: number, y: number) => {
    const intensity = calculateIntensityFromPosition(x, y);
    setQuadrantIntensities(prev => ({
      ...prev,
      [element]: intensity
    }));
  }, [calculateIntensityFromPosition]);

  const handleSoulprintComplete = async () => {
    setIsCompleting(true);
    const soulprint = createBetaSoulprint(userId, quadrantIntensities);
    
    // Save to backend/storage here
    if (onSoulprintComplete) {
      await onSoulprintComplete(soulprint);
    }
    
    setIsCompleting(false);
  };

  const getBalanceScore = () => {
    const values = Object.values(quadrantIntensities);
    const average = values.reduce((sum, val) => sum + val, 0) / 4;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 4;
    return Math.max(0, 100 - Math.sqrt(variance));
  };

  return (
    <div className="beta-holoflower-container relative w-full h-screen bg-gradient-to-br from-sacred-brown/5 via-earth-base/5 to-water-base/5 flex items-center justify-center">
      
      {/* Onboarding Tooltip */}
      {showTooltips && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-sacred p-sacred-md shadow-sacred-subtle">
            <p className="type-micro-poetry text-center">
              Your flower responds to touch — drag petals as they feel today
            </p>
            <button 
              onClick={() => setShowTooltips(false)}
              className="text-xs text-neutral-mystic mt-2 hover:text-neutral-shadow transition-colors"
            >
              Got it ✨
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Holoflower SVG */}
      <svg
        width="400"
        height="400" 
        viewBox="0 0 400 400"
        className="holoflower-svg"
      >
        {/* Background coherence rings */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="rgba(255, 215, 0, 0.1)"
          strokeWidth="1"
          className="animate-sacred-pulse"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="rgba(255, 215, 0, 0.05)"
          strokeWidth="1"
        />

        {/* Quadrant Petals */}
        {QUADRANT_GROUPS.map((quadrant) => {
          const intensity = quadrantIntensities[quadrant.element];
          const radius = 60 + (intensity / 100) * 40; // 60-100px radius based on intensity
          const angle = (quadrant.position.angle * Math.PI) / 180;
          const x = 200 + Math.cos(angle - Math.PI/2) * radius;
          const y = 200 + Math.sin(angle - Math.PI/2) * radius;

          return (
            <g key={quadrant.element}>
              {/* Petal Path */}
              <motion.ellipse
                cx={x}
                cy={y}
                rx="25"
                ry="40"
                fill={quadrant.visualPetal.primaryColor}
                fillOpacity={0.3 + (intensity / 100) * 0.4}
                stroke={quadrant.visualPetal.glowColor}
                strokeWidth="2"
                strokeOpacity={intensity / 100}
                className="cursor-pointer"
                whileHover={{ scale: 1.1 }}
                animate={{
                  fill: intensity > 70 ? quadrant.visualPetal.glowColor : quadrant.visualPetal.primaryColor,
                  filter: intensity > 70 ? `drop-shadow(0 0 10px ${quadrant.visualPetal.glowColor}30)` : 'none'
                }}
              />
              
              {/* Draggable Handle */}
              <motion.circle
                cx={x}
                cy={y}
                r="12"
                fill={quadrant.visualPetal.primaryColor}
                stroke="white"
                strokeWidth="2"
                className="cursor-grab active:cursor-grabbing"
                drag
                dragConstraints={{
                  left: 130, right: 270,
                  top: 130, bottom: 270
                }}
                onDrag={(event, info) => {
                  handlePetalDrag(quadrant.element, info.point.x, info.point.y);
                }}
                whileDrag={{ scale: 1.2, zIndex: 10 }}
                whileHover={{ scale: 1.1 }}
              />

              {/* Element Symbol */}
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="text-xs font-medium fill-white pointer-events-none"
              >
                {quadrant.element === 'fire' && '🔥'}
                {quadrant.element === 'water' && '💧'} 
                {quadrant.element === 'earth' && '🌍'}
                {quadrant.element === 'air' && '💨'}
              </text>

              {/* Tooltip */}
              {showTooltips && (
                <foreignObject x={x - 60} y={y + 50} width="120" height="40">
                  <div className="bg-black/80 text-white text-xs rounded px-2 py-1 text-center">
                    {quadrant.microGuide}
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* Sacred Center (Aether) */}
        <motion.circle
          ref={centerRef}
          cx="200"
          cy="200" 
          r="20"
          fill="url(#aetherGradient)"
          stroke="rgba(255, 215, 0, 0.8)"
          strokeWidth="2"
          className="cursor-pointer"
          onClick={handleSoulprintComplete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            opacity: getBalanceScore() > 60 ? 1 : 0.6,
            filter: getBalanceScore() > 80 ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))' : 'none'
          }}
        />

        {/* Center completion text */}
        <text
          x="200"
          y="205"
          textAnchor="middle"
          className="text-xs font-medium fill-white pointer-events-none"
        >
          ✨
        </text>

        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="aetherGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 215, 0, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 215, 0, 0.3)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Completion Status */}
      {isCompleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gold-whisper border border-gold-divine/30 rounded-sacred px-sacred-md py-sacred-sm">
            <p className="type-micro-poetry text-gold-divine">
              Your soulprint blooms... ✨
            </p>
          </div>
        </motion.div>
      )}

      {/* Balance Indicator */}
      <div className="absolute top-6 right-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-sacred p-3">
          <div className="text-xs text-neutral-shadow mb-1">Balance</div>
          <div className="w-16 h-2 bg-neutral-silver/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-earth-shadow via-earth-base to-gold-divine rounded-full"
              animate={{ width: `${getBalanceScore()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs text-neutral-mystic mt-1">
            {Math.round(getBalanceScore())}%
          </div>
        </div>
      </div>

    </div>
  );
};

export default BetaHoloflower;