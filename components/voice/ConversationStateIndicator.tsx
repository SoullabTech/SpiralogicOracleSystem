'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationStateIndicatorProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'processing';
  engagement: number; // 0-100
  backChanneling?: boolean;
  emotionalTone?: string;
}

export default function ConversationStateIndicator({
  state,
  engagement,
  backChanneling,
  emotionalTone
}: ConversationStateIndicatorProps) {
  // Color based on engagement level
  const getEngagementColor = () => {
    if (engagement > 80) return '#F6AD55'; // Bright amber - highly engaged
    if (engagement > 60) return '#E89923'; // Medium amber
    if (engagement > 40) return '#D97706'; // Darker amber
    return '#92400E'; // Muted amber
  };

  // Pulse speed based on state
  const getPulseSpeed = () => {
    switch (state) {
      case 'listening': return 2;
      case 'thinking': return 1;
      case 'speaking': return 0.8;
      case 'processing': return 0.5;
      default: return 3;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Engagement glow */}
        <motion.div
          className="absolute -inset-2 rounded-full blur-xl"
          style={{ backgroundColor: getEngagementColor() }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: getPulseSpeed(),
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main indicator */}
        <div className="relative w-16 h-16 bg-black/60 backdrop-blur-lg rounded-full border border-amber-500/20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === 'listening' && (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex gap-1"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 bg-amber-400 rounded-full"
                    animate={{
                      height: ['12px', '20px', '12px'],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {state === 'thinking' && (
              <motion.div
                key="thinking"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke={getEngagementColor()}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                </svg>
              </motion.div>
            )}

            {state === 'speaking' && (
              <motion.div
                key="speaking"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getEngagementColor() }} />
              </motion.div>
            )}

            {state === 'processing' && (
              <motion.div
                key="processing"
                className="flex space-x-1"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEngagementColor() }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {state === 'idle' && (
              <motion.div
                key="idle"
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getEngagementColor() }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Back-channeling indicator */}
        <AnimatePresence>
          {backChanneling && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
            />
          )}
        </AnimatePresence>

        {/* Emotional tone label */}
        <AnimatePresence>
          {emotionalTone && emotionalTone !== 'neutral' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-xs text-amber-200/60 capitalize">
                {emotionalTone}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Engagement meter */}
      <div className="mt-2 w-16 h-1 bg-black/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getEngagementColor() }}
          animate={{ width: `${engagement}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}