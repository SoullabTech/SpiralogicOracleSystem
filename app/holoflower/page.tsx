'use client';

import React, { useState, useEffect } from 'react';
import { HoloflowerCore } from '@/components/holoflower/HoloflowerCore';
import { FloatingCheckIn } from '@/components/holoflower/FloatingCheckIn';
import { BottomNavigation } from '@/components/holoflower/BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalVoicePreview } from '@/components/voice/PetalVoicePreview';

// Wild Petal draw functionality
function WildPetalDraw({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [drawnPetal, setDrawnPetal] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const wildPetals = [
    { element: 'air', number: 1, name: 'Inspire', message: 'Today, let fresh ideas flow through you like wind through leaves.' },
    { element: 'fire', number: 2, name: 'Transform', message: 'The fire within you is ready to alchemize old patterns into gold.' },
    { element: 'water', number: 3, name: 'Reflect', message: 'Look into the still waters of your soul and see your true reflection.' },
    { element: 'earth', number: 1, name: 'Ground', message: 'Plant your feet firmly in this moment, rooted in your truth.' },
    { element: 'aether', number: 1, name: 'Connect', message: 'You are the bridge between earth and cosmos, embodying both.' },
  ];

  const drawPetal = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const randomPetal = wildPetals[Math.floor(Math.random() * wildPetals.length)];
      setDrawnPetal(randomPetal);
      setIsDrawing(false);
    }, 2000);
  };

  useEffect(() => {
    if (isOpen && !drawnPetal) {
      drawPetal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border border-[#D4B896]/20"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-light text-white mb-6 text-center">Wild Petal Oracle</h2>

          {isDrawing ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block text-6xl mb-4"
              >
                🌸
              </motion.div>
              <p className="text-white/70">Drawing your petal...</p>
            </div>
          ) : drawnPetal ? (
            <div>
              <div className="text-center mb-6">
                <div className="inline-block text-6xl mb-4">
                  {drawnPetal.element === 'air' && '🌬️'}
                  {drawnPetal.element === 'fire' && '🔥'}
                  {drawnPetal.element === 'water' && '💧'}
                  {drawnPetal.element === 'earth' && '🌍'}
                  {drawnPetal.element === 'aether' && '✨'}
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  {drawnPetal.element.charAt(0).toUpperCase() + drawnPetal.element.slice(1)} {drawnPetal.number}: {drawnPetal.name}
                </h3>
                <p className="text-white/80 leading-relaxed">{drawnPetal.message}</p>
              </div>

              <PetalVoicePreview
                text={drawnPetal.message}
                context={`wild_petal_${drawnPetal.element}`}
                element={drawnPetal.element}
                autoPlay={true}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setDrawnPetal(null);
                    drawPetal();
                  }}
                  className="flex-1 px-4 py-2 bg-[#D4B896] hover:bg-[#B69A78] text-white rounded-lg transition-colors"
                >
                  Draw Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HoloflowerExperience() {
  const [energyState, setEnergyState] = useState<'dense' | 'emerging' | 'radiant'>('emerging');
  const [showWildPetal, setShowWildPetal] = useState(false);
  const [selectedPetal, setSelectedPetal] = useState<any>(null);

  // Listen for wild petal event from navigation
  useEffect(() => {
    const handleWildPetal = () => setShowWildPetal(true);
    window.addEventListener('drawWildPetal', handleWildPetal);
    return () => window.removeEventListener('drawWildPetal', handleWildPetal);
  }, []);

  // Welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Could trigger a welcome voice message here
      console.log('Welcome to your sacred space');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePetalSelect = (petal: any) => {
    setSelectedPetal(petal);
    console.log('Petal selected:', petal);
    // Here you could save to database, open journal, etc.
  };

  const handleEnergyChange = (state: 'dense' | 'emerging' | 'radiant') => {
    setEnergyState(state);
    // Could trigger different voice responses based on energy
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Main Holoflower */}
      <HoloflowerCore
        energyState={energyState}
        onPetalSelect={handlePetalSelect}
      />

      {/* Energy State Controls (overlay on Holoflower) */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-3">
          <p className="text-white/60 text-xs mb-2">Your Energy</p>
          <div className="flex gap-2">
            {(['dense', 'emerging', 'radiant'] as const).map(state => (
              <button
                key={state}
                onClick={() => handleEnergyChange(state)}
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

      {/* Floating Check-In Button */}
      <FloatingCheckIn />

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Wild Petal Draw Modal */}
      <WildPetalDraw
        isOpen={showWildPetal}
        onClose={() => setShowWildPetal(false)}
      />

      {/* Welcome overlay (shows briefly on load) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-white text-3xl font-light text-center">
              Welcome to Your Sacred Space
            </h1>
            <p className="text-white/70 text-center mt-2">
              Touch a petal to begin
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}