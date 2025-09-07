'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HoloflowerLogoProps {
  state?: 'entering' | 'idle' | 'exiting' | 'shadow' | 'coherent';
  size?: number;
  coherenceLevel?: number;
  shadowDetected?: boolean;
}

export const HoloflowerLogo: React.FC<HoloflowerLogoProps> = ({
  state = 'idle',
  size = 120,
  coherenceLevel = 0.5,
  shadowDetected = false
}) => {
  // Extended variants with coherence and shadow states
  const variants = {
    entering: { 
      scale: [0.2, 1.2, 1], 
      opacity: [0, 1, 1], 
      rotate: [0, 180, 360],
      transition: { duration: 2, ease: "easeOut" }
    },
    idle: { 
      scale: [1, 1.05, 1], 
      opacity: 1, 
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } 
    },
    exiting: { 
      scale: [1, 0.2], 
      opacity: [1, 0], 
      rotate: [0, -180],
      transition: { duration: 1.5, ease: "easeIn" }
    },
    shadow: {
      scale: [1, 0.95, 1, 1.05, 1],
      opacity: [1, 0.4, 1, 0.4, 1],
      filter: ["hue-rotate(0deg)", "hue-rotate(-30deg)", "hue-rotate(0deg)"],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
    },
    coherent: {
      scale: 1 + coherenceLevel * 0.2,
      opacity: 0.7 + coherenceLevel * 0.3,
      filter: `brightness(${1 + coherenceLevel * 0.5})`,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  // Determine actual state based on conditions
  const actualState = shadowDetected ? 'shadow' : 
                      coherenceLevel > 0.8 ? 'coherent' : 
                      state;

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      {/* Coherence glow effect */}
      {coherenceLevel > 0.7 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(199,125,255,${coherenceLevel * 0.5}) 0%, transparent 70%)`,
            filter: 'blur(20px)',
            width: size * 1.5,
            height: size * 1.5,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [coherenceLevel * 0.5, coherenceLevel * 0.8, coherenceLevel * 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Main logo */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        variants={variants}
        animate={actualState}
        className="relative z-10"
      >
        {/* Holoflower Sacred Geometry */}
        <defs>
          <radialGradient id="holoflower-gradient">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#C77DFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Outer petals ring */}
        <g transform="translate(100, 100)">
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 60;
            const y = Math.sin(angle) * 60;
            
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="15"
                fill="url(#holoflower-gradient)"
                fillOpacity="0.8"
                animate={shadowDetected ? {
                  fillOpacity: [0.8, 0.3, 0.8],
                  scale: [1, 0.8, 1]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: shadowDetected ? Infinity : 0,
                  delay: i * 0.1 
                }}
              />
            );
          })}
          
          {/* Center core */}
          <motion.circle
            cx="0"
            cy="0"
            r="25"
            fill="url(#holoflower-gradient)"
            animate={{
              scale: coherenceLevel > 0.5 ? [1, 1.2, 1] : 1,
              fillOpacity: [0.9, 1, 0.9]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Sacred geometry lines */}
          {[...Array(6)].map((_, i) => {
            const angle1 = (i / 6) * Math.PI * 2;
            const angle2 = ((i + 1) / 6) * Math.PI * 2;
            const x1 = Math.cos(angle1) * 60;
            const y1 = Math.sin(angle1) * 60;
            const x2 = Math.cos(angle2) * 60;
            const y2 = Math.sin(angle2) * 60;
            
            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#C77DFF"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            );
          })}
        </g>
      </motion.svg>

      {/* Shadow flicker overlay */}
      {shadowDetected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)',
            mixBlendMode: 'multiply'
          }}
          animate={{
            opacity: [0, 0.5, 0]
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

export default HoloflowerLogo;