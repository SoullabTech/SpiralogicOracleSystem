'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Sparkles, BookOpen, Upload } from 'lucide-react';
import VoiceRecorder from '../VoiceRecorder';

interface SacredChatInputProps {
  onSendMessage: (message: string, isJournal?: boolean) => void;
  onVoiceMessage?: (transcript: string, audioUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  userId?: string;
  trustLevel?: number;
  isFirstSession?: boolean;
  tone?: number; // 0-1 scale from onboarding
  style?: 'prose' | 'poetic' | 'auto'; // from onboarding
}

// Sacred animation variants
const containerVariants = {
  idle: {
    boxShadow: '0 0 0 1px rgba(255, 215, 0, 0.2)',
    transition: { duration: 0.3 }
  },
  focused: {
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.1)',
    transition: { duration: 0.3 }
  },
  thinking: {
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.2)',
    transition: { duration: 0.3 }
  }
};

const buttonVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.05, rotate: 5 },
  tap: { scale: 0.95, rotate: -5 }
};

const rippleVariants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export default function SacredChatInput({
  onSendMessage,
  onVoiceMessage,
  disabled = false,
  placeholder = "Offer your reflection...",
  maxLength = 4000,
  userId = "anonymous",
  trustLevel = 0.5,
  isFirstSession = false,
  tone = 0.5,
  style = 'prose'
}: SacredChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isJournalMode, setIsJournalMode] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea with golden ratio constraints
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = Math.min(textarea.scrollHeight, 120); // Golden ratio inspired max
      textarea.style.height = `${maxHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const triggerRipple = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
  };

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return;
    
    triggerRipple();
    onSendMessage(message.trim(), isJournalMode);
    setMessage('');
    setIsJournalMode(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice recording completion
  const handleVoiceTranscription = (data: { transcript: string; audioUrl?: string }) => {
    if (data.transcript) {
      // For voice-first flow, send directly to voice handler
      if (onVoiceMessage) {
        onVoiceMessage(data.transcript, data.audioUrl);
      } else {
        // Fallback: treat as text message
        onSendMessage(data.transcript, isJournalMode);
      }
    }
    setIsRecording(false);
    setIsJournalMode(false); // Reset journal mode after voice
  };

  // Handle starting voice recording
  const handleStartVoice = () => {
    setIsRecording(true);
    triggerRipple();
  };

  // Handle stopping voice recording
  const handleStopVoice = () => {
    setIsRecording(false);
  };

  // Get sacred placeholder based on recording state and user preferences
  const getSacredPlaceholder = () => {
    if (isRecording) {
      return "Listening to your sacred offering...";
    }
    
    if (disabled) {
      return "Maia is contemplating...";
    }

    // Base message based on preferences
    let baseMessage = "";
    if (isFirstSession) {
      baseMessage = tone > 0.7 
        ? "What truth wants to emerge through you?"
        : "What&apos;s alive in you right now?";
    } else if (style === 'poetic') {
      baseMessage = "Let your soul speak...";
    } else if (style === 'prose') {
      baseMessage = "Share what&apos;s on your mind...";
    } else {
      baseMessage = "What would you like to explore?";
    }
    
    // Add mode hint for dual input
    return `${baseMessage} (type or speak)`;
  };

  const canSend = message.trim().length > 0 && !disabled;

  // Determine container animation state for dual modes
  const getContainerState = () => {
    if (disabled) return 'thinking';
    if (isRecording) return 'thinking'; // Voice recording gets sacred thinking state
    if (isFocused || message.length > 0) return 'focused';
    return 'idle';
  };

  return (
    <div className="p-6 border-t border-amber-400/20 bg-neutral-900/80 backdrop-blur-xl">
      {/* Sacred Input Container */}
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        animate={getContainerState()}
        className="relative max-w-4xl mx-auto"
      >
        {/* Ripple effect overlay */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial="initial"
              animate="animate"
              exit="initial"
              variants={rippleVariants}
            >
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 opacity-30" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-4">
          {/* Mode Toggle Buttons */}
          <div className="flex flex-col gap-2 self-end pb-2">
            {/* Journal Mode Toggle */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setIsJournalMode(!isJournalMode)}
              disabled={disabled}
              className={`p-3 rounded-xl border transition-all ${
                isJournalMode
                  ? 'bg-amber-400/20 border-amber-400/60 text-amber-400'
                  : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-400 hover:border-amber-400/30 hover:text-amber-400'
              }`}
              title={isJournalMode ? "Switch to conversation" : "Switch to journal mode"}
            >
              <BookOpen className="w-5 h-5" />
            </motion.button>

            {/* File Upload */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              disabled={disabled}
              className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 text-neutral-400 hover:border-amber-400/30 hover:text-amber-400 transition-all"
              title="Upload files"
            >
              <Upload className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Dual-Mode Input Area */}
          <div className="flex-1 relative">
            {/* Mode Indicator */}
            <AnimatePresence>
              {isJournalMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-8 left-3 flex items-center gap-2 text-xs text-amber-400"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sacred Journal Mode</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recording State Indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-8 right-3 flex items-center gap-2 text-xs text-amber-400"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-red-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span>Recording...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sacred Textarea - Always present, disabled during voice recording */}
            <motion.textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={getSacredPlaceholder()}
              disabled={disabled || isRecording}
              maxLength={maxLength}
              animate={{
                opacity: isRecording ? 0.6 : 1,
                scale: isRecording ? 0.98 : 1,
                filter: isRecording ? 'blur(1px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.3 }}
              className="w-full min-h-[56px] max-h-[120px] p-4 pr-16 bg-neutral-800/60 border border-neutral-700/50 rounded-xl resize-none focus:outline-none focus:border-amber-400/60 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-neutral-400 font-light leading-relaxed transition-all backdrop-blur-sm"
              style={{ height: 'auto' }}
            />

            {/* Voice Recording Overlay */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-neutral-800/90 backdrop-blur-sm rounded-xl border border-amber-400/40 flex flex-col items-center justify-center"
                >
                  {/* Voice Recording UI */}
                  <VoiceRecorder
                    userId={userId}
                    onTranscribed={handleVoiceTranscription}
                    autoSend={true}
                    silenceTimeout={3000}
                    minSpeechLength={500}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Character Counter */}
            {message.length > maxLength * 0.8 && !isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-3 right-16 text-xs text-amber-400/60"
              >
                {message.length}/{maxLength}
              </motion.div>
            )}
          </div>

          {/* Dual-Mode Action Button */}
          <div className="self-end pb-2">
            {message.trim().length === 0 ? (
              // Mic button when no text - toggles recording
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover={!isRecording ? "hover" : "idle"}
                whileTap={!isRecording ? "tap" : "idle"}
                onClick={isRecording ? handleStopVoice : handleStartVoice}
                disabled={disabled}
                className={`w-12 h-12 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-900 hover:from-amber-300 hover:to-amber-400'
                }`}
                title={isRecording ? "Stop recording" : "Sacred voice offering"}
              >
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Square className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mic className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              // Send button when text exists
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={handleSendMessage}
                disabled={!canSend}
                className={`w-12 h-12 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-lg ${
                  canSend
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-900 hover:from-amber-300 hover:to-amber-400'
                    : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                }`}
                title={isJournalMode ? "Share sacred entry" : "Send offering"}
              >
                <Send className="w-6 h-6" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Sacred Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-center text-xs text-neutral-500 font-light"
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.span
                key="recording"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                Listening to your sacred offering... Click to stop recording
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                Type to write • Click mic to speak • Enter to send • Shift+Enter for new line
                {isJournalMode && ' • Your sacred thoughts are witnessed'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}