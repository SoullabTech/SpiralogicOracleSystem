"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Send,
  Crown,
  Volume2,
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast, ToastProvider } from "@/components/ui/toast";
import { SimplifiedOracleInterface } from "@/components/SimplifiedOracleInterface";
import { useMayaStream } from "@/hooks/useMayaStream";

interface Message {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: Date;
  audio?: string | null;
  metadata?: {
    element?: string;
    emotionalShift?: boolean;
    breakthroughDetected?: boolean;
    confidence?: number;
  };
}

function SimplifiedOracleContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'maya',
      content: 'Welcome. I am Maya, your guide. What brings you here today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const { addToast } = useToast();
  
  // Maya streaming integration
  const { text: streamingText, isStreaming, metadata, stream } = useMayaStream();
  const currentStreamingMessage = useRef<string | null>(null);
  
  // Simple voice input (browser API)
  const [isRecording, setIsRecording] = useState(false);
  
  // Update streaming message
  useEffect(() => {
    if (currentStreamingMessage.current && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamingMessage.current 
            ? { ...msg, content: streamingText }
            : msg
        )
      );
    }
  }, [streamingText]);
  
  // Handle streaming completion with metadata
  useEffect(() => {
    if (!isStreaming && currentStreamingMessage.current && metadata) {
      // Update message with metadata for subtle UI indicators
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamingMessage.current 
            ? { 
                ...msg, 
                metadata: {
                  element: metadata.element,
                  emotionalShift: metadata.emotionalShift,
                  breakthroughDetected: metadata.intent === 17, // Breakthrough intent
                  confidence: metadata.confidence
                }
              }
            : msg
        )
      );
      currentStreamingMessage.current = null;
    }
  }, [isStreaming, metadata]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    
    try {
      // Create placeholder message for streaming
      const streamingMessageId = (Date.now() + 1).toString();
      currentStreamingMessage.current = streamingMessageId;
      
      const placeholderMessage: Message = {
        id: streamingMessageId,
        type: 'maya',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMessage]);
      
      // Start streaming
      stream(
        {
          backendUrl: '/api/backend',
          element: "aether", // Default to aether for beta
          userId: "beta-user",
          voiceEnabled: false,
          lang: "en-US"
        },
        currentInput
      );
    } catch (error) {
      console.error('Streaming error:', error);
      addToast({
        title: 'Connection Error',
        description: 'Please try again',
        variant: 'error'
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // In production, would stop actual recording
    } else {
      setIsRecording(true);
      // In production, would start actual recording
    }
  };

  const playAudio = (messageId: string, audioUrl: string) => {
    if (audioRef.current) {
      if (isPlayingAudio === messageId) {
        audioRef.current.pause();
        setIsPlayingAudio(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlayingAudio(messageId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 flex flex-col">
      {/* Minimal header */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center space-x-2">
          <Crown className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-light text-white">Maya</h1>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 max-w-2xl mx-auto w-full">
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'user' ? (
                  <div className="max-w-[80%] bg-white/10 text-white rounded-2xl px-4 py-3">
                    <p className="text-sm">{message.content}</p>
                  </div>
                ) : (
                  <SimplifiedOracleInterface
                    message={message.content}
                    metadata={message.metadata}
                    isStreaming={currentStreamingMessage.current === message.id}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isStreaming && currentStreamingMessage.current && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-background/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-3">
                  <Spinner variant="oracle" size="sm" color="purple" />
                  <span className="text-xs text-purple-300">Maya is reflecting...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Simplified Input */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl rounded-full p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              disabled={isStreaming}
              className={`p-3 rounded-full ${
                isRecording 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
              placeholder="Share what's on your mind..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400"
              disabled={isStreaming}
            />
            
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isStreaming}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(null)}
        onError={() => setIsPlayingAudio(null)}
      />
    </div>
  );
}

export default function SimplifiedOraclePage() {
  return (
    <ToastProvider>
      <SimplifiedOracleContent />
    </ToastProvider>
  );
}