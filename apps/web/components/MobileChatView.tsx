'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { smoothScrollPolyfill, preventIOSZoom, isIOS } from '../utils/ios-fixes';
import {
  Mic, Send, Sparkles, Pause, Play,
  Volume2, VolumeX, ChevronUp, Square
} from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import OracleVoicePlayer from './voice/OracleVoicePlayer';

interface MobileChatViewProps {
  userId: string;
  onSendMessage: (text: string) => void;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
  }>;
  isLoading?: boolean;
}

export default function MobileChatView({ 
  userId, 
  onSendMessage, 
  messages,
  isLoading = false 
}: MobileChatViewProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showMobileVoiceMode, setShowMobileVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom - iOS compatible
  useEffect(() => {
    if (messagesEndRef.current) {
      smoothScrollPolyfill(messagesEndRef.current, { behavior: 'smooth' });
    }
  }, [messages]);

  // Apply iOS fixes when component mounts
  useEffect(() => {
    if (isIOS() && inputRef.current) {
      preventIOSZoom(inputRef.current);
    }
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleStartVoice = () => {
    setIsRecording(true);
    setShowMobileVoiceMode(true);
  };

  const handleStopVoice = () => {
    setIsRecording(false);
    setShowMobileVoiceMode(false);
  };

  const handleVoiceTranscription = (transcript: string) => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
    }
    handleStopVoice();
  };

  const quickPrompts = [
    { text: "What&apos;s my elemental balance?", emoji: "🔥" },
    { text: "I need guidance", emoji: "✨" },
    { text: "Tell me about my symbols", emoji: "🌙" },
    { text: "How am I growing?", emoji: "🌱" }
  ];

  // Mobile Voice Mode Component
  const MobileVoiceMode = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-neutral-900 to-black flex flex-col items-center justify-center p-6"
    >
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-light text-emerald-400">Maya is Listening</h2>
        </div>
        <p className="text-neutral-400">Speak your truth...</p>
      </motion.div>

      <div className="relative mb-8">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-400/20 to-orange-400/20 border-2 border-emerald-400/40 flex items-center justify-center"
          animate={{
            scale: isRecording ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 2, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
        >
          <Mic className="w-12 h-12 text-emerald-400" />
        </motion.div>

        {/* Recording pulse animation */}
        {isRecording && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-400"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-orange-400"
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </div>

      {/* Voice visualization */}
      <div className="flex items-center gap-1 mb-8">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-emerald-400 rounded-full"
            animate={{
              height: isRecording ? [4, 20, 4] : 4,
              opacity: isRecording ? [0.3, 1, 0.3] : 0.3
            }}
            transition={{
              duration: 0.5,
              repeat: isRecording ? Infinity : 0,
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      <VoiceRecorder
        onTranscription={handleVoiceTranscription}
        onRecordingChange={setIsRecording}
        className="hidden" // Hide the actual recorder UI, we're providing our own
      />

      <motion.button
        onClick={handleStopVoice}
        className="px-8 py-4 bg-red-500/20 border border-red-400/40 rounded-2xl text-red-400 hover:bg-red-500/30 transition-all active:scale-95"
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-3">
          <Square className="w-5 h-5" />
          <span>Stop & Send</span>
        </div>
      </motion.button>

      <p className="mt-4 text-xs text-neutral-500 text-center max-w-xs">
        Tap to stop recording and send your message
      </p>
    </motion.div>
  );

  return (
    <>
      {/* Mobile Voice Mode Overlay */}
      <AnimatePresence>
        {showMobileVoiceMode && <MobileVoiceMode />}
      </AnimatePresence>

      <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 via-neutral-800 to-orange-900/20">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] px-4 py-3 rounded-2xl
                ${message.role === 'user' 
                  ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white'
                  : 'bg-white/15 text-white border border-emerald-500/20'}
              `}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-emerald-300">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-medium">Maya</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>

                {message.audioUrl && audioEnabled && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <OracleVoicePlayer 
                      audioUrl={message.audioUrl}
                      autoPlay={index === messages.length - 1}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/15 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => {
                    setInputText(prompt.text);
                    setShowQuickActions(false);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2.5 bg-white/10 rounded-full text-sm text-white/80 hover:bg-white/20 active:scale-95 transition-all duration-150 flex items-center gap-2 min-h-[44px] select-none"
                >
                  <span>{prompt.emoji}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="p-4 bg-gradient-to-t from-black/60 to-transparent ios-safe-bottom">
        <div className="flex items-end gap-2">
          {/* Quick actions toggle */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px]"
            aria-label="Toggle quick actions"
          >
            <ChevronUp className={`w-5 h-5 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px]"
            aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what&apos;s present..."
              className="w-full px-4 py-3 bg-white/15 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px] max-h-[120px] text-base leading-relaxed"
              rows={1}
            />
          </div>

          {/* Enhanced Voice/Send button for mobile-first */}
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 min-w-[56px] min-h-[56px] shadow-lg"
              aria-label="Send message"
            >
              <Send className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleStartVoice}
              disabled={isLoading}
              className={`p-4 rounded-full text-white hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 min-w-[56px] min-h-[56px] shadow-lg ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>

        {/* Character count for longer messages */}
        {inputText.length > 200 && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${inputText.length > 500 ? 'text-orange-400' : 'text-white/40'}`}>
              {inputText.length} / 500
            </span>
          </div>
        )}

        {/* Mobile Voice Hint */}
        {!inputText && !showQuickActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
          >
            <span className="text-xs text-emerald-400/60">
              Tap the mic for voice • Type to write
            </span>
          </motion.div>
        )}
      </div>
    </>
  );
}