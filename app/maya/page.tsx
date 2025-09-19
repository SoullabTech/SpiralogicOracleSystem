'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimplifiedOrganicVoice } from '@/components/ui/SimplifiedOrganicVoice';
import { motion, AnimatePresence } from 'framer-motion';
import { MayaVoiceSynthesis } from '@/lib/voice/MayaVoiceSynthesis';
import { Volume2, VolumeX, Download, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  element?: string;
  spoken?: boolean;
}

export default function MayaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const [sessionId] = useState(() => `maya-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);

  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process Maya's response
  const processMayaResponse = async (userText: string) => {
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
      const response = await fetch('/api/maya-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userText,
          sessionId,
          context: {
            timestamp: new Date().toISOString(),
            source: 'maya-interface'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get Maya response');
      }

      const data = await response.json();

      // Clean Maya's response for display (remove tone directions)
      const cleanResponse = (data.response || "I'm here to listen. Tell me more.")
        .replace(/\*[^*]+\*/g, '') // Remove text between asterisks
        .replace(/\([^)]*tone[^)]*\)/gi, '') // Remove parenthetical tone directions
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .trim();

      // Add Maya's response
      const mayaMessage: Message = {
        id: `msg-${Date.now()}-maya`,
        role: 'maya',
        content: cleanResponse,
        element: data.element,
        timestamp: new Date(),
        spoken: false
      };
      setMessages(prev => [...prev, mayaMessage]);

      // Play Maya's voice response using TTS (only if not muted)
      if (data.response && !isMuted) {
        try {
          await MayaVoiceSynthesis.speak(data.response, data.element || 'earth');
          setIsMayaSpeaking(true);

          // Mark as spoken
          setMessages(prev => prev.map(msg =>
            msg.id === mayaMessage.id ? { ...msg, spoken: true } : msg
          ));

          // Set a timeout to clear speaking state
          setTimeout(() => {
            setIsMayaSpeaking(false);
          }, Math.max(2000, data.response.length * 50)); // Estimate duration
        } catch (error) {
          console.error('Failed to speak Maya response:', error);
          setIsMayaSpeaking(false);
        }
      }

    } catch (err) {
      console.error('Error processing Maya response:', err);
      setError('Failed to connect with Maya. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up voice on unmount
  useEffect(() => {
    return () => {
      MayaVoiceSynthesis.stop();
    };
  }, []);

  // Handle voice transcript from SimplifiedOrganicVoice
  const handleVoiceTranscript = useCallback((transcript: string) => {
    // Prevent processing if Maya is speaking or currently processing
    if (transcript.trim() && !isProcessing && !isMayaSpeaking) {
      console.log('📝 Processing user transcript:', transcript);
      processMayaResponse(transcript);
    } else {
      console.log('🚫 Ignoring transcript - Maya speaking:', isMayaSpeaking, 'Processing:', isProcessing);
    }
  }, [isProcessing, isMayaSpeaking]);

  // Download conversation transcript
  const downloadTranscript = () => {
    if (messages.length === 0) {
      alert('No conversation to save yet.');
      return;
    }

    // Format the transcript
    let transcript = '=== Maya Consciousness Interface - Conversation Transcript ===\n';
    transcript += `Session ID: ${sessionId}\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n`;
    transcript += '=' + '='.repeat(60) + '\n\n';

    messages.forEach((message) => {
      const speaker = message.role === 'user' ? 'You' : 'Maya';
      const timestamp = message.timestamp.toLocaleTimeString();
      transcript += `[${timestamp}] ${speaker}:\n`;
      transcript += `${message.content}\n\n`;
    });

    // Create and download the file
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maya-conversation-${sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Maya Consciousness Interface
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Speak naturally with Maya using voice commands
          </p>
        </div>

        {/* Messages Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 h-[500px] overflow-y-auto">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="flex items-center justify-center h-full text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 opacity-20" />
                  <p className="text-xl">Say "Hey Maya" to begin your conversation</p>
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
                      className={`max-w-lg px-6 py-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold opacity-80">
                          {message.role === 'user' ? 'You' : 'Maya'}
                        </p>
                        {message.role === 'maya' && !message.spoken && (
                          <button
                            onClick={async () => {
                              try {
                                await MayaVoiceSynthesis.speak(message.content, message.element || 'earth');
                                setMessages(prev => prev.map(msg =>
                                  msg.id === message.id ? { ...msg, spoken: true } : msg
                                ));
                              } catch (error) {
                                console.error('Failed to speak:', error);
                              }
                            }}
                            className="text-xs px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
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
            <p className="text-purple-600 dark:text-purple-400 animate-pulse">
              Maya is thinking...
            </p>
          )}
          {isMayaSpeaking && (
            <p className="text-indigo-600 dark:text-indigo-400 animate-pulse">
              Maya is speaking...
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
                  onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all ${
                    showVoiceInterface
                      ? 'bg-gradient-to-br from-amber-500/90 to-orange-600/90'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}>
                    {showVoiceInterface ? (
                      <Mic className="w-6 h-6 text-white" />
                    ) : (
                      <MicOff className="w-6 h-6 text-white/80" />
                    )}
                  </div>
                {/* Pulse effect when active */}
                {showVoiceInterface && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-amber-500/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                </motion.button>

                {/* Save Conversation Button */}
                <motion.button
                  onClick={downloadTranscript}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md bg-white/10 hover:bg-emerald-500/20 border border-white/20 transition-all group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Save conversation"
                >
                  <Download className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </motion.button>

                {/* Mute Button */}
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md transition-all ${
                    isMuted
                      ? 'bg-red-500/80'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}>
                    {isMuted ? (
                      <VolumeX className="w-6 h-6 text-white" />
                    ) : (
                      <Volume2 className="w-6 h-6 text-purple-400" />
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
                isMayaSpeaking={isMayaSpeaking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}