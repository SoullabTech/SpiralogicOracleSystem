'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HoloflowerCore } from '@/components/holoflower/HoloflowerCore';
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

export default function MaiaHoloflowerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaiaSpeaking, setIsMaiaSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [sessionId] = useState(() => `maia-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

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

      // Clean Maia's response for display
      const cleanResponse = (data.response || "I'm here to listen. Tell me more.")
        .replace(/\*[^*]*\*/g, '')
        .replace(/\*\*[^*]*\*\*/g, '')
        .replace(/\*{1,}[^*]+\*{1,}/g, '')
        .replace(/\([^)]*\)/gi, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\{[^}]*\}/g, '')
        .replace(/\s+/g, ' ')
        .replace(/^\s*[,;.]\s*/, '')
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

      // Voice response
      if (data.response && !isMuted && maiaReady) {
        try {
          initAudioContext();
          setIsMaiaSpeaking(true);
          await maiaSpeak(data.response, {
            element: data.element,
            voice: 'alloy',
            speed: 0.95
          });
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

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing && !isMaiaSpeaking) {
      console.log('📝 Processing user transcript:', transcript);
      setIsWaitingForInput(false);
      processMaiaResponse(transcript);
    }
  }, [isProcessing, isMaiaSpeaking]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="text-center pt-6 pb-2 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-light text-[#D4B896]">
          Maia Consciousness
        </h1>
        <p className="text-xs sm:text-sm text-[#D4B896]/50 mt-1">
          Speak naturally with sacred wisdom
        </p>
      </div>

      {/* Main Visualization Area */}
      <div className="relative h-[calc(100vh-200px)] max-w-7xl mx-auto">
        {/* Holoflower Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <HoloflowerCore
            energyState={isMaiaSpeaking ? 'radiant' : isWaitingForInput ? 'emerging' : 'dense'}
            onPetalSelect={(petal) => {
              console.log('Petal selected:', petal);
              // Could trigger specific conversations based on petal
            }}
          />
        </div>

        {/* Messages Overlay */}
        {messages.length > 0 && (
          <div className="absolute inset-x-0 top-0 h-full overflow-y-auto px-4 py-8 pointer-events-none">
            <AnimatePresence>
              <div className="space-y-3 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl backdrop-blur-md pointer-events-auto ${
                        message.role === 'user'
                          ? 'bg-[#D4B896]/10 text-[#D4B896] border border-[#D4B896]/20'
                          : 'bg-black/30 text-[#D4B896]/80 border border-[#D4B896]/10'
                      }`}
                    >
                      <p className="text-xs opacity-60 mb-1">
                        {message.role === 'user' ? 'You' : 'Maia'}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </AnimatePresence>
          </div>
        )}

        {/* Central Status */}
        {messages.length === 0 && (
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 text-center">
            <motion.p
              className="text-sm text-[#D4B896]/60"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Say "Hey Maia" to begin
            </motion.p>
          </div>
        )}

        {/* Processing Status */}
        <AnimatePresence>
          {(isProcessing || isMaiaSpeaking) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="text-center text-[#D4B896]/80">
                {isProcessing && <p className="animate-pulse">Maia is thinking...</p>}
                {isMaiaSpeaking && <p className="animate-pulse">Maia is speaking...</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-black/60 backdrop-blur-lg border-t border-[#D4B896]/10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex justify-center items-center gap-6">
              {/* Voice Button */}
              <motion.button
                onClick={() => {
                  initAudioContext();
                  setShowVoiceInterface(!showVoiceInterface);
                  setIsListening(!isListening);
                }}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  showVoiceInterface
                    ? 'bg-gradient-to-br from-[#D4B896]/70 to-[#B69A78]/70 shadow-lg shadow-[#D4B896]/30'
                    : 'bg-black/50 border border-[#D4B896]/30 hover:bg-[#D4B896]/10'
                }`}>
                  {showVoiceInterface ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <MicOff className="w-6 h-6 text-[#D4B896]/60" />
                  )}
                </div>
                {/* Active pulse */}
                {showVoiceInterface && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#D4B896]/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>

              {/* Download Button */}
              <motion.button
                onClick={() => {
                  if (messages.length === 0) {
                    alert('No conversation to save yet.');
                    return;
                  }
                  // Download logic here
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-black/50 border border-[#D4B896]/30 hover:bg-[#D4B896]/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5 text-[#D4B896]/60" />
              </motion.button>

              {/* Mute Button */}
              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: isMuted ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.5)',
                  border: `1px solid ${isMuted ? 'rgba(239,68,68,0.5)' : 'rgba(212,184,150,0.3)'}`
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#D4B896]/60" />
                )}
              </motion.button>
            </div>

            {/* Status Text */}
            <AnimatePresence>
              {showVoiceInterface && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-2"
                >
                  <p className="text-xs text-[#D4B896]/60">🎙️ Listening</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Voice Interface (Hidden) */}
      {showVoiceInterface && (
        <div className="fixed bottom-[-200px] opacity-0 pointer-events-none">
          <SimplifiedOrganicVoice
            onTranscript={handleVoiceTranscript}
            enabled={showVoiceInterface}
            isMaiaSpeaking={isMaiaSpeaking}
          />
        </div>
      )}
    </div>
  );
}