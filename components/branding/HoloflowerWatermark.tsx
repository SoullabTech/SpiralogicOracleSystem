'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HoloflowerWatermarkProps {
  mode?: 'dark' | 'light';
  aetherPulse?: boolean;
  coherenceLevel?: number;
  shadowActive?: boolean;
}

export const HoloflowerWatermark: React.FC<HoloflowerWatermarkProps> = ({
  mode = 'dark',
  aetherPulse = false,
  coherenceLevel = 0,
  shadowActive = false
}) => {
  // Dynamic opacity based on coherence
  const baseOpacity = 0.05 + coherenceLevel * 0.15; // 5% to 20% opacity
  const maxOpacity = Math.min(baseOpacity * 2, 0.3); // Cap at 30%
  
  return (
    <motion.div
      className={`fixed inset-0 pointer-events-none overflow-hidden
        ${mode === 'dark' ? 'bg-gradient-to-b from-black via-gray-950 to-black' : 
                            'bg-gradient-to-b from-white via-gray-50 to-white'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      {/* Main watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={
          shadowActive ? {
            opacity: [baseOpacity, baseOpacity * 0.3, baseOpacity],
            filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
          } : aetherPulse ? {
            scale: [1, 1.1, 1],
            opacity: [baseOpacity, maxOpacity, baseOpacity]
          } : {}
        }
        transition={
          shadowActive ? {
            duration: 1,
            repeat: Infinity
          } : aetherPulse ? {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}
        }
      >
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className={`${mode === 'dark' ? 'text-amber-500/20' : 'text-amber-400/20'}`}
          style={{ opacity: baseOpacity }}
        >
          {/* Sacred geometry pattern */}
          <g transform="translate(200, 200)">
            {/* Outer ring of petals */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const x = Math.cos(angle) * 120;
              const y = Math.sin(angle) * 120;
              
              return (
                <circle
                  key={`outer-${i}`}
                  cx={x}
                  cy={y}
                  r="30"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
              );
            })}
            
            {/* Inner ring of petals */}
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * 60;
              const y = Math.sin(angle) * 60;
              
              return (
                <circle
                  key={`inner-${i}`}
                  cx={x}
                  cy={y}
                  r="20"
                  fill="currentColor"
                  fillOpacity="0.5"
                />
              );
            })}
            
            {/* Center core */}
            <circle
              cx="0"
              cy="0"
              r="40"
              fill="currentColor"
              fillOpacity="0.7"
            />
            
            {/* Sacred lines */}
            {[...Array(6)].map((_, i) => {
              const angle1 = (i / 6) * Math.PI * 2;
              const angle2 = ((i + 1) / 6) * Math.PI * 2;
              const x1 = Math.cos(angle1) * 120;
              const y1 = Math.sin(angle1) * 120;
              const x2 = Math.cos(angle2) * 120;
              const y2 = Math.sin(angle2) * 120;
              
              return (
                <line
                  key={`line-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeOpacity="0.2"
                />
              );
            })}
          </g>
        </svg>
      </motion.div>

      {/* Aether pulse rays */}
      {aetherPulse && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = 200 + Math.cos(angle) * 100;
            const y1 = 200 + Math.sin(angle) * 100;
            const x2 = 200 + Math.cos(angle) * 300;
            const y2 = 200 + Math.sin(angle) * 300;
            
            return (
              <motion.div
                key={`ray-${i}`}
                className="absolute"
                style={{
                  background: `linear-gradient(to right, transparent, ${
                    mode === 'dark' ? 'rgba(199,125,255,0.1)' : 'rgba(199,125,255,0.05)'
                  }, transparent)`,
                  width: '2px',
                  height: '200px',
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center top',
                  transform: `rotate(${(i * 45)}deg) translateX(-50%)`
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scaleY: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </motion.div>
      )}

      {/* Coherence shimmer */}
      {coherenceLevel > 0.7 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, 
              ${mode === 'dark' ? 
                `rgba(255,215,0,${coherenceLevel * 0.1})` : 
                `rgba(255,215,0,${coherenceLevel * 0.05})`} 0%, 
              transparent 50%)`
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Shadow interference */}
      {shadowActive && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.2) 70%)',
            mixBlendMode: 'multiply'
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  );
};

export default HoloflowerWatermark;