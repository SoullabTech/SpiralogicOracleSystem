'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimplifiedOrganicVoice } from '@/components/ui/SimplifiedOrganicVoice';
import { motion, AnimatePresence } from 'framer-motion';
import { MayaVoiceSynthesis } from '@/lib/voice/MayaVoiceSynthesis';

interface Message {
  id: string;
  role: 'user' | 'maya';
  content: string;
  timestamp: Date;
  element?: string;
}

export default function MayaPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const [sessionId] = useState(() => `maya-${Date.now()}`);
  const [error, setError] = useState<string | null>(null);

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

      // Add Maya's response
      const mayaMessage: Message = {
        id: `msg-${Date.now()}-maya`,
        role: 'maya',
        content: data.response || "I'm here to listen. Tell me more.",
        element: data.element,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mayaMessage]);

      // Play Maya's voice response using TTS
      if (data.response) {
        MayaVoiceSynthesis.speak(data.response, data.element || 'earth');
        setIsMayaSpeaking(true);

        // Set a timeout to clear speaking state
        setTimeout(() => {
          setIsMayaSpeaking(false);
        }, Math.max(2000, data.response.length * 50)); // Estimate duration
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
                      <p className="text-sm font-semibold mb-2 opacity-80">
                        {message.role === 'user' ? 'You' : 'Maya'}
                      </p>
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Interface */}
        <div className="flex justify-center">
          <SimplifiedOrganicVoice
            onTranscript={handleVoiceTranscript}
            isProcessing={isProcessing}
            enabled={true}
            isMayaSpeaking={isMayaSpeaking}
          />
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
      </div>
    </div>
  );
}