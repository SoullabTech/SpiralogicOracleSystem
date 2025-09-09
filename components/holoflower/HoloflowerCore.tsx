'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalVoicePreview } from '../voice/PetalVoicePreview';

interface Petal {
  id: number;
  element: 'air' | 'fire' | 'water' | 'earth' | 'aether';
  number: number;
  name: string;
  message: string;
  color: string;
  position: { angle: number; radius: number };
  state: 'dense' | 'emerging' | 'radiant';
}

const PETALS: Petal[] = [
  { id: 1, element: 'air', number: 1, name: 'Inspire', message: 'Breathe in new possibilities', color: '#87CEEB', position: { angle: 0, radius: 150 }, state: 'emerging' },
  { id: 2, element: 'air', number: 2, name: 'Collaborate', message: 'Connect with kindred spirits', color: '#ADD8E6', position: { angle: 30, radius: 150 }, state: 'emerging' },
  { id: 3, element: 'air', number: 3, name: 'Synthesize', message: 'Weave threads into wisdom', color: '#B0E0E6', position: { angle: 60, radius: 150 }, state: 'emerging' },
  { id: 4, element: 'fire', number: 1, name: 'Activate', message: 'Ignite your inner flame', color: '#FF6B6B', position: { angle: 90, radius: 150 }, state: 'emerging' },
  { id: 5, element: 'fire', number: 2, name: 'Transform', message: 'Alchemize challenges into gold', color: '#FF8E53', position: { angle: 120, radius: 150 }, state: 'emerging' },
  { id: 6, element: 'fire', number: 3, name: 'Illuminate', message: 'Shine your authentic light', color: '#FFA500', position: { angle: 150, radius: 150 }, state: 'emerging' },
  { id: 7, element: 'water', number: 1, name: 'Flow', message: 'Move with natural rhythms', color: '#4A90E2', position: { angle: 180, radius: 150 }, state: 'emerging' },
  { id: 8, element: 'water', number: 2, name: 'Receive', message: 'Open to emotional wisdom', color: '#5DA3FA', position: { angle: 210, radius: 150 }, state: 'emerging' },
  { id: 9, element: 'water', number: 3, name: 'Reflect', message: 'Mirror your inner truth', color: '#7BB7FF', position: { angle: 240, radius: 150 }, state: 'emerging' },
  { id: 10, element: 'earth', number: 1, name: 'Ground', message: 'Root into your foundation', color: '#8B7355', position: { angle: 270, radius: 150 }, state: 'emerging' },
  { id: 11, element: 'earth', number: 2, name: 'Nurture', message: 'Tend your inner garden', color: '#A0826D', position: { angle: 300, radius: 150 }, state: 'emerging' },
  { id: 12, element: 'aether', number: 1, name: 'Connect', message: 'Bridge earth and cosmos', color: '#9B59B6', position: { angle: 330, radius: 150 }, state: 'emerging' }
];

interface HoloflowerCoreProps {
  onPetalSelect?: (petal: Petal) => void;
  energyState?: 'dense' | 'emerging' | 'radiant';
}

export function HoloflowerCore({ onPetalSelect, energyState = 'emerging' }: HoloflowerCoreProps) {
  const [selectedPetal, setSelectedPetal] = useState<Petal | null>(null);
  const [hoveredPetal, setHoveredPetal] = useState<number | null>(null);
  const [petals, setPetals] = useState(PETALS);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update petal states based on energy
  useEffect(() => {
    setPetals(prev => prev.map(p => ({ ...p, state: energyState })));
  }, [energyState]);

  const handlePetalClick = (petal: Petal) => {
    setSelectedPetal(petal);
    setIsPlaying(true);
    onPetalSelect?.(petal);
  };

  const getStateOpacity = (state: string) => {
    switch (state) {
      case 'dense': return 0.4;
      case 'emerging': return 0.7;
      case 'radiant': return 1;
      default: return 0.7;
    }
  };

  const getStateScale = (state: string) => {
    switch (state) {
      case 'dense': return 0.9;
      case 'emerging': return 1;
      case 'radiant': return 1.1;
      default: return 1;
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-indigo-950 to-black overflow-hidden">
      {/* Ambient background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Center sacred geometry */}
      <div ref={containerRef} className="relative">
        {/* Central core */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 opacity-50 blur-xl" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white to-purple-200 opacity-30" />
        </motion.div>

        {/* Petals */}
        {petals.map((petal) => {
          const x = Math.cos((petal.position.angle * Math.PI) / 180) * petal.position.radius;
          const y = Math.sin((petal.position.angle * Math.PI) / 180) * petal.position.radius;
          
          return (
            <motion.div
              key={petal.id}
              className="absolute cursor-pointer"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: getStateScale(petal.state),
                opacity: getStateOpacity(petal.state),
              }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.5, delay: petal.id * 0.05 }}
              onClick={() => handlePetalClick(petal)}
              onHoverStart={() => setHoveredPetal(petal.id)}
              onHoverEnd={() => setHoveredPetal(null)}
            >
              {/* Petal shape */}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${petal.color}88, ${petal.color}44)`,
                  boxShadow: hoveredPetal === petal.id 
                    ? `0 0 30px ${petal.color}88, 0 0 60px ${petal.color}44`
                    : `0 0 15px ${petal.color}44`,
                }}
              >
                {/* Petal number */}
                <span className="text-white font-light text-lg">
                  {petal.number}
                </span>
                
                {/* Element indicator */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xs">
                    {petal.element[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Petal name on hover */}
              <AnimatePresence>
                {hoveredPetal === petal.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  >
                    <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm">
                      {petal.name}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Selected petal message */}
      <AnimatePresence>
        {selectedPetal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-md"
          >
            <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: selectedPetal.color }}
                />
                <div>
                  <h3 className="text-white font-medium text-lg">
                    {selectedPetal.element.charAt(0).toUpperCase() + selectedPetal.element.slice(1)} {selectedPetal.number}: {selectedPetal.name}
                  </h3>
                  <p className="text-white/70 text-sm">{selectedPetal.message}</p>
                </div>
              </div>

              {/* Voice preview */}
              <PetalVoicePreview
                text={selectedPetal.message}
                context={`petal_${selectedPetal.element}_${selectedPetal.number}`}
                element={selectedPetal.element}
                autoPlay={isPlaying}
                onPlaybackComplete={() => setIsPlaying(false)}
              />

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Journal This
                </button>
                <button 
                  onClick={() => setSelectedPetal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy state indicator */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-lg rounded-xl p-3">
        <p className="text-white/60 text-xs mb-2">Current Energy</p>
        <div className="flex gap-2">
          {['dense', 'emerging', 'radiant'].map(state => (
            <button
              key={state}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                energyState === state 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}