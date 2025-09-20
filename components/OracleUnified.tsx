'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloflowerCore } from './holoflower/HoloflowerCore';
import { SimplifiedOrganicVoice } from './ui/SimplifiedOrganicVoice';
import { useMaiaVoice } from '@/hooks/useMaiaVoice';
import {
  Volume2, VolumeX, Download, Mic, MicOff,
  Paperclip, Send, MessageSquare, X
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  timestamp: Date;
  element?: string;
}

interface UnifiedOracleProps {
  sessionId?: string;
  onMessageAdded?: (message: Message) => void;
}

export function OracleUnified({ sessionId = `session-${Date.now()}`, onMessageAdded }: UnifiedOracleProps) {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaiaSpeaking, setIsMaiaSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Voice system
  const { speak: maiaSpeak, isReady: maiaReady } = useMaiaVoice();
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process Oracle response
  const processOracleResponse = async (userText: string, files?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onMessageAdded?.(userMessage);

    setIsProcessing(true);

    try {
      // Prepare form data if files exist
      const formData = new FormData();
      formData.append('message', userText);
      formData.append('sessionId', sessionId);

      if (files?.length) {
        files.forEach(file => formData.append('files', file));
      }

      const response = await fetch('/api/oracle/personal/consult', {
        method: 'POST',
        body: files?.length ? formData : JSON.stringify({
          message: userText,
          sessionId
        }),
        headers: files?.length ? {} : { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Clean response
      const cleanResponse = (data.response || data.message || "I'm here to listen.")
        .replace(/\*[^*]*\*/g, '')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Add oracle response
      const oracleMessage: Message = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        content: cleanResponse,
        element: data.element,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, oracleMessage]);
      onMessageAdded?.(oracleMessage);

      // Speak response if not muted
      if (!isMuted && maiaReady && cleanResponse) {
        try {
          initAudioContext();
          setIsMaiaSpeaking(true);
          await maiaSpeak(cleanResponse, {
            element: data.element,
            voice: 'alloy',
            speed: 0.95
          });
          setIsMaiaSpeaking(false);
        } catch (error) {
          console.error('Voice error:', error);
          setIsMaiaSpeaking(false);
        }
      }
    } catch (err) {
      console.error('Error processing response:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim() && !isProcessing && !isMaiaSpeaking) {
      processOracleResponse(transcript);
    }
  }, [isProcessing, isMaiaSpeaking]);

  // Handle text submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || selectedFiles.length > 0) && !isProcessing) {
      processOracleResponse(
        inputText.trim() || 'Please review these files',
        selectedFiles
      );
      setInputText('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Download conversation
  const downloadConversation = () => {
    if (!messages.length) return;

    const transcript = messages.map(msg =>
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.role === 'user' ? 'You' : 'Oracle'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oracle-conversation-${sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine holoflower energy state based on voice activity
  const getEnergyState = () => {
    if (isMaiaSpeaking) return 'radiant';  // Full glow when Maia speaks
    if (isListening) return 'emerging';     // Medium glow when user speaks
    if (isProcessing) return 'emerging';    // Processing state
    return 'dense';                         // Idle state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="text-center pt-4 pb-2 relative z-10">
        <h1 className="text-2xl font-light text-[#D4B896]">Oracle Interface</h1>
        <p className="text-xs text-[#D4B896]/50 mt-1">Sacred wisdom awaits</p>
      </div>

      {/* Main Content Area */}
      <div className="relative h-[calc(100vh-140px)]">
        {/* Holoflower with Voice Visualizer */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Pulsing Light Cloud - Ambient breathing */}
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'radial-gradient(circle, rgba(212,184,150,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          />

          {/* User Voice Glow - Golden when speaking */}
          {isListening && (
            <motion.div
              className="absolute w-80 h-80 rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(212,184,150,0.4) 0%, rgba(182,154,120,0.2) 50%, transparent 70%)',
                filter: 'blur(30px)'
              }}
            />
          )}

          {/* Maia Voice Signature - Purple/violet when speaking */}
          {isMaiaSpeaking && (
            <motion.div
              className="absolute w-72 h-72 rounded-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.6, 0.4],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)',
                filter: 'blur(35px)'
              }}
            />
          )}

          {/* Sparkles Container */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Golden Sparkles for User Voice */}
            {isListening && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`user-sparkle-${i}`}
                    className="absolute w-1 h-1 bg-[#D4B896] rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 200],
                      y: [0, (Math.random() - 0.5) * 200],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      boxShadow: '0 0 6px rgba(212,184,150,0.8)'
                    }}
                  />
                ))}
              </>
            )}

            {/* Purple Sparkles for Maia Voice */}
            {isMaiaSpeaking && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`maia-sparkle-${i}`}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 250],
                      y: [0, (Math.random() - 0.5) * 250],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: i * 0.15,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      boxShadow: '0 0 8px rgba(168,85,247,0.9)'
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Holoflower Core - Clickable Voice Button */}
          <motion.div
            onClick={() => {
              if (!showChatInterface) {
                // Toggle voice listening
                initAudioContext();
                setIsListening(!isListening);
                setIsMuted(false);
              }
            }}
            className="cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HoloflowerCore
              energyState={getEnergyState()}
              onPetalSelect={(petal) => {
                // When clicking on the holoflower, activate voice
                if (!showChatInterface) {
                  initAudioContext();
                  setIsListening(!isListening);
                  setIsMuted(false);
                }
              }}
            />
          </motion.div>

          {/* Voice Hint - Shows when hovering or first load */}
          <AnimatePresence>
            {!isListening && !isMaiaSpeaking && !showChatInterface && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
              >
                <p className="text-xs text-[#D4B896]/40 animate-pulse">
                  Tap to speak with Oracle
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages Overlay */}
        {messages.length > 0 && (
          <div className="absolute inset-x-0 top-0 h-full overflow-y-auto px-4 py-4">
            <div className="max-w-3xl mx-auto space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md px-4 py-2.5 rounded-2xl backdrop-blur-md ${
                      message.role === 'user'
                        ? 'bg-[#D4B896]/10 text-[#D4B896] border border-[#D4B896]/20'
                        : 'bg-black/30 text-[#D4B896]/80 border border-[#D4B896]/10'
                    }`}>
                      <p className="text-xs opacity-60 mb-1">
                        {message.role === 'user' ? 'You' : 'Oracle'}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Control Bar - Clean icon style at right */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <div className="bg-black/60 backdrop-blur-lg rounded-full p-2 flex flex-col gap-2">
            {/* Voice Button */}
            <motion.button
              onClick={() => {
                setShowChatInterface(false);
                initAudioContext();
                setIsListening(!isListening);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                !showChatInterface && isListening
                  ? 'bg-[#D4B896]/20 text-[#D4B896]'
                  : 'text-[#D4B896]/40 hover:text-[#D4B896]/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-4 h-4" />
            </motion.button>

            {/* Chat Button */}
            <motion.button
              onClick={() => {
                setShowChatInterface(true);
                setIsListening(false);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                showChatInterface
                  ? 'bg-[#D4B896]/20 text-[#D4B896]'
                  : 'text-[#D4B896]/40 hover:text-[#D4B896]/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-4 h-4" />
            </motion.button>

            {/* Upload Button */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#D4B896]/40 hover:text-[#D4B896]/80 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>

            {/* Download Button */}
            <motion.button
              onClick={downloadConversation}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#D4B896]/40 hover:text-[#D4B896]/80 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>

            {/* Mute Button */}
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-[#D4B896]/40 hover:text-[#D4B896]/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status Indicator */}
        <AnimatePresence>
          {(isProcessing || isMaiaSpeaking || isListening) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs text-[#D4B896]/80">
                {isProcessing && "Oracle is thinking..."}
                {isMaiaSpeaking && "Oracle is speaking..."}
                {isListening && !isProcessing && !isMaiaSpeaking && "Listening..."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Input Area */}
      {showChatInterface && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg border-t border-[#D4B896]/10">
          <div className="max-w-4xl mx-auto p-4">
            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-black/50 border border-[#D4B896]/30 rounded-full text-[#D4B896] placeholder-[#D4B896]/40 focus:outline-none focus:border-[#D4B896]/60 text-sm disabled:opacity-50"
              />

              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2.5 bg-black/50 border border-[#D4B896]/30 rounded-full text-[#D4B896]/60 hover:bg-[#D4B896]/10 transition-all"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isProcessing || (!inputText.trim() && selectedFiles.length === 0)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4B896]/20 to-[#B69A78]/20 border border-[#D4B896]/30 rounded-full text-[#D4B896] hover:from-[#D4B896]/30 hover:to-[#B69A78]/30 transition-all text-sm disabled:opacity-50"
              >
                Send
              </button>
            </form>

            {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="px-2 py-1 bg-[#D4B896]/10 rounded-full text-xs text-[#D4B896]/80 flex items-center gap-1">
                  <span>{file.name}</span>
                  <button
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                    className="hover:text-[#D4B896]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Voice Interface (Hidden but active) */}
      {isListening && !showChatInterface && (
        <div className="fixed bottom-[-200px] opacity-0 pointer-events-none">
          <SimplifiedOrganicVoice
            onTranscript={handleVoiceTranscript}
            enabled={isListening && !showChatInterface}
            isMaiaSpeaking={isMaiaSpeaking}
          />
        </div>
      )}
    </div>
  );
}