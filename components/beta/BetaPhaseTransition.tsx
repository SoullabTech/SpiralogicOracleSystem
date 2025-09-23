"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, BookOpen, MessageCircle, Play,
  SkipForward, Sunset, CheckCircle, Sparkles
} from 'lucide-react';

interface BetaPhaseTransitionProps {
  userId: string;
  currentPhase: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  nextPhase?: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  currentDay: number;
  element: string;
  theme: string;
  transitionPrompt?: string;
  canSkip: boolean;
  onTransition: (toPhase: string) => void;
  onSkip?: () => void;
  isVisible: boolean;
}

const phaseIcons = {
  entry: Sparkles,
  journal: BookOpen,
  chat: MessageCircle,
  integration: Play,
  evening: Sunset
};

const phaseColors = {
  entry: 'from-amber-400 to-orange-500',
  journal: 'from-blue-400 to-indigo-500',
  chat: 'from-purple-400 to-pink-500',
  integration: 'from-green-400 to-emerald-500',
  evening: 'from-indigo-400 to-purple-600'
};

const phaseNames = {
  entry: 'Awakening',
  journal: 'Reflection',
  chat: 'Dialogue',
  integration: 'Embodiment',
  evening: 'Completion'
};

export default function BetaPhaseTransition({
  userId,
  currentPhase,
  nextPhase,
  currentDay,
  element,
  theme,
  transitionPrompt,
  canSkip,
  onTransition,
  onSkip,
  isVisible
}: BetaPhaseTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!isVisible || !nextPhase) return null;

  const CurrentIcon = phaseIcons[currentPhase];
  const NextIcon = phaseIcons[nextPhase];

  const handleTransition = async () => {
    setIsTransitioning(true);

    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 500));

    onTransition(nextPhase);
    setIsTransitioning(false);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border-amber-500/30 shadow-2xl max-w-sm">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-amber-400 font-medium">
                Day {currentDay} • {theme}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                {element} Energy
              </div>
            </div>

            {/* Transition Prompt */}
            {transitionPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600/30"
              >
                <p className="text-sm text-slate-200 leading-relaxed">
                  {transitionPrompt}
                </p>
              </motion.div>
            )}

            {/* Phase Transition Visual */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                {/* Current Phase */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-600/50 flex items-center justify-center mb-2">
                    <CurrentIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <span className="text-xs text-slate-400">{phaseNames[currentPhase]}</span>
                </div>

                {/* Transition Arrow */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-6 h-6 text-amber-400" />
                </motion.div>

                {/* Next Phase */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${phaseColors[nextPhase]} flex items-center justify-center mb-2 shadow-lg`}>
                    <NextIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium">{phaseNames[nextPhase]}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleTransition}
                disabled={isTransitioning}
                className={`w-full bg-gradient-to-r ${phaseColors[nextPhase]} hover:shadow-lg transition-all duration-200 text-white font-medium`}
              >
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  whileTap={{ scale: 0.98 }}
                >
                  {isTransitioning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span>Transitioning...</span>
                    </>
                  ) : (
                    <>
                      <NextIcon className="w-4 h-4" />
                      <span>Enter {phaseNames[nextPhase]}</span>
                    </>
                  )}
                </motion.div>
              </Button>

              {/* Skip Option */}
              {canSkip && (
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip this phase
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Daily Progress</span>
                <span>{['entry', 'journal', 'chat', 'integration', 'evening'].indexOf(nextPhase) + 1}/5</span>
              </div>
              <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((['entry', 'journal', 'chat', 'integration', 'evening'].indexOf(nextPhase) + 1) / 5) * 100}%`
                  }}
                  transition={{ duration: 0.5 }}
                  className={`bg-gradient-to-r ${phaseColors[nextPhase]} h-1.5 rounded-full`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}