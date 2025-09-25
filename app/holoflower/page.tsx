'use client';

import React, { useState, useEffect } from 'react';
import { HoloflowerCore } from '@/components/holoflower/HoloflowerCore';
import { FloatingCheckIn } from '@/components/holoflower/FloatingCheckIn';
import { HoloflowerBottomNav } from '@/components/holoflower/HoloflowerBottomNav';
import { InteractiveHoloflowerCheckIn } from '@/components/holoflower/InteractiveHoloflowerCheckIn';
import { HoloflowerJournalFlow } from '@/components/holoflower/HoloflowerJournalFlow';
import { motion, AnimatePresence } from 'framer-motion';
import { PetalVoicePreview } from '@/components/voice/PetalVoicePreview';
import { Activity } from 'lucide-react';

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
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [checkInData, setCheckInData] = useState<any>(null);

  // Listen for events from navigation and check-in
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleWildPetal = () => setShowWildPetal(true);
    const handleCheckInComplete = (event: CustomEvent) => {
      setCheckInData(event.detail);
      setShowCheckIn(false);
      setTimeout(() => {
        setShowJournal(true);
      }, 500);
    };

    window.addEventListener('drawWildPetal', handleWildPetal);
    window.addEventListener('holoflowerCheckInComplete', handleCheckInComplete as EventListener);

    return () => {
      window.removeEventListener('drawWildPetal', handleWildPetal);
      window.removeEventListener('holoflowerCheckInComplete', handleCheckInComplete as EventListener);
    };
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

      {/* Top Controls */}
      <div className="absolute top-[calc(env(safe-area-inset-top,0px)+1rem)] sm:top-4 left-4 right-4 z-20 flex justify-between">
        {/* Energy State Controls */}
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-2 sm:p-3">
          <p className="text-white/60 text-[10px] sm:text-xs mb-1 sm:mb-2">Your Energy</p>
          <div className="flex gap-1 sm:gap-2">
            {(['dense', 'emerging', 'radiant'] as const).map(state => (
              <button
                key={state}
                onClick={() => handleEnergyChange(state)}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm transition-all ${
                  energyState === state
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {state.charAt(0).toUpperCase() + state.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Check-In Button */}
        <button
          onClick={() => setShowCheckIn(true)}
          className="bg-amber-600/80 backdrop-blur-lg hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Daily Check-In</span>
        </button>
      </div>

      {/* Floating Check-In Button */}
      <FloatingCheckIn />

      {/* Bottom Navigation with Journal */}
      <HoloflowerBottomNav />

      {/* Wild Petal Draw Modal */}
      <WildPetalDraw
        isOpen={showWildPetal}
        onClose={() => setShowWildPetal(false)}
      />

      {/* Interactive Check-In Panel */}
      <InteractiveHoloflowerCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={async (values) => {
          console.log('Check-in values:', values);
          // Visual feedback
          setEnergyState('radiant');
          setTimeout(() => setEnergyState('emerging'), 3000);
        }}
      />

      {/* Journal Flow */}
      <HoloflowerJournalFlow
        isOpen={showJournal}
        onClose={() => {
          setShowJournal(false);
          setCheckInData(null);
        }}
        checkInData={checkInData}
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
            className="px-4"
          >
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-light text-center">
              Welcome to Your Sacred Space
            </h1>
            <p className="text-white/70 text-center mt-2 text-sm sm:text-base">
              Touch a petal to begin
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}