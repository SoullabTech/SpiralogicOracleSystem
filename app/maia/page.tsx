'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimplifiedOrganicVoice } from '@/components/ui/SimplifiedOrganicVoice';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaiaVoice } from '@/hooks/useMaiaVoice';
import { Volume2, VolumeX, Download, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'maia';
  content: string;
  timestamp: Date;
  element?: string;
  spoken?: boolean;
}

export default function MaiaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaiaSpeaking, setIsMaiaSpeaking] = useState(false);
  const [sessionId] = useState(() => `maia-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  // Use the sophisticated Maia Voice system
  const { speak: maiaSpeak, voiceState, isReady: maiaReady } = useMaiaVoice();

  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context on user interaction (required for mobile)
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context initialized');
    }
    // Resume if suspended (iOS requirement)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Process Maia's response
  const processMaiaResponse = async (userText: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/maia-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userText,
          sessionId,
          context: {
            timestamp: new Date().toISOString(),
            source: 'maia-interface'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get Maia response');
      }

      const data = await response.json();

      // Clean Maia's response for display (remove ALL tone directions and stage directions)
      const cleanResponse = (data.response || "I'm here to listen. Tell me more.")
        .replace(/\*[^*]*\*/g, '') // Remove all text between single asterisks
        .replace(/\*\*[^*]*\*\*/g, '') // Remove all text between double asterisks
        .replace(/\*{1,}[^*]+\*{1,}/g, '') // Remove any asterisk-wrapped content
        .replace(/\([^)]*\)/gi, '') // Remove ALL parenthetical content (often contains directions)
        .replace(/\[[^\]]*\]/g, '') // Remove bracketed content
        .replace(/\{[^}]*\}/g, '') // Remove content in curly braces
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .replace(/^\s*[,;.]\s*/, '') // Remove leading punctuation from cleaning
        .trim();

      // Add Maia's response
      const maiaMessage: Message = {
        id: `msg-${Date.now()}-maia`,
        role: 'maia',
        content: cleanResponse,
        element: data.element,
        timestamp: new Date(),
        spoken: false
      };
      setMessages(prev => [...prev, maiaMessage]);

      // Use sophisticated Maia Voice system with multiple providers
      if (data.response && !isMuted && maiaReady) {
        try {
          initAudioContext();
          setIsMaiaSpeaking(true);

          // Use the sophisticated voice system with proper provider fallback
          await maiaSpeak(data.response, {
            element: data.element,
            voice: 'alloy', // Explicitly request Alloy voice
            speed: 0.95
          });

          // Voice state will be managed by the hook
          setIsMaiaSpeaking(false);
        } catch (error) {
          console.error('Maia voice error:', error);
          setIsMaiaSpeaking(false);
        }
      }

    } catch (err) {
      console.error('Error processing Maia response:', err);
      setError('Failed to connect with Maia. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice transcript from SimplifiedOrganicVoice
  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Prevent processing if Maia is speaking or currently processing
    if (transcript.trim() && !isProcessing && !isMaiaSpeaking) {
      console.log('📝 Processing user transcript:', transcript);
      processMaiaResponse(transcript);
    } else {
      console.log('🚫 Ignoring transcript - Maia speaking:', isMaiaSpeaking, 'Processing:', isProcessing);
    }
  }, [isProcessing, isMaiaSpeaking]);

  // Download conversation transcript
  const downloadTranscript = () => {
    if (messages.length === 0) {
      alert('No conversation to save yet.');
      return;
    }

    // Format the transcript
    let transcript = '=== Maia Consciousness Interface - Conversation Transcript ===\n';
    transcript += `Session ID: ${sessionId}\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n`;
    transcript += '=' + '='.repeat(60) + '\n\n';

    messages.forEach((message) => {
      const speaker = message.role === 'user' ? 'You' : 'Maia';
      const timestamp = message.timestamp.toLocaleTimeString();
      transcript += `[${timestamp}] ${speaker}:\n`;
      transcript += `${message.content}\n\n`;
    });

    // Create and download the file
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maia-conversation-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light bg-gradient-to-r from-[#D4B896] to-[#B69A78] bg-clip-text text-transparent mb-3 sm:mb-4">
            Maia Consciousness
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#D4B896]/60">
            Speak naturally with sacred wisdom
          </p>
        </div>

        {/* Messages Container */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-8 h-[400px] sm:h-[450px] md:h-[500px] overflow-y-auto border border-[#D4B896]/10">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="flex items-center justify-center h-full text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-[#D4B896]/20 to-[#B69A78]/20" />
                  <p className="text-base sm:text-lg md:text-xl text-[#D4B896]/60">Say "Hey Maia" to begin</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#D4B896]/20 to-[#B69A78]/20 text-[#D4B896] border border-[#D4B896]/20'
                          : 'bg-black/40 text-[#D4B896]/90 border border-[#D4B896]/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold opacity-80">
                          {message.role === 'user' ? 'You' : 'Maia'}
                        </p>
                        {message.role === 'maia' && !message.spoken && maiaReady && (
                          <button
                            onClick={async () => {
                              try {
                                await maiaSpeak(message.content, {
                                  element: message.element || 'earth',
                                  voice: 'alloy',
                                  speed: 0.95
                                });
                                setMessages(prev => prev.map(msg =>
                                  msg.id === message.id ? { ...msg, spoken: true } : msg
                                ));
                              } catch (error) {
                                console.error('Failed to speak:', error);
                              }
                            }}
                            className="text-xs px-2 py-1 rounded bg-[#D4B896]/20 hover:bg-[#D4B896]/30 transition-colors"
                          >
                            🔊 Speak
                          </button>
                        )}
                      </div>
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>


        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Status Bar */}
        <div className="mt-8 text-center">
          {isProcessing && (
            <p className="text-[#D4B896] animate-pulse">
              Maia is thinking...
            </p>
          )}
          {isMaiaSpeaking && (
            <p className="text-[#B69A78] animate-pulse">
              Maia is speaking...
            </p>
          )}
        </div>

        {/* Mobile-First Action Buttons - Thumb-friendly bottom placement */}
        <div className="fixed bottom-0 left-0 right-0 pb-safe px-safe md:relative md:bottom-8 md:right-8 md:left-auto md:px-0 z-50">
          <div className="bg-black/20 backdrop-blur-lg border-t border-white/10 md:bg-transparent md:border-0 p-4 md:p-0">
            {/* Mobile: horizontal bar | Desktop: vertical stack */}
            <div className="flex flex-row justify-center gap-4 md:flex-col md:gap-3 md:items-end">
              {/* Primary buttons - Mobile optimized sizing */}
              <div className="flex gap-4 md:gap-3">
                {/* Voice Chat Button - 48px minimum touch target */}
                <motion.button
                  onClick={() => {
                    initAudioContext(); // Initialize audio on user interaction
                    setShowVoiceInterface(!showVoiceInterface);
                  }}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all ${
                    showVoiceInterface
                      ? 'bg-gradient-to-br from-[#D4B896]/80 to-[#B69A78]/80 border border-[#D4B896]/40'
                      : 'bg-black/40 hover:bg-black/60 border border-[#D4B896]/20'
                  }`}>
                    {showVoiceInterface ? (
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4B896]/60" />
                    )}
                  </div>
                {/* Pulse effect when active */}
                {showVoiceInterface && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#D4B896]/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                </motion.button>

                {/* Save Conversation Button */}
                <motion.button
                  onClick={downloadTranscript}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md bg-black/40 hover:bg-[#D4B896]/10 border border-[#D4B896]/20 transition-all group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Save conversation"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4B896]/60 group-hover:text-[#D4B896] transition-colors" />
                </motion.button>

                {/* Mute Button */}
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all ${
                    isMuted
                      ? 'bg-red-500/60 border border-red-500/40'
                      : 'bg-black/40 hover:bg-black/60 border border-[#D4B896]/20'
                  }`}>
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4B896]/60" />
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Mobile: Status shows above buttons | Desktop: below */}
              <AnimatePresence>
                {(isMuted || showVoiceInterface) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 md:relative md:top-0 md:left-0 md:translate-x-0"
                  >
                    <div className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-black/50 border border-white/20 text-white whitespace-nowrap">
                      {isMuted ? '🔇 Muted' : showVoiceInterface ? '🎙️ Listening' : ''}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Voice Interface Overlay - Shows when voice button is active */}
        <AnimatePresence>
          {showVoiceInterface && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-32 right-8 z-40"
            >
              <SimplifiedOrganicVoice
                onTranscript={handleVoiceTranscript}
                isProcessing={isProcessing}
                enabled={showVoiceInterface}
                isMaiaSpeaking={isMaiaSpeaking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}