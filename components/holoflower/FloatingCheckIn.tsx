'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Feather, Heart, Moon, Sun } from 'lucide-react';
import { useSacredCheckIn } from '@/lib/hooks/useOracleData';
import type { Mood } from '@/lib/types/oracle';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: string) => void;
  onSymbolSelect: (symbol: string) => void;
}

function CheckInModal({ isOpen, onClose, onMoodSelect, onSymbolSelect }: CheckInModalProps) {
  const [step, setStep] = useState<'mood' | 'symbol' | 'complete'>('mood');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const moods = [
    { id: 'dense', label: 'Dense', color: '#4A5568', icon: '🌫️' },
    { id: 'heavy', label: 'Heavy', color: '#718096', icon: '⛈️' },
    { id: 'neutral', label: 'Neutral', color: '#A0AEC0', icon: '☁️' },
    { id: 'emerging', label: 'Emerging', color: '#9F7AEA', icon: '🌤️' },
    { id: 'light', label: 'Light', color: '#B794F4', icon: '☀️' },
    { id: 'radiant', label: 'Radiant', color: '#D6BCFA', icon: '✨' },
  ];

  const symbols = [
    { id: 'seed', label: 'Seed', icon: '🌱' },
    { id: 'flower', label: 'Flower', icon: '🌸' },
    { id: 'butterfly', label: 'Butterfly', icon: '🦋' },
    { id: 'moon', label: 'Moon', icon: '🌙' },
    { id: 'star', label: 'Star', icon: '⭐' },
    { id: 'wave', label: 'Wave', icon: '🌊' },
    { id: 'mountain', label: 'Mountain', icon: '⛰️' },
    { id: 'fire', label: 'Fire', icon: '🔥' },
    { id: 'crystal', label: 'Crystal', icon: '💎' },
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
    setStep('symbol');
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    onSymbolSelect(symbol);
    setStep('complete');
    setTimeout(() => {
      onClose();
      setStep('mood');
      setSelectedMood('');
      setSelectedSymbol('');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-purple-950 to-indigo-950 rounded-3xl p-6 max-w-md w-full border border-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-white">Check-In</h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content based on step */}
            {step === 'mood' && (
              <div>
                <p className="text-white/70 mb-4">How is your energy feeling?</p>
                <div className="grid grid-cols-3 gap-3">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoodSelect(mood.id)}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <div className="text-3xl mb-2">{mood.icon}</div>
                      <p className="text-white/80 text-sm">{mood.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 'symbol' && (
              <div>
                <p className="text-white/70 mb-4">What symbol calls to you today?</p>
                <div className="grid grid-cols-3 gap-3">
                  {symbols.map((symbol) => (
                    <motion.button
                      key={symbol.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSymbolSelect(symbol.id)}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <div className="text-3xl mb-2">{symbol.icon}</div>
                      <p className="text-white/80 text-sm">{symbol.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="inline-block text-6xl mb-4"
                >
                  ✨
                </motion.div>
                <p className="text-white text-lg mb-2">Check-in Complete</p>
                <p className="text-white/60">
                  Energy: {moods.find(m => m.id === selectedMood)?.label}
                </p>
                <p className="text-white/60">
                  Symbol: {symbols.find(s => s.id === selectedSymbol)?.label}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloatingCheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const { saveCheckIn } = useSacredCheckIn();
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);

  const handleMoodSelect = (mood: string) => {
    console.log('Mood selected:', mood);
    setCurrentMood(mood as Mood);
  };

  const handleSymbolSelect = async (symbol: string) => {
    console.log('Symbol selected:', symbol);
    if (currentMood) {
      await saveCheckIn(currentMood, symbol);
      setCurrentMood(null);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setPulseAnimation(false);
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
      >
        <Sparkles className="w-6 h-6 text-white" />
        
        {/* Pulse animation */}
        {pulseAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-600"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 whitespace-nowrap pointer-events-none"
        >
          <div className="bg-black/90 text-white text-sm px-3 py-1.5 rounded-lg">
            Sacred Check-In
          </div>
        </motion.div>
      </motion.button>

      {/* Modal */}
      <CheckInModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMoodSelect={handleMoodSelect}
        onSymbolSelect={handleSymbolSelect}
      />
    </>
  );
}