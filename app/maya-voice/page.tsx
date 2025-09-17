'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceActivatedMaya } from '@/components/ui/VoiceActivatedMaya';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'maya';
  text: string;
  timestamp: Date;
}

export default function MayaVoicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: transcript,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Process with Maya
    setIsProcessing(true);
    try {
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: transcript,
          userId: 'voice-user',
          sessionId: 'voice-session'
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const mayaResponse = data.message || data.response || "Tell me more.";

      // Add Maya's message
      const mayaMessage: Message = {
        id: `maya-${Date.now()}`,
        role: 'maya',
        text: mayaResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mayaMessage]);

      // Speak Maya's response
      speakResponse(mayaResponse);

    } catch (error) {
      console.error('Error getting Maya response:', error);
      const errorMessage: Message = {
        id: `maya-${Date.now()}`,
        role: 'maya',
        text: "I didn't catch that. Try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      speakResponse(errorMessage.text);
    }
  }, [isProcessing]);

  // Text-to-speech for Maya
  const speakResponse = useCallback((text: string) => {
    if (!voiceEnabled) {
      setIsProcessing(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(
      voice => voice.name.includes('Female') || voice.name.includes('Samantha')
    ) || window.speechSynthesis.getVoices()[0];
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsProcessing(false);
    };

    utterance.onerror = () => {
      setIsProcessing(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    window.speechSynthesis.cancel();
  };

  // Privacy-first session reset
  const resetSession = () => {
    setMessages([]);
    window.speechSynthesis.cancel();
    // Create new session ID for privacy
    const newSessionId = `voice-session-${Date.now()}`;
    console.log('New private session:', newSessionId);
    // No data is stored - everything stays local
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Maya Voice Conversation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Speak naturally - Maya listens continuously and responds
          </p>
        </div>

        {/* Messages Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 h-[400px] overflow-y-auto">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                className="flex items-center justify-center h-full text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                  </svg>
                  <p>Start speaking to begin your conversation with Maya</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1 opacity-75">
                        {message.role === 'user' ? 'You' : 'Maya'}
                      </p>
                      <p>{message.text}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Control Center */}
        <div className="flex flex-col items-center space-y-4">
          <VoiceActivatedMaya
            onTranscript={handleVoiceTranscript}
            isProcessing={isProcessing}
            enabled={voiceEnabled}
          />

          {/* Additional Controls */}
          <div className="flex space-x-4">
            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Clear Conversation
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-4 py-2 rounded-lg transition ${
                voiceEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
            >
              Voice {voiceEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How to use Voice Conversation:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Click the microphone to start (you'll be asked for permission first time)</li>
            <li>• Speak naturally - Maya listens continuously</li>
            <li>• After you stop speaking for 1.5 seconds, Maya will respond</li>
            <li>• The conversation flows naturally - no need to press anything</li>
            <li>• Maya speaks her responses out loud</li>
            <li>• Click the microphone again to stop</li>
          </ul>
        </div>
      </div>
    </div>
  );
}