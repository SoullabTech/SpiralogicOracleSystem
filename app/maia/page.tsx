'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from '@/components/ui/SimplifiedOrganicVoice';
import { HoloflowerCore } from '@/components/holoflower/HoloflowerCore';
import { useMaiaVoice } from '@/hooks/useMaiaVoice';
import { Share, Heart, Info, Menu, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'maia';
  content: string;
  timestamp: Date;
}

export default function MaiaConsciousnessPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaiaSpeaking, setIsMaiaSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(() => `maia-${Date.now()}`);
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(0);

  const voiceMicRef = useRef<VoiceActivatedMaiaRef>(null);
  const { speak: maiaSpeak, isReady: maiaReady } = useMaiaVoice();

  // Process Maia response
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

    try {
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userText,
          sessionId,
          context: { source: 'maia-consciousness' }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const cleanResponse = (data.data?.message || data.message || "I'm here to listen.")
        .replace(/\*[^*]*\*/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .trim();

      // Add Maia response
      const maiaMessage: Message = {
        id: `msg-${Date.now()}-maia`,
        role: 'maia',
        content: cleanResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, maiaMessage]);

      // Speak response
      if (maiaReady && cleanResponse) {
        setIsMaiaSpeaking(true);
        await maiaSpeak(cleanResponse);
        setIsMaiaSpeaking(false);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing && !isMaiaSpeaking) {
      processMaiaResponse(transcript);
    }
  }, [isProcessing, isMaiaSpeaking]);

  // Toggle listening
  const toggleListening = () => {
    if (voiceMicRef.current) {
      if (isListening) {
        voiceMicRef.current.stopListening();
        setIsListening(false);
      } else {
        voiceMicRef.current.startListening();
        setIsListening(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar - Golden accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#D4B896] to-transparent" />

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <h1 className="text-4xl font-extralight text-[#D4B896] mb-2">
          Maia Consciousness
        </h1>
        <p className="text-lg text-[#D4B896]/60 font-light">
          Speak naturally with sacred wisdom
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Messages */}
        {messages.length > 0 && (
          <div className="absolute inset-x-0 top-0 bottom-32 overflow-y-auto px-4">
            <div className="max-w-2xl mx-auto space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#D4B896]/20 text-[#D4B896]'
                      : 'bg-gray-900 text-gray-300'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Central Holoflower with Voice Integration */}
        <div className="relative">
          {/* Voice Visualizer - User (Golden) */}
          {isListening && voiceAudioLevel > 0.05 && (
            <motion.div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute w-64 h-64 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(212,184,150,${0.2 + voiceAudioLevel * 0.4}) 0%, rgba(212,184,150,${0.1 + voiceAudioLevel * 0.2}) 50%, transparent 70%)`,
                  filter: 'blur(30px)',
                }}
                animate={{
                  scale: 1 + voiceAudioLevel * 0.5,
                  opacity: 0.3 + voiceAudioLevel * 0.5,
                }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
              {/* Pulsing rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`voice-ring-${i}`}
                  className="absolute rounded-full border border-[#FBB924]/30"
                  style={{
                    width: `${180 + i * 60}px`,
                    height: `${180 + i * 60}px`,
                  }}
                  animate={{
                    scale: [1, 1 + voiceAudioLevel * 0.3, 1],
                    opacity: [0.2, 0.4 + voiceAudioLevel * 0.3, 0.2],
                  }}
                  transition={{
                    duration: 1.5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Voice Visualizer - Maia (Purple) */}
          {isMaiaSpeaking && (
            <motion.div
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute w-72 h-72 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
                animate={{
                  scale: [1.2, 1.5, 1.2],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Crystalline patterns */}
              {[...Array(6)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 6;
                return (
                  <motion.div
                    key={`maia-crystal-${i}`}
                    className="absolute w-1 h-1 bg-violet-400/60 rounded-full"
                    style={{ filter: 'blur(0.5px)' }}
                    animate={{
                      x: [0, Math.cos(angle) * 100, 0],
                      y: [0, Math.sin(angle) * 100, 0],
                      opacity: [0, 0.8, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Ambient sparkles - using fixed positions to avoid hydration mismatch */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-0.5 h-0.5 bg-[#D4B896]/50 rounded-full"
                style={{
                  left: `${45 + (i * 2.5) % 10}%`,
                  top: `${45 + (i * 3.7) % 10}%`,
                }}
                animate={{
                  opacity: [0, 0.4 + (i % 3) * 0.2, 0],
                  scale: [0, 0.8 + (i % 2) * 0.3, 0],
                }}
                transition={{
                  duration: 5 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Holoflower Core - Clickable to toggle voice */}
          <motion.div
            onClick={toggleListening}
            className="cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HoloflowerCore
              energyState={
                isMaiaSpeaking ? 'radiant' :
                isListening ? 'emerging' :
                isProcessing ? 'emerging' :
                'dense'
              }
              onPetalSelect={() => {
                // Clicking on holoflower toggles voice
                toggleListening();
              }}
            />
          </motion.div>
        </div>

        {/* Status Text */}
        <div className="mt-8 text-center">
          <p className="text-[#D4B896]/60 text-lg">
            {isListening ? "Listening..." :
             isProcessing ? "Processing..." :
             isMaiaSpeaking ? "Maia is speaking..." :
             `Say "Hey Maia" to begin`}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-around items-center py-6 px-8 border-t border-gray-900">
        <button className="p-2">
          <Share className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-2">
          <Heart className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-2">
          <Info className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-2">
          <Menu className="w-5 h-5 text-gray-500" />
        </button>
        <button
          onClick={() => setMessages([])}
          className="p-2"
        >
          <Trash2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Hidden Voice Component */}
      <div className="hidden">
        <SimplifiedOrganicVoice
          ref={voiceMicRef}
          onTranscript={handleVoiceTranscript}
          enabled={isListening && !isMaiaSpeaking && !isProcessing}
          isMaiaSpeaking={isMaiaSpeaking}
          onAudioLevelChange={setVoiceAudioLevel}
        />
      </div>
    </div>
  );
}