'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Send, Mic, MicOff } from 'lucide-react';

interface MobileChatInterfaceProps {
  onSubmit: (message: string, files?: File[]) => void;
  isProcessing: boolean;
  messages: Array<{
    id?: string;
    role: 'user' | 'oracle';
    text: string;
    timestamp: Date;
  }>;
  agentName?: string;
  onVoiceToggle?: () => void;
  isVoiceActive?: boolean;
  isSpeaking?: boolean;
  currentSpeaker?: 'user' | 'maia' | null;
}

export default function MobileChatInterface({
  onSubmit,
  isProcessing,
  messages,
  agentName = 'Maya',
  onVoiceToggle,
  isVoiceActive = false,
  isSpeaking = false,
  currentSpeaker = null
}: MobileChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input on mount (mobile-friendly)
  useEffect(() => {
    // Delay to prevent keyboard from immediately opening on mobile
    const timer = setTimeout(() => {
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const files = fileInputRef.current?.files
      ? Array.from(fileInputRef.current.files)
      : undefined;

    if (inputValue.trim() || files?.length) {
      onSubmit(inputValue.trim() || 'Please review this file', files);
      setInputValue('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1a1f2e]">
      {/* Compact Header with Mini Holoflower */}
      <div className="flex-shrink-0 bg-black/60 backdrop-blur-lg border-b border-gold-divine/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mini Holoflower with state indicator */}
            <motion.div
              className="relative w-12 h-12"
              animate={{
                scale: isSpeaking ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-divine/20 to-gold-amber/20" />
              {isSpeaking && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: currentSpeaker === 'user'
                      ? 'radial-gradient(circle, rgba(107, 155, 209, 0.4) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(212, 184, 150, 0.4) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.2, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <img
                src="/holoflower.svg"
                alt="Maya"
                className="w-full h-full object-contain p-2"
              />
            </motion.div>

            <div>
              <h1 className="text-gold-divine font-medium text-lg">{agentName}</h1>
              <p className="text-xs text-neutral-mystic">
                {isProcessing ? 'Reflecting...' :
                 isSpeaking && currentSpeaker === 'user' ? 'Listening...' :
                 isSpeaking && currentSpeaker === 'maia' ? 'Speaking...' :
                 'Ready'}
              </p>
            </div>
          </div>

          {/* Voice Toggle */}
          {onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              className={`p-2 rounded-full transition-all ${
                isVoiceActive
                  ? 'bg-gold-divine/20 text-gold-divine'
                  : 'bg-black/30 text-neutral-mystic'
              }`}
              aria-label={isVoiceActive ? 'Disable voice' : 'Enable voice'}
            >
              {isVoiceActive ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - Expanded for mobile */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id || `${message.role}-${message.timestamp.getTime()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-sacred-blue text-white'
                      : 'bg-black/40 text-neutral-silver border border-gold-divine/20'
                  }`}
                >
                  {message.role === 'oracle' && (
                    <div className="text-gold-amber text-xs font-medium mb-1">
                      {agentName}
                    </div>
                  )}
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <div className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 bg-black/40 rounded-2xl border border-gold-divine/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gold-divine rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gold-divine">
                    {agentName} is reflecting...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Enhanced for mobile */}
      <div className="flex-shrink-0 bg-black/80 backdrop-blur-lg border-t border-gold-divine/20">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-3 items-end">
            {/* Text Input - Larger for mobile */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="w-full px-4 py-4 pr-12 bg-black/50 border border-gold-divine/30
                         rounded-2xl text-gold-divine placeholder-gold-divine/40
                         text-base sm:text-sm
                         focus:outline-none focus:border-gold-divine/60
                         disabled:opacity-50 transition-all"
                autoComplete="off"
                autoCapitalize="sentences"
                enterKeyHint="send"
              />

              {/* File Upload - Inside input field */}
              <input
                ref={fileInputRef}
                type="file"
                id="mobileFileUpload"
                className="hidden"
                multiple
                accept="*"
              />
              <label
                htmlFor="mobileFileUpload"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2
                         text-gold-divine/60 hover:text-gold-divine
                         cursor-pointer transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </label>
            </div>

            {/* Send Button - Larger for mobile */}
            <button
              type="submit"
              disabled={isProcessing || (!inputValue.trim() && !fileInputRef.current?.files?.length)}
              className="p-4 bg-gradient-to-r from-gold-divine/20 to-gold-amber/20
                       border border-gold-divine/30 rounded-2xl text-gold-divine
                       hover:from-gold-divine/30 hover:to-gold-amber/30
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Character count for long messages */}
          {inputValue.length > 200 && (
            <div className="mt-2 text-xs text-gold-divine/40 text-right">
              {inputValue.length} characters
            </div>
          )}
        </form>
      </div>
    </div>
  );
}