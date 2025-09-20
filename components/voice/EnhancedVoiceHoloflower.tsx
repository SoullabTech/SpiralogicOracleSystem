'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceHoloflowerProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  size?: number;
  userTranscript?: string;
  maiaResponse?: string;
  isProcessing?: boolean;
  onClick?: () => void;
}

export default function EnhancedVoiceHoloflower({
  isListening = false,
  isSpeaking = false,
  audioLevel = 0,
  size = 400,
  userTranscript = '',
  maiaResponse = '',
  isProcessing = false,
  onClick
}: VoiceHoloflowerProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'maia' | null>(null);

  // Update pulse intensity based on audio level
  useEffect(() => {
    if (isListening || isSpeaking) {
      setPulseIntensity(audioLevel * 100);
    } else {
      setPulseIntensity(0);
    }
  }, [audioLevel, isListening, isSpeaking]);

  // Update display text based on current state
  useEffect(() => {
    if (userTranscript && isListening) {
      setDisplayText(userTranscript);
      setCurrentSpeaker('user');
    } else if (maiaResponse) {
      setDisplayText(maiaResponse);
      setCurrentSpeaker('maia');
    } else if (isProcessing) {
      setDisplayText('Maya is reflecting...');
      setCurrentSpeaker(null);
    }
  }, [userTranscript, maiaResponse, isListening, isProcessing]);

  // Different colors for user vs Maya
  const getPulseColor = () => {
    if (isListening) return '#6B9BD1'; // Blue for user
    if (isSpeaking) return '#D4B896'; // Gold for Maya
    return '#ffffff';
  };

  const getFieldColor = () => {
    if (isListening) return 'rgba(107, 155, 209, 0.3)'; // Blue field for user
    if (isSpeaking) return 'rgba(212, 184, 150, 0.3)'; // Gold field for Maya
    return 'rgba(255, 255, 255, 0.1)';
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Holoflower Container */}
      <div
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        {/* Background field with color indication */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: `radial-gradient(circle at center, ${getFieldColor()} 0%, transparent 70%)`,
            scale: isListening || isSpeaking ? [1, 1.1, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            },
            background: {
              duration: 0.5
            }
          }}
        />

        {/* Outer pulsing ring - distinct animations for each speaker */}
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* First pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: getPulseColor() }}
                animate={{
                  scale: isListening ? [1, 1.3, 1] : [1, 1.2, 1],
                  opacity: [0.8, 0.2, 0.8],
                }}
                transition={{
                  duration: isListening ? 1.5 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Second pulse ring with offset timing */}
              <motion.div
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: getPulseColor() }}
                animate={{
                  scale: isListening ? [1.1, 1.4, 1.1] : [1.05, 1.25, 1.05],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{
                  duration: isListening ? 1.5 : 2,
                  delay: 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Audio level indicator ring */}
              {audioLevel > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `${Math.max(2, audioLevel * 10)}px solid ${getPulseColor()}`,
                    opacity: audioLevel * 0.5,
                  }}
                  animate={{
                    scale: 1 + audioLevel * 0.3,
                  }}
                  transition={{
                    duration: 0.1
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing animation */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-3/4 h-3/4 rounded-full border-2 border-dotted border-gold-divine"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        )}

        {/* Center Holoflower */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              filter: isListening
                ? 'brightness(1.3) hue-rotate(-15deg)' // Blueish tint for user
                : isSpeaking
                  ? 'brightness(1.5) hue-rotate(15deg)' // Golden tint for Maya
                  : 'brightness(1)',
            }}
            transition={{ duration: 0.5 }}
            className="relative"
            style={{ width: size * 0.3, height: size * 0.3 }}
          >
            <img
              src="/holoflower.png"
              alt="Holoflower"
              className="w-full h-full object-contain"
            />

            {/* Inner glow based on state */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${getPulseColor()} 0%, transparent 50%)`,
                mixBlendMode: 'screen',
              }}
              animate={{
                opacity: isListening || isSpeaking ? [0.3, 0.6, 0.3] : 0,
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>
        </div>

        {/* State indicator text */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <AnimatePresence mode="wait">
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-elemental-water text-sm font-medium"
              >
                Listening...
              </motion.div>
            )}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gold-divine text-sm font-medium"
              >
                Maya Speaking...
              </motion.div>
            )}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gold-amber text-sm font-medium"
              >
                Processing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Text Display Area - Always visible in voice mode */}
      <motion.div
        className="w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-sacred-navy/80 backdrop-blur-md rounded-lg p-4 border border-gold-divine/20 shadow-lg min-h-[100px]">
          {/* Speaker indicator */}
          {currentSpeaker && (
            <div className={`text-xs font-medium mb-2 ${
              currentSpeaker === 'user' ? 'text-elemental-water' : 'text-gold-divine'
            }`}>
              {currentSpeaker === 'user' ? 'You' : 'Maya'}
            </div>
          )}

          {/* Main text display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={displayText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-neutral-silver text-base leading-relaxed"
            >
              {displayText || (
                <span className="text-neutral-mystic italic">
                  Ready to listen... Click the holoflower to start
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Audio level visualization bars */}
          {(isListening || isSpeaking) && audioLevel > 0 && (
            <div className="mt-3 flex items-center gap-1 justify-center">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t"
                  style={{
                    background: i < audioLevel * 10
                      ? `linear-gradient(to top, ${getPulseColor()}, transparent)`
                      : 'rgba(255,255,255,0.1)',
                    height: '12px',
                  }}
                  animate={{
                    scaleY: i < audioLevel * 10 ? [1, 1.5, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Connection status */}
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-neutral-mystic">
          <div className={`w-2 h-2 rounded-full ${
            isListening || isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-neutral-steel'
          }`} />
          <span>
            {isListening ? 'Microphone Active' :
             isSpeaking ? 'Audio Active' :
             'Click holoflower to activate'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}