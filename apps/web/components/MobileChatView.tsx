'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Send, Sparkles, Pause, Play, 
  Volume2, VolumeX, ChevronUp 
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const quickPrompts = [
    { text: "What&apos;s my elemental balance?", emoji: "🔥" },
    { text: "I need guidance", emoji: "✨" },
    { text: "Tell me about my symbols", emoji: "🌙" },
    { text: "How am I growing?", emoji: "🌱" }
  ];

  return (
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
                  : 'bg-white/10 backdrop-blur text-white border border-emerald-500/20'}
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
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-2xl">
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
                  className="px-4 py-2.5 bg-white/10 backdrop-blur rounded-full text-sm text-white/80 hover:bg-white/20 active:scale-95 transition-all duration-150 flex items-center gap-2 min-h-[44px] touch-none select-none"
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
      <div className="p-4 bg-gradient-to-t from-black/30 to-transparent backdrop-blur-lg">
        <div className="flex items-end gap-2">
          {/* Quick actions toggle */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px] touch-none"
            aria-label="Toggle quick actions"
          >
            <ChevronUp className={`w-5 h-5 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px] touch-none"
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
              className="w-full px-4 py-3 bg-white/10 backdrop-blur rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px] max-h-[120px] text-base leading-relaxed"
              rows={1}
            />
          </div>

          {/* Voice/Send button */}
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 min-w-[48px] min-h-[48px] touch-none"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <VoiceRecorder
              onTranscription={(text) => {
                setInputText(text);
                inputRef.current?.focus();
              }}
              onRecordingChange={setIsRecording}
              className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px] touch-none"
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </VoiceRecorder>
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
      </div>
    </div>
  );
}