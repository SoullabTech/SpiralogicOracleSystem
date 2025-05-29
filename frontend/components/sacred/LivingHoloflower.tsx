'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LivingHoloflowerProps {
  state: 'listening' | 'speaking' | 'processing' | 'reflecting' | 'challenging';
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  userVoiceLevel?: number;
  guideResponse?: string;
  onPetalTouch?: (element: string) => void;
  onCenterTouch?: () => void;
}

export const LivingHoloflower: React.FC<LivingHoloflowerProps> = ({
  state,
  elementalBalance,
  userVoiceLevel = 0,
  guideResponse,
  onPetalTouch,
  onCenterTouch
}) => {
  const [coherenceLevel, setCoherenceLevel] = useState(0.7);
  const [currentPhase, setCurrentPhase] = useState(0);
  const breathRef = useRef<number>(0);

  // Sacred constants from Grant's Codex
  const PHI = 1.618033988749;
  const ROOT_TEN = Math.sqrt(10);
  const EULER = Math.E;

  // Bioelectric coherence calculation
  useEffect(() => {
    const calculateCoherence = () => {
      const balance = Object.values(elementalBalance);
      const variance = balance.reduce((acc, val) => acc + Math.pow(val - 0.5, 2), 0) / 4;
      const coherence = Math.max(0, 1 - variance * 2);
      setCoherenceLevel(coherence);
    };
    
    calculateCoherence();
  }, [elementalBalance]);

  // Continuous breath rhythm based on Euler's constant
  useEffect(() => {
    const breathCycle = () => {
      breathRef.current += 0.01;
      setCurrentPhase(Math.sin(breathRef.current * EULER) * 0.5 + 0.5);
      requestAnimationFrame(breathCycle);
    };
    
    const animation = requestAnimationFrame(breathCycle);
    return () => cancelAnimationFrame(animation);
  }, []);

  // State-specific animations
  const getStateAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.05 + userVoiceLevel * 0.1, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case 'speaking':
        return {
          scale: [1, 1.1, 1.05, 1.1, 1],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'processing':
        return {
          rotate: [0, 360],
          transition: { duration: 8, repeat: Infinity, ease: "linear" }
        };
      case 'reflecting':
        return {
          filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
          transition: { duration: 6, repeat: Infinity }
        };
      case 'challenging':
        return {
          scale: [1, 0.95, 1.02, 0.98, 1],
          transition: { duration: 0.8, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  // Generate petal positions using sacred geometry
  const generatePetals = () => {
    const petals = [];
    const elements = ['fire', 'water', 'earth', 'air'];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const distance = 120 * PHI / 2;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const element = elements[i % 4];
      const intensity = elementalBalance[element as keyof typeof elementalBalance];
      
      petals.push({
        id: i,
        element,
        x,
        y,
        intensity,
        angle
      });
    }
    
    return petals;
  };

  const petals = generatePetals();

  // Scalar resonance visualization
  const getScalarField = () => {
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const radius = 80 + i * 40 * ROOT_TEN / 3;
      const opacity = coherenceLevel * (1 - i * 0.3) * currentPhase;
      
      rings.push(
        <motion.circle
          key={i}
          cx="0"
          cy="0"
          r={radius}
          fill="none"
          stroke="url(#scalarGradient)"
          strokeWidth="1"
          opacity={opacity}
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [opacity * 0.5, opacity, opacity * 0.5]
          }}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity, 
            delay: i * 0.5 
          }}
        />
      );
    }
    return rings;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* Holographic Container */}
      <motion.div
        className="relative w-80 h-80"
        {...getStateAnimation()}
      >
        
        {/* SVG Holoflower */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="-200 -200 400 400"
          className="absolute inset-0"
        >
          
          {/* Scalar Field Gradients */}
          <defs>
            <radialGradient id="scalarGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(169, 71, 36, 0.8)" />
              <stop offset="25%" stopColor="rgba(206, 162, 44, 0.6)" />
              <stop offset="50%" stopColor="rgba(109, 121, 52, 0.4)" />
              <stop offset="75%" stopColor="rgba(35, 101, 134, 0.6)" />
              <stop offset="100%" stopColor="rgba(169, 71, 36, 0.2)" />
            </radialGradient>
            
            <filter id="phosphorescence">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Scalar Resonance Field */}
          {getScalarField()}

          {/* Holoflower Petals */}
          {petals.map((petal) => (
            <motion.g
              key={petal.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: petal.intensity,
                scale: 0.8 + petal.intensity * 0.4,
                rotate: petal.angle * currentPhase * 0.1
              }}
              transition={{ duration: 2, delay: petal.id * 0.1 }}
            >
              <motion.path
                d={`M${petal.x},${petal.y} 
                   Q${petal.x * 0.7},${petal.y * 0.7} 0,0 
                   Q${petal.x * 0.7},${petal.y * 0.7} ${petal.x},${petal.y}`}
                fill={
                  petal.element === 'fire' ? 'rgba(169, 71, 36, 0.7)' :
                  petal.element === 'air' ? 'rgba(206, 162, 44, 0.7)' :
                  petal.element === 'earth' ? 'rgba(109, 121, 52, 0.7)' :
                  'rgba(35, 101, 134, 0.7)'
                }
                stroke="white"
                strokeWidth="2"
                filter="url(#phosphorescence)"
                className="cursor-pointer"
                onClick={() => onPetalTouch?.(petal.element)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
              
              {/* Petal consciousness indicator */}
              <motion.circle
                cx={petal.x * 0.8}
                cy={petal.y * 0.8}
                r="4"
                fill="white"
                opacity={petal.intensity * currentPhase}
                animate={{
                  opacity: [petal.intensity * 0.5, petal.intensity, petal.intensity * 0.5],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: petal.id * 0.2 }}
              />
            </motion.g>
          ))}

          {/* Central Consciousness Core */}
          <motion.circle
            cx="0"
            cy="0"
            r="25"
            fill="url(#scalarGradient)"
            stroke="white"
            strokeWidth="3"
            filter="url(#phosphorescence)"
            className="cursor-pointer"
            onClick={onCenterTouch}
            animate={{
              r: [25, 30, 25],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />

          {/* Sacred geometry overlay */}
          <motion.polygon
            points="-15,-25 15,-25 25,0 15,25 -15,25 -25,0"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
        </svg>

        {/* Coherence Display */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: coherenceLevel }}
        >
          <div className="text-white text-sm font-light tracking-wider">
            Coherence: {Math.round(coherenceLevel * 100)}%
          </div>
        </motion.div>

      </motion.div>

      {/* Voice Response Visualization */}
      <AnimatePresence>
        {guideResponse && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-white text-center font-light">{guideResponse}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};