'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  getHoloflowerMotion, 
  getAnimationConfig, 
  calculateCoherence,
  detectShadowPetals,
  syncWithVoice,
  getColorForCoherence,
  type MotionState,
  type VoiceState
} from '@/lib/motion-states';

// ============================================
// Types
// ============================================

interface HoloflowerMotionProps {
  // Core data
  petalIntensities?: Record<string, number>;
  elementalBalance?: Record<string, number>;
  aetherStage?: 1 | 2 | 3 | null;
  
  // Motion states
  coherenceLevel?: number; // 0-1, calculated or provided
  shadowPetals?: string[]; // Petals in shadow
  voiceState?: VoiceState; // Voice sync data
  
  // Display options
  size?: number;
  showBreakthrough?: boolean;
  showCoherenceRings?: boolean;
  showShadowEffects?: boolean;
  
  // Callbacks
  onBreakthrough?: () => void;
  onShadowRelease?: (petal: string) => void;
  onAetherShift?: (stage: number) => void;
  
  className?: string;
}

interface PetalMotionProps {
  id: string;
  angle: number;
  element: string;
  stage: number;
  intensity: number;
  color: string;
  isShadowed: boolean;
  motionConfig: ReturnType<typeof getAnimationConfig>;
  coherence: number;
}

interface CoherenceRingProps {
  radius: number;
  motionConfig: ReturnType<typeof getAnimationConfig>;
  index: number;
}

// ============================================
// Constants
// ============================================

const ELEMENT_COLORS = {
  fire: '#FF6B35',
  water: '#4A90E2',
  earth: '#8B7355',
  air: '#A8DADC'
};

const PETALS = [
  { id: 'Fire1', angle: 0, element: 'fire', stage: 1 },
  { id: 'Fire2', angle: 30, element: 'fire', stage: 2 },
  { id: 'Fire3', angle: 60, element: 'fire', stage: 3 },
  { id: 'Water1', angle: 90, element: 'water', stage: 1 },
  { id: 'Water2', angle: 120, element: 'water', stage: 2 },
  { id: 'Water3', angle: 150, element: 'water', stage: 3 },
  { id: 'Earth1', angle: 180, element: 'earth', stage: 1 },
  { id: 'Earth2', angle: 210, element: 'earth', stage: 2 },
  { id: 'Earth3', angle: 240, element: 'earth', stage: 3 },
  { id: 'Air1', angle: 270, element: 'air', stage: 1 },
  { id: 'Air2', angle: 300, element: 'air', stage: 2 },
  { id: 'Air3', angle: 330, element: 'air', stage: 3 }
];

// ============================================
// Coherence Rings Component
// ============================================

const CoherenceRing: React.FC<CoherenceRingProps> = ({ 
  radius, 
  motionConfig, 
  index 
}) => {
  return (
    <motion.circle
      r={radius}
      fill="none"
      stroke="white"
      strokeWidth={0.5 - index * 0.1}
      animate={{
        scale: motionConfig.ringAnimation.scale,
        opacity: motionConfig.ringAnimation.opacity,
        strokeWidth: motionConfig.ringPulse === 'jitter' 
          ? [0.5, 0.3, 0.6, 0.4, 0.5] 
          : [0.5 - index * 0.1]
      }}
      transition={{
        duration: motionConfig.ringAnimation.duration,
        ease: motionConfig.ringAnimation.ease,
        repeat: Infinity,
        delay: index * 0.2
      }}
    />
  );
};

// ============================================
// Petal Motion Component
// ============================================

const PetalMotion: React.FC<PetalMotionProps> = ({
  id,
  angle,
  element,
  stage,
  intensity,
  color,
  isShadowed,
  motionConfig,
  coherence
}) => {
  const [released, setReleased] = useState(false);
  
  // Shadow release animation
  useEffect(() => {
    if (!isShadowed && released === false) {
      setReleased(true);
      setTimeout(() => setReleased(false), 2000);
    }
  }, [isShadowed]);
  
  // Apply coherence-based color modulation
  const petalColor = getColorForCoherence(color, coherence);
  
  // Create petal path
  const baseLength = 80;
  const length = baseLength * (0.5 + intensity * 0.5);
  const width = baseLength * 0.3;
  
  const petalPath = `
    M 0,0
    Q ${width * 0.5},${length * 0.3} ${width * 0.3},${length * 0.6}
    T 0,${length}
    Q -${width * 0.3},${length * 0.6} -${width * 0.5},${length * 0.3}
    T 0,0
  `;
  
  // Shadow or normal animation
  const animationProps = isShadowed ? {
    opacity: [0.2, 0.25, 0.2],
    scale: [0.95, 0.9, 0.95],
    filter: ['blur(1px)', 'blur(2px)', 'blur(1px)']
  } : {
    opacity: motionConfig.petalAnimation.opacity,
    scale: motionConfig.petalAnimation.scale || [1, 1, 1],
    filter: motionConfig.petalAnimation.blur 
      ? [`blur(${motionConfig.petalAnimation.blur}px)`] 
      : ['blur(0px)']
  };
  
  return (
    <motion.g transform={`rotate(${angle})`}>
      {/* Shadow release burst */}
      {released && (
        <motion.circle
          r={length}
          fill={petalColor}
          fillOpacity={0}
          initial={{ scale: 0.5, fillOpacity: 0.3 }}
          animate={{ scale: 1.5, fillOpacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
      
      {/* Main petal */}
      <motion.path
        d={petalPath}
        fill={petalColor}
        fillOpacity={intensity * 0.6}
        stroke={petalColor}
        strokeWidth={1}
        animate={animationProps}
        transition={{
          duration: motionConfig.petalAnimation.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: angle / 360 * 0.5 // Sequential ripple
        }}
      />
      
      {/* Shimmer effect for high coherence */}
      {coherence > 0.7 && motionConfig.petalGlow === 'shimmer' && (
        <motion.path
          d={petalPath}
          fill="none"
          stroke="#FFD700"
          strokeWidth={0.5}
          strokeOpacity={0}
          animate={{
            strokeOpacity: [0, 0.3, 0],
            strokeWidth: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: angle / 360 * 0.5 + 1
          }}
        />
      )}
    </motion.g>
  );
};

// ============================================
// Aether Center Motion Component
// ============================================

interface AetherCenterMotionProps {
  stage: 1 | 2 | 3 | null;
  motionConfig: ReturnType<typeof getAnimationConfig>;
  size: number;
}

const AetherCenterMotion: React.FC<AetherCenterMotionProps> = ({
  stage,
  motionConfig,
  size
}) => {
  const radius = size / 8;
  
  const getAetherAnimation = () => {
    switch (motionConfig.centerEffect) {
      case 'expansive':
        return {
          scale: motionConfig.centerAnimation.scale,
          opacity: motionConfig.centerAnimation.opacity
        };
      case 'contractive':
        return {
          scale: motionConfig.centerAnimation.scale,
          opacity: motionConfig.centerAnimation.opacity
        };
      case 'stillness':
        return {
          scale: [1, 1, 1],
          opacity: [0.95, 1, 0.95]
        };
      default:
        return {
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3]
        };
    }
  };
  
  return (
    <>
      {/* Aether glow layers */}
      {stage && (
        <>
          {/* Outer glow */}
          <motion.circle
            r={radius * 2}
            fill="white"
            fillOpacity={0.1}
            animate={getAetherAnimation()}
            transition={{
              duration: motionConfig.centerAnimation.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Ripple effect for expansive */}
          {motionConfig.centerEffect === 'expansive' && (
            <motion.circle
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth={0.5}
              strokeOpacity={0}
              animate={{
                r: [radius, radius * 4, radius * 4],
                strokeOpacity: [0.5, 0, 0]
              }}
              transition={{
                duration: motionConfig.centerAnimation.duration * 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
          
          {/* Pull effect for contractive */}
          {motionConfig.centerEffect === 'contractive' && (
            <>
              {[0, 1, 2].map(i => (
                <motion.circle
                  key={i}
                  r={radius * 3}
                  fill="none"
                  stroke="white"
                  strokeWidth={0.3}
                  strokeOpacity={0}
                  animate={{
                    r: [radius * 3, radius, radius],
                    strokeOpacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: motionConfig.centerAnimation.duration,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeIn"
                  }}
                />
              ))}
            </>
          )}
        </>
      )}
      
      {/* Main center */}
      <motion.circle
        r={radius}
        fill="url(#aetherGradient)"
        fillOpacity={stage ? 0.8 : 0.3}
        stroke="white"
        strokeWidth={stage ? 2 : 1}
        animate={getAetherAnimation()}
        transition={{
          duration: motionConfig.centerAnimation.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: motionConfig.centerAnimation.blur 
            ? `blur(${motionConfig.centerAnimation.blur}px)` 
            : 'none'
        }}
      />
      
      {/* Stage indicator */}
      {stage && (
        <text
          y={2}
          textAnchor="middle"
          fill="white"
          fontSize={radius * 0.8}
          fontWeight="bold"
          opacity={motionConfig.centerEffect === 'stillness' ? 0.5 : 0.8}
        >
          {stage}
        </text>
      )}
    </>
  );
};

// ============================================
// Breakthrough Animation Component
// ============================================

const BreakthroughAnimation: React.FC<{ size: number }> = ({ size }) => {
  return (
    <motion.g>
      {/* Golden starburst */}
      {[0, 45, 90, 135].map(angle => (
        <motion.line
          key={angle}
          x1={0}
          y1={0}
          x2={0}
          y2={-size / 2}
          stroke="#FFD700"
          strokeWidth={2}
          strokeOpacity={0}
          transform={`rotate(${angle})`}
          animate={{
            y2: [-size / 4, -size / 1.5, -size / 1.5],
            strokeOpacity: [0, 0.8, 0],
            strokeWidth: [2, 4, 1]
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Center flash */}
      <motion.circle
        r={size / 6}
        fill="#FFD700"
        fillOpacity={0}
        animate={{
          r: [size / 6, size / 2, size / 2],
          fillOpacity: [0, 0.6, 0]
        }}
        transition={{
          duration: 1,
          ease: "easeOut"
        }}
      />
    </motion.g>
  );
};

// ============================================
// Main HoloflowerMotion Component
// ============================================

export const HoloflowerMotion: React.FC<HoloflowerMotionProps> = ({
  petalIntensities = {},
  elementalBalance = { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 },
  aetherStage = null,
  coherenceLevel,
  shadowPetals = [],
  voiceState,
  size = 400,
  showBreakthrough = true,
  showCoherenceRings = true,
  showShadowEffects = true,
  onBreakthrough,
  onShadowRelease,
  onAetherShift,
  className = ''
}) => {
  // Calculate or use provided coherence
  const coherence = coherenceLevel ?? calculateCoherence(elementalBalance);
  
  // Get motion state
  let motionState = getHoloflowerMotion(
    coherence,
    showShadowEffects ? shadowPetals : [],
    aetherStage,
    voiceState?.isActive
  );
  
  // Sync with voice if active
  if (voiceState?.isActive) {
    motionState = syncWithVoice(motionState, voiceState);
  }
  
  // Get animation configuration
  const animConfig = getAnimationConfig(motionState);
  
  // Track breakthrough
  const [showBreakthroughAnim, setShowBreakthroughAnim] = useState(false);
  
  useEffect(() => {
    if (motionState.breakthrough && showBreakthrough) {
      setShowBreakthroughAnim(true);
      if (onBreakthrough) onBreakthrough();
      setTimeout(() => setShowBreakthroughAnim(false), 2000);
    }
  }, [motionState.breakthrough]);
  
  // Track Aether shifts
  const prevAetherRef = useRef(aetherStage);
  useEffect(() => {
    if (prevAetherRef.current !== aetherStage && aetherStage && onAetherShift) {
      onAetherShift(aetherStage);
    }
    prevAetherRef.current = aetherStage;
  }, [aetherStage]);
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`${-size/2} ${-size/2} ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Definitions */}
        <defs>
          <radialGradient id="aetherGradient">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor="#E0E0E0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CCCCCC" stopOpacity="0.5" />
          </radialGradient>
        </defs>
        
        {/* Coherence rings (HeartMath-style) */}
        {showCoherenceRings && (
          <g className="coherence-rings">
            {[0.3, 0.5, 0.7].map((ratio, idx) => (
              <CoherenceRing
                key={idx}
                radius={size * ratio}
                motionConfig={animConfig}
                index={idx}
              />
            ))}
          </g>
        )}
        
        {/* Petals */}
        <g className="petals">
          {PETALS.map(petal => {
            const intensity = petalIntensities[petal.id] || 
                            elementalBalance[petal.element] * 0.5 || 
                            0.3;
            const isShadowed = motionState.shadowPetals.includes(petal.id);
            
            return (
              <PetalMotion
                key={petal.id}
                {...petal}
                intensity={intensity}
                color={ELEMENT_COLORS[petal.element as keyof typeof ELEMENT_COLORS]}
                isShadowed={isShadowed}
                motionConfig={animConfig}
                coherence={coherence}
              />
            );
          })}
        </g>
        
        {/* Aether center */}
        <g className="aether-center">
          <AetherCenterMotion
            stage={aetherStage}
            motionConfig={animConfig}
            size={size}
          />
        </g>
        
        {/* Breakthrough animation */}
        {showBreakthroughAnim && (
          <BreakthroughAnimation size={size} />
        )}
      </svg>
      
      {/* Debug info (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 text-xs text-white/50 p-2">
          <div>Coherence: {coherence.toFixed(2)}</div>
          <div>Motion: {motionState.ringPulse}</div>
          <div>Breathing: {motionState.breathingRate}s</div>
        </div>
      )}
    </div>
  );
};

export default HoloflowerMotion;