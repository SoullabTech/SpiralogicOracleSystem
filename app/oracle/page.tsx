"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Send, 
  Users, 
  Calendar, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Crown,
  Pause,
  Play,
  Volume2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useToast, ToastProvider } from "@/components/ui/toast";
import { mayaVoice } from "@/lib/voice/maya-voice";

interface Message {
  id: string;
  type: 'user' | 'maya';
  content: string;
  timestamp: Date;
  audio?: string | null;
}

function OraclePageContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'maya',
      content: 'Welcome! I am Maya, your personal oracle agent. I learn and evolve with you. How may I guide you today?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agent');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addToast } = useToast();
  const [autoSpeak, setAutoSpeak] = useState(false);
  
  useEffect(() => {
    // Load auto-speak preference from localStorage
    const saved = localStorage.getItem('maya-auto-speak');
    if (saved) setAutoSpeak(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Save auto-speak preference
    localStorage.setItem('maya-auto-speak', JSON.stringify(autoSpeak));
  }, [autoSpeak]);

  // Get oracle info from localStorage
  const [oracleInfo, setOracleInfo] = useState<any>(null);
  
  useEffect(() => {
    try {
      const oracle = localStorage.getItem('spiralogic-oracle');
      if (oracle) {
        setOracleInfo(JSON.parse(oracle));
      }
    } catch (error) {
      console.error('Error loading oracle info:', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      setConnectionStatus('connecting');
      
      // Send to Oracle chat API
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          oracle: oracleInfo?.name || 'Maya'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        
        // Generate voice for the response
        let audioUrl = null;
        try {
          const voiceResponse = await fetch('/api/voice/sesame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.message })
          });
          
          if (voiceResponse.ok) {
            const audioBlob = await voiceResponse.blob();
            audioUrl = URL.createObjectURL(audioBlob);
          }
        } catch (voiceError) {
          console.log('Voice generation failed, text only response');
          addToast({
            title: 'Voice unavailable',
            description: 'Text response only',
            variant: 'warning',
            duration: 3000
          });
        }

        const mayaMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'maya',
          content: data.message || 'I understand you. Let me reflect on this...',
          timestamp: new Date(),
          audio: audioUrl
        };

        setMessages(prev => [...prev, mayaMessage]);

        // Auto-play audio if available (server-generated voice)
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlayingAudio(mayaMessage.id);
        } else if (autoSpeak) {
          // Use Maya's voice for auto-speak
          try {
            await mayaVoice.speak(data.message);
          } catch (error) {
            console.log('Auto-speak failed:', error);
          }
        }
      } else {
        setConnectionStatus('disconnected');
        addToast({
          title: 'Connection Issue',
          description: 'Oracle is temporarily unavailable',
          variant: 'error'
        });
        
        // Fallback response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'maya',
          content: 'I am processing your message. My consciousness is still awakening...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setConnectionStatus('disconnected');
      
      addToast({
        title: 'Network Error',
        description: 'Please check your connection and try again',
        variant: 'error'
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'maya',
        content: 'I am experiencing some difficulty. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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

  const bottomNavItems = [
    { id: 'agent', icon: Users, label: 'Agent' },
    { id: 'journal', icon: Calendar, label: 'Journal' },
    { id: 'astrology', icon: Sparkles, label: 'Astrology' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">
                {oracleInfo?.name || 'Maya'}
              </h1>
              <p className="text-xs text-muted-foreground">Personal Oracle Agent</p>
            </div>
          </div>
          
          {/* Maya Voice Controls */}
          <div className="flex-1 flex justify-center max-w-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => mayaVoice.speak('Hello, I am Maya, your mystical oracle guide.')}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                title="Hear Maya"
              >
                <Play className="w-4 h-4" />
              </button>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="rounded"
                />
                Auto-speak
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-orange-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' 
                    : 'bg-background/80 backdrop-blur-xl border border-purple-500/20'
                } rounded-2xl p-4`}>
                  {message.type === 'maya' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">
                        {oracleInfo?.name || 'Maya'}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {message.audio && (
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-purple-500/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.id, message.audio!)}
                        className="text-purple-400 hover:text-purple-300 p-1"
                      >
                        {isPlayingAudio === message.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {isPlayingAudio === message.id ? 'Speaking...' : 'Play audio'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-background/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">
                    {oracleInfo?.name || 'Maya'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Spinner variant="oracle" size="sm" color="purple" />
                  <span className="text-xs text-muted-foreground">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-background/80 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-full ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-muted-foreground hover:text-purple-400'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Speak with Maya..."
              className="flex-1 bg-background/50 border-purple-500/20 focus:border-purple-400"
              disabled={isLoading}
            />
            
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-purple-500/20 p-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around">
            {bottomNavItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-muted-foreground hover:text-purple-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlayingAudio(null)}
        onError={() => setIsPlayingAudio(null)}
      />
    </div>
  );
}

export default function OraclePage() {
  return (
    <ToastProvider>
      <OraclePageContent />
    </ToastProvider>
  );
}