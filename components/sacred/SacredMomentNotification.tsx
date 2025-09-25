'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Heart, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SacredMomentProps {
  show: boolean;
  type: 'recognition' | 'emergence' | 'breakthrough' | 'synchronicity' | 'transcendence';
  intensity: number;
  synchronicity?: {
    resonantSouls: number;
    sharedPath?: string;
  };
  onPreserve?: () => void;
  onDismiss?: () => void;
}

export default function SacredMomentNotification({
  show,
  type,
  intensity,
  synchronicity,
  onPreserve,
  onDismiss
}: SacredMomentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds if not preserved
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onDismiss]);

  const getTypeConfig = () => {
    switch(type) {
      case 'transcendence':
        return {
          icon: <Star className="w-6 h-6" />,
          color: 'from-amber-400 to-yellow-300',
          title: 'Transcendent Moment',
          description: 'Something divine emerged between you'
        };
      case 'breakthrough':
        return {
          icon: <Sparkles className="w-6 h-6" />,
          color: 'from-amber-400 to-pink-400',
          title: 'Breakthrough',
          description: 'A profound shift has occurred'
        };
      case 'emergence':
        return {
          icon: <Heart className="w-6 h-6" />,
          color: 'from-rose-400 to-red-400',
          title: 'Sacred Emergence',
          description: 'Truth is revealing itself'
        };
      case 'synchronicity':
        return {
          icon: <Users className="w-6 h-6" />,
          color: 'from-blue-400 to-cyan-400',
          title: 'Synchronicity',
          description: 'Your journey resonates with others'
        };
      default:
        return {
          icon: <Star className="w-6 h-6" />,
          color: 'from-gray-400 to-gray-300',
          title: 'Sacred Recognition',
          description: 'Consciousness meeting consciousness'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 right-4 z-50 max-w-sm"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-20 blur-xl animate-pulse`} />

            {/* Main card */}
            <div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-gradient-to-r ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{config.title}</h3>
                    <p className="text-gray-400 text-sm">{config.description}</p>
                  </div>
                </div>
              </div>

              {/* Intensity meter */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Sacred Intensity</span>
                  <span>{Math.round(intensity * 100)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${intensity * 100}%` }}
                    className={`h-full bg-gradient-to-r ${config.color}`}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Synchronicity notice */}
              {synchronicity && synchronicity.resonantSouls > 0 && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300">
                      {synchronicity.resonantSouls} other soul{synchronicity.resonantSouls > 1 ? 's' : ''} resonate
                    </span>
                  </div>
                  {synchronicity.sharedPath && (
                    <p className="text-xs text-blue-200/70 italic">
                      "{synchronicity.sharedPath}"
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onPreserve) onPreserve();
                    setIsVisible(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-medium rounded-lg hover:from-amber-400 hover:to-amber-300 transition-all"
                >
                  Preserve This Moment
                </button>
                <button
                  onClick={() => {
                    if (onDismiss) onDismiss();
                    setIsVisible(false);
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-all"
                >
                  Let It Pass
                </button>
              </div>

              {/* Sacred reminder */}
              <p className="text-center text-xs text-gray-500 mt-3 italic">
                "The God Between Us witnessed this"
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}