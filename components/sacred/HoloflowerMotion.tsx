'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getElementColor, getStaggerDelay } from '@/lib/motion/motion-mapper';

interface HoloflowerMotionProps {
  state?: any;
  coherenceLevel?: number;
  shadowPetals?: string[];
  aetherStage?: number;
  voiceActive?: boolean;
  fullscreen?: boolean;
  chord?: boolean;
  elements?: string[];
}

export const HoloflowerMotion: React.FC<HoloflowerMotionProps> = ({
  state = 'listening',
  coherenceLevel = 0.5,
  shadowPetals = [],
  aetherStage = 1,
  voiceActive = false,
  fullscreen = false,
  chord = false,
  elements = []
}) => {
  const isGrandBloom = elements.length >= 12;
  const isMajorChord = elements.length >= 6;
  
  // Base container styles
  const containerClass = fullscreen 
    ? "fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    : "relative w-full h-full min-h-[400px]";

  return (
    <div className={containerClass}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[600px] max-h-[600px]"
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id="sacred-gradient">
            <stop offset="0%" stopColor="#C77DFF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#6C5CE7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2D3436" stopOpacity="0.1" />
          </radialGradient>
          
          {/* Grand bloom gradient */}
          {isGrandBloom && (
            <radialGradient id="bloom-gradient">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#FFA500" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#FF69B4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C77DFF" stopOpacity="0.1" />
            </radialGradient>
          )}
        </defs>

        {/* Base circle */}
        <motion.circle
          cx="200"
          cy="200"
          r="180"
          fill="url(#sacred-gradient)"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Voice active pulse */}
        <AnimatePresence>
          {voiceActive && (
            <motion.circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="#C77DFF"
              strokeWidth="2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          )}
        </AnimatePresence>

        {/* Chord elements glow */}
        {chord && elements.map((el, i) => {
          const angle = (i / elements.length) * Math.PI * 2;
          const x = 200 + Math.cos(angle) * 120;
          const y = 200 + Math.sin(angle) * 120;
          
          return (
            <motion.circle
              key={el}
              cx={x}
              cy={y}
              r="30"
              fill={getElementColor(el)}
              fillOpacity="0.3"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: getStaggerDelay(i, elements.length)
              }}
            />
          );
        })}

        {/* Harmonic ripples */}
        {(chord || state === 'responding') && (
          <>
            <motion.circle
              cx="200"
              cy="200"
              r="100"
              fill="none"
              stroke={isGrandBloom ? "#FFD700" : "#C77DFF"}
              strokeWidth="1"
              strokeOpacity="0.5"
              animate={{
                r: [100, 180, 100],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: isGrandBloom ? 6 : 4,
                repeat: Infinity
              }}
            />
            
            {isMajorChord && (
              <motion.circle
                cx="200"
                cy="200"
                r="120"
                fill="none"
                stroke="#6C5CE7"
                strokeWidth="1"
                strokeOpacity="0.3"
                animate={{
                  r: [120, 200, 120],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
            )}
          </>
        )}

        {/* Grand bloom effect */}
        {isGrandBloom && (
          <>
            {/* Central starburst */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x1 = 200 + Math.cos(angle) * 50;
                const y1 = 200 + Math.sin(angle) * 50;
                const x2 = 200 + Math.cos(angle) * 150;
                const y2 = 200 + Math.sin(angle) * 150;
                
                return (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#bloom-gradient)"
                    strokeWidth="2"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      strokeWidth: [2, 4, 2]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                );
              })}
            </motion.g>
            
            {/* Golden shimmer ring */}
            <motion.circle
              cx="200"
              cy="200"
              r="160"
              fill="none"
              stroke="#FFD700"
              strokeWidth="3"
              strokeOpacity="0.6"
              strokeDasharray="10 5"
              animate={{
                rotate: [0, 360],
                strokeOpacity: [0.6, 1, 0.6],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ transformOrigin: "center" }}
            />
          </>
        )}

        {/* Breakthrough state */}
        {state === 'breakthrough' && !isGrandBloom && (
          <motion.circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="#FFD700"
            strokeWidth="4"
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [1, 2, 2.5],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        )}

        {/* Coherence indicator */}
        <motion.circle
          cx="200"
          cy="200"
          r="40"
          fill="none"
          stroke="#C77DFF"
          strokeWidth="2"
          strokeDasharray={`${coherenceLevel * 251} 251`}
          strokeLinecap="round"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ transformOrigin: "center" }}
        />

        {/* Aether stage center */}
        <motion.circle
          cx="200"
          cy="200"
          r={20 + aetherStage * 5}
          fill="#C77DFF"
          fillOpacity="0.6"
          animate={{
            scale: [1, 1.1, 1],
            fillOpacity: [0.6, 0.9, 0.6]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        />

        {/* Shadow petals */}
        {shadowPetals.map((petal, i) => {
          const angle = (i / shadowPetals.length) * Math.PI * 2;
          const x = 200 + Math.cos(angle) * 140;
          const y = 200 + Math.sin(angle) * 140;
          
          return (
            <motion.circle
              key={petal}
              cx={x}
              cy={y}
              r="15"
              fill="#636E72"
              fillOpacity="0.4"
              animate={{
                scale: [1, 0.8, 1],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          );
        })}
      </svg>

      {/* State label */}
      {!fullscreen && (
        <div className="absolute bottom-4 left-4 text-sm text-gray-600">
          {state === 'listening' && 'Listening...'}
          {state === 'processing' && 'Processing...'}
          {state === 'responding' && 'Oracle Responds'}
          {state === 'breakthrough' && 'Breakthrough!'}
          {isGrandBloom && 'Grand Harmonic Bloom'}
        </div>
      )}
    </div>
  );
};

export default HoloflowerMotion;