'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeForMobile, getOptimizedAnimationSettings } from '@/lib/motion/mobile-optimizations';
import { getFrequencyForElement, getPulseDuration } from '@/lib/audio/sacred-tones';
import { getElementColor, getStaggerDelay } from '@/lib/motion/motion-mapper';

interface HoloflowerMobileProps {
  activeElements: string[];
  aetherStage: number;
  coherenceLevel?: number;
  audioState?: 'on' | 'silent' | 'off';
  onPetalTap?: (element: string) => void;
}

export const HoloflowerMobile: React.FC<HoloflowerMobileProps> = ({
  activeElements = [],
  aetherStage = 0,
  coherenceLevel = 0.5,
  audioState = 'off',
  onPetalTap
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const { visible, shimmer, performanceMode } = optimizeForMobile(activeElements);
  const animSettings = getOptimizedAnimationSettings(performanceMode);
  
  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Detect tap (minimal movement)
    if (deltaX < 10 && deltaY < 10) {
      // Could determine which petal was tapped based on position
      // For now, just trigger callback
      if (onPetalTap && visible[0]) {
        onPetalTap(visible[0]);
      }
    }
    setTouchStart(null);
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full max-w-[500px] max-h-[500px]">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ transform: animSettings.useGPU ? 'translateZ(0)' : undefined }}
        >
          {/* Background gradient for atmosphere */}
          <defs>
            <radialGradient id="mobile-gradient">
              <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            
            {shimmer && (
              <radialGradient id="shimmer-gradient">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#C77DFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            )}
          </defs>
          
          {/* Base atmosphere */}
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="url(#mobile-gradient)"
          />
          
          {/* Shimmer field for overflow elements */}
          <AnimatePresence>
            {shimmer && (
              <motion.circle
                cx="200"
                cy="200"
                r="180"
                fill="url(#shimmer-gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
          
          {/* Silent Resonance Rings - frequency-synced */}
          {audioState === 'silent' && visible.map((element, i) => {
            const freq = getFrequencyForElement(element);
            const duration = getPulseDuration(freq);
            const radius = 80 + i * 30;
            
            return (
              <motion.circle
                key={`${element}-resonance`}
                cx="200"
                cy="200"
                r={radius}
                fill="none"
                stroke={getElementColor(element)}
                strokeWidth="1"
                strokeOpacity="0.3"
                animate={{
                  r: [radius, radius + 40, radius],
                  strokeOpacity: [0.3, 0.1, 0.3],
                  strokeWidth: [1, 2, 1]
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: getStaggerDelay(i, visible.length)
                }}
              />
            );
          })}
          
          {/* Active element petals */}
          {visible.map((element, i) => {
            const angle = (i / visible.length) * Math.PI * 2 - Math.PI / 2;
            const x = 200 + Math.cos(angle) * 120;
            const y = 200 + Math.sin(angle) * 120;
            const freq = getFrequencyForElement(element);
            const pulseDuration = audioState === 'silent' ? getPulseDuration(freq) : 3;
            
            return (
              <motion.g key={element}>
                {/* Petal glow */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="25"
                  fill={getElementColor(element)}
                  fillOpacity="0.4"
                  animate={{
                    scale: [1, 1.2, 1],
                    fillOpacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{
                    duration: pulseDuration,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Petal core */}
                <circle
                  cx={x}
                  cy={y}
                  r="15"
                  fill={getElementColor(element)}
                  fillOpacity="0.8"
                />
              </motion.g>
            );
          })}
          
          {/* Harmonic chord overlay (when multiple elements active) */}
          {visible.length > 2 && audioState !== 'off' && (
            <motion.g>
              {visible.slice(0, 3).map((el, i) => (
                <motion.line
                  key={`chord-${i}`}
                  x1="200"
                  y1="200"
                  x2={200 + Math.cos((i / 3) * Math.PI * 2) * 100}
                  y2={200 + Math.sin((i / 3) * Math.PI * 2) * 100}
                  stroke={getElementColor(el)}
                  strokeWidth="0.5"
                  strokeOpacity="0.3"
                  animate={{
                    strokeOpacity: [0.3, 0.6, 0.3],
                    strokeWidth: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </motion.g>
          )}
          
          {/* Aether center */}
          <AnimatePresence>
            {aetherStage > 0 && (
              <motion.g>
                <motion.circle
                  cx="200"
                  cy="200"
                  r={15 + aetherStage * 8}
                  fill="#C77DFF"
                  fillOpacity="0.6"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    fillOpacity: [0.6, 0.9, 0.6]
                  }}
                  exit={{ scale: 0 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                />
                
                {/* Aether rays for stage 3 */}
                {aetherStage >= 3 && (
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {[...Array(6)].map((_, i) => {
                      const angle = (i / 6) * Math.PI * 2;
                      return (
                        <line
                          key={i}
                          x1="200"
                          y1="200"
                          x2={200 + Math.cos(angle) * 60}
                          y2={200 + Math.sin(angle) * 60}
                          stroke="#FFD700"
                          strokeWidth="1"
                          strokeOpacity="0.4"
                        />
                      );
                    })}
                  </motion.g>
                )}
              </motion.g>
            )}
          </AnimatePresence>
          
          {/* Coherence ring */}
          <circle
            cx="200"
            cy="200"
            r="170"
            fill="none"
            stroke="#C77DFF"
            strokeWidth="1"
            strokeDasharray={`${coherenceLevel * 1068} 1068`}
            strokeLinecap="round"
            strokeOpacity="0.3"
            transform="rotate(-90 200 200)"
          />
        </svg>
        
        {/* Performance indicator (dev mode only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 text-xs text-gray-500">
            {performanceMode} mode
          </div>
        )}
      </div>
    </div>
  );
};

export default HoloflowerMobile;