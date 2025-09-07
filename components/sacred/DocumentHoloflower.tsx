'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type ElementalBalance = {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
};

type DocumentAnalysis = {
  dominantElement: keyof ElementalBalance;
  elementalBalance: ElementalBalance;
  keyThemes: string[];
  shadowAspects: string[];
  coherenceIndicators: string[];
  aetherResonance: number;
};

interface DocumentHoloflowerProps {
  analysis: DocumentAnalysis;
  size?: number;
  animate?: boolean;
  pulseResonance?: boolean;
}

const elementColors = {
  fire: { base: '#ef4444', glow: '#f87171', light: '#fca5a5' },
  water: { base: '#3b82f6', glow: '#60a5fa', light: '#93c5fd' },
  earth: { base: '#22c55e', glow: '#4ade80', light: '#86efac' },
  air: { base: '#eab308', glow: '#facc15', light: '#fde047' },
  aether: { base: '#8b5cf6', glow: '#a78bfa', light: '#c4b5fd' }
};

export function DocumentHoloflower({ 
  analysis, 
  size = 60, 
  animate = false,
  pulseResonance = true 
}: DocumentHoloflowerProps) {
  const { elementalBalance, dominantElement, aetherResonance } = analysis;
  
  // Create petal data based on elemental balance
  const petals = useMemo(() => {
    return Object.entries(elementalBalance).map(([element, intensity], index) => {
      const angle = (index * 72) - 90; // 5 petals, 72 degrees apart, starting at top
      const colors = elementColors[element as keyof ElementalBalance];
      const radius = (size * 0.4) * (0.3 + intensity * 0.7); // Scale radius by intensity
      
      return {
        element,
        intensity,
        angle,
        radius,
        colors,
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
      };
    });
  }, [elementalBalance, size]);

  const centerRadius = size * 0.15;
  const dominantColors = elementColors[dominantElement];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          {/* Gradients for each element */}
          {Object.entries(elementColors).map(([element, colors]) => (
            <radialGradient key={element} id={`${element}-gradient`}>
              <stop offset="0%" stopColor={colors.light} stopOpacity="0.9" />
              <stop offset="50%" stopColor={colors.base} stopOpacity="0.7" />
              <stop offset="100%" stopColor={colors.glow} stopOpacity="0.3" />
            </radialGradient>
          ))}
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feMorphology operator="dilate" radius="2"/>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        {/* Background glow ring */}
        {pulseResonance && aetherResonance > 0.5 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill="none"
            stroke={dominantColors.glow}
            strokeWidth="1"
            opacity="0.3"
            animate={animate ? {
              r: [size * 0.4, size * 0.5, size * 0.4],
              opacity: [0.2, 0.5, 0.2]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Petals */}
        {petals.map(({ element, intensity, x, y, colors, radius }, index) => (
          <motion.g key={element}>
            {/* Petal glow */}
            <motion.circle
              cx={size / 2 + x}
              cy={size / 2 + y}
              r={radius * 0.8}
              fill={`url(#${element}-gradient)`}
              opacity="0.4"
              filter="url(#glow)"
              initial={animate ? { scale: 0, opacity: 0 } : {}}
              animate={animate ? { 
                scale: 1, 
                opacity: 0.4,
                ...(intensity > 0.7 && pulseResonance ? {
                  scale: [1, 1.1, 1],
                } : {})
              } : {}}
              transition={{
                delay: animate ? index * 0.1 : 0,
                duration: animate ? (intensity > 0.7 ? 2 : 0.8) : 0,
                repeat: (animate && intensity > 0.7 && pulseResonance) ? Infinity : 0,
                ease: "easeOut"
              }}
            />
            
            {/* Petal core */}
            <motion.circle
              cx={size / 2 + x}
              cy={size / 2 + y}
              r={radius * 0.5}
              fill={colors.base}
              opacity={0.6 + intensity * 0.4}
              initial={animate ? { scale: 0, opacity: 0 } : {}}
              animate={animate ? { 
                scale: 1, 
                opacity: 0.6 + intensity * 0.4 
              } : {}}
              transition={{
                delay: animate ? index * 0.1 + 0.2 : 0,
                duration: 0.6,
                ease: "easeOut"
              }}
            />
            
            {/* High intensity sparkle */}
            {intensity > 0.8 && (
              <motion.circle
                cx={size / 2 + x}
                cy={size / 2 + y}
                r={2}
                fill={colors.light}
                opacity="0.9"
                initial={animate ? { scale: 0, opacity: 0 } : {}}
                animate={animate ? {
                  scale: [0, 1.2, 0],
                  opacity: [0, 0.9, 0],
                } : {}}
                transition={{
                  delay: animate ? index * 0.1 + 0.5 : 0,
                  duration: 1.5,
                  repeat: pulseResonance ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.g>
        ))}

        {/* Center core */}
        <motion.g>
          {/* Center glow */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={centerRadius * 1.5}
            fill={`url(#${dominantElement}-gradient)`}
            opacity="0.3"
            filter="url(#glow)"
            initial={animate ? { scale: 0, opacity: 0 } : {}}
            animate={animate ? { 
              scale: 1, 
              opacity: 0.3,
              ...(aetherResonance > 0.8 && pulseResonance ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              } : {})
            } : {}}
            transition={{
              delay: animate ? 0.5 : 0,
              duration: animate ? 0.8 : 0,
              repeat: (animate && aetherResonance > 0.8 && pulseResonance) ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          
          {/* Center core */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={centerRadius}
            fill={dominantColors.base}
            opacity="0.8"
            initial={animate ? { scale: 0, opacity: 0 } : {}}
            animate={animate ? { scale: 1, opacity: 0.8 } : {}}
            transition={{
              delay: animate ? 0.3 : 0,
              duration: 0.6,
              ease: "easeOut"
            }}
          />
          
          {/* Center highlight */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={centerRadius * 0.6}
            fill={dominantColors.light}
            opacity="0.7"
            initial={animate ? { scale: 0, opacity: 0 } : {}}
            animate={animate ? { scale: 1, opacity: 0.7 } : {}}
            transition={{
              delay: animate ? 0.6 : 0,
              duration: 0.4,
              ease: "easeOut"
            }}
          />
          
          {/* Aether resonance indicator */}
          {aetherResonance > 0.6 && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={3}
              fill={elementColors.aether.light}
              opacity="0.9"
              initial={animate ? { scale: 0, opacity: 0 } : {}}
              animate={animate ? {
                scale: [0, 1.5, 0],
                opacity: [0, 0.9, 0],
              } : {}}
              transition={{
                delay: animate ? 0.8 : 0,
                duration: 2,
                repeat: pulseResonance ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.g>

        {/* Connection lines between strong elements */}
        {petals.filter(p => p.intensity > 0.6).map((petal, index, strongPetals) => {
          if (index === strongPetals.length - 1) return null;
          const nextPetal = strongPetals[index + 1];
          return (
            <motion.line
              key={`${petal.element}-${nextPetal.element}`}
              x1={size / 2 + petal.x}
              y1={size / 2 + petal.y}
              x2={size / 2 + nextPetal.x}
              y2={size / 2 + nextPetal.y}
              stroke={dominantColors.glow}
              strokeWidth="1"
              opacity="0.2"
              initial={animate ? { pathLength: 0, opacity: 0 } : {}}
              animate={animate ? { pathLength: 1, opacity: 0.2 } : {}}
              transition={{
                delay: animate ? 1.2 : 0,
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          );
        })}
      </svg>

      {/* Floating resonance particles */}
      {animate && aetherResonance > 0.7 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ 
                backgroundColor: elementColors.aether.light,
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                x: [0, (Math.random() - 0.5) * size],
                y: [0, (Math.random() - 0.5) * size],
              }}
              transition={{
                delay: 1.5 + (i * 0.3),
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}