"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrocopyManager, QUADRANT_MICROCOPY } from './SyncedPetalMicrocopy';

interface MaiaRitualGuideProps {
  isFirstTime: boolean;
  sessionCount: number;
  onComplete: () => void;
  onSkip?: () => void;
}

interface RitualStep {
  id: string;
  maiaText: string;
  userAction: string;
  duration?: number; // milliseconds
  skipable?: boolean;
}

export const MaiaRitualGuide: React.FC<MaiaRitualGuideProps> = ({
  isFirstTime,
  sessionCount,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMaia, setShowMaia] = useState(true);
  
  // Progressive ritual complexity based on user journey
  const getRitualSteps = (): RitualStep[] => {
    if (isFirstTime) {
      // First encounter - gentle introduction
      return [
        {
          id: 'welcome',
          maiaText: 'Welcome to your Sacred Space',
          userAction: 'Take a breath and center yourself',
          duration: 3000
        },
        {
          id: 'flower_intro', 
          maiaText: 'Your flower responds to touch',
          userAction: 'Notice the four petals around the center',
          duration: 4000
        },
        {
          id: 'first_touch',
          maiaText: 'Each petal holds a different quality of your being',
          userAction: 'Touch one petal to feel its energy',
          skipable: true
        },
        {
          id: 'intuitive_guidance',
          maiaText: 'Trust what you feel. There are no wrong movements.',
          userAction: 'Drag petals as they feel today - in or out, heavy or light',
          skipable: true
        },
        {
          id: 'completion_hint',
          maiaText: 'When ready, the center will glow. Touch it to bloom your soulprint.',
          userAction: 'Create your first sacred pattern',
          skipable: true
        }
      ];
    } else if (sessionCount <= 3) {
      // Early sessions - building familiarity
      return [
        {
          id: 'return',
          maiaText: 'Welcome back. Your flower remembers.',
          userAction: 'Notice how it feels to return',
          duration: 2000
        },
        {
          id: 'pattern_recognition',
          maiaText: 'How do the elements feel different today?',
          userAction: 'Check in with each quadrant',
          skipable: true
        }
      ];
    } else if (sessionCount <= 10) {
      // Deepening - subtle guidance
      return [
        {
          id: 'deeper_return',
          maiaText: 'Your pattern evolves with you',
          userAction: 'What wants to emerge today?',
          duration: 1500,
          skipable: true
        }
      ];
    } else {
      // Advanced - minimal guidance, trust user's flow
      return [
        {
          id: 'trust',
          maiaText: 'You know this sacred space',
          userAction: '',
          duration: 1000,
          skipable: true
        }
      ];
    }
  };

  const [ritualSteps] = useState(getRitualSteps());

  useEffect(() => {
    if (!ritualSteps[currentStep]) {
      onComplete();
      return;
    }

    const step = ritualSteps[currentStep];
    if (step.duration) {
      const timer = setTimeout(() => {
        if (currentStep < ritualSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          onComplete();
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, ritualSteps, onComplete]);

  const handleNext = () => {
    if (currentStep < ritualSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  if (!showMaia || !ritualSteps[currentStep]) return null;

  const currentRitualStep = ritualSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-sacred-brown/20 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.618, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.618, opacity: 0 }}
          transition={{ duration: 0.618 }}
          className="bg-white/95 backdrop-blur rounded-sacred-lg p-sacred-lg max-w-md w-full shadow-sacred-glow"
        >
          {/* Maia Avatar */}
          <div className="flex items-center mb-sacred-md">
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-divine to-gold-amber flex items-center justify-center mr-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <span className="text-white text-lg">🌸</span>
            </motion.div>
            <div>
              <h3 className="type-sacred-heading text-sm text-sacred-brown">
                Maia
              </h3>
              <p className="type-micro-poetry text-xs text-neutral-mystic">
                Your sacred guide
              </p>
            </div>
          </div>

          {/* Ritual Step Content */}
          <div className="space-y-sacred-sm">
            <motion.p 
              key={`maia-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="type-body-primary text-neutral-shadow"
            >
              {currentRitualStep.maiaText}
            </motion.p>

            {currentRitualStep.userAction && (
              <motion.p
                key={`action-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="type-micro-poetry text-neutral-mystic italic"
              >
                {currentRitualStep.userAction}
              </motion.p>
            )}
          </div>

          {/* Elemental Wisdom Preview (for first-time users) */}
          {isFirstTime && currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-sacred-md grid grid-cols-2 gap-2 text-xs"
            >
              {Object.entries(QUADRANT_MICROCOPY).map(([element, data]) => (
                <div 
                  key={element}
                  className="flex items-center space-x-2 p-2 rounded bg-neutral-silver/10"
                >
                  <span className="text-sm">
                    {element === 'fire' && '🔥'}
                    {element === 'water' && '💧'}
                    {element === 'earth' && '🌍'}
                    {element === 'air' && '💨'}
                  </span>
                  <span className="text-neutral-mystic capitalize">
                    {data.archetype.replace('The ', '')}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-sacred-md pt-sacred-sm border-t border-neutral-silver/30">
            {/* Skip Option */}
            {(currentRitualStep.skipable || !isFirstTime) && onSkip && (
              <button
                onClick={handleSkip}
                className="text-xs text-neutral-mystic hover:text-neutral-shadow transition-colors"
              >
                Enter quietly
              </button>
            )}

            {/* Progress Dots */}
            <div className="flex space-x-1">
              {ritualSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-gold-divine' 
                      : index < currentStep 
                        ? 'bg-gold-amber' 
                        : 'bg-neutral-silver/40'
                  }`}
                />
              ))}
            </div>

            {/* Next/Continue */}
            <button
              onClick={handleNext}
              className="text-xs text-gold-divine hover:text-gold-amber transition-colors font-medium"
            >
              {currentStep < ritualSteps.length - 1 ? 'Continue' : 'Begin'}
            </button>
          </div>
        </motion.div>

        {/* Ambient Sacred Geometry */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <svg className="w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="200"
              fill="none"
              stroke="rgba(255, 215, 0, 0.2)"
              strokeWidth="1"
              className="animate-sacred-pulse"
            />
            <circle
              cx="50%"
              cy="50%"
              r="300"
              fill="none"
              stroke="rgba(255, 215, 0, 0.1)"
              strokeWidth="1"
              className="animate-sacred-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Higher-order component for ritual-wrapped experiences
export const withMaiaRitual = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P & { 
    userId: string;
    sessionCount?: number;
    skipRitual?: boolean;
  }) => {
    const [showRitual, setShowRitual] = useState(!props.skipRitual);
    const [ritualCompleted, setRitualCompleted] = useState(false);

    const isFirstTime = (props.sessionCount || 0) === 0;

    if (showRitual && !ritualCompleted) {
      return (
        <MaiaRitualGuide
          isFirstTime={isFirstTime}
          sessionCount={props.sessionCount || 0}
          onComplete={() => {
            setRitualCompleted(true);
            setShowRitual(false);
          }}
          onSkip={() => {
            setRitualCompleted(true);
            setShowRitual(false);
          }}
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default MaiaRitualGuide;