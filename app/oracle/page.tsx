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
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";
import { unlockAudio, addAutoUnlockListeners, isAudioUnlocked } from "@/lib/audio/audioUnlock";
import { speakWithMaya, smartSpeak } from "@/lib/audio/ttsWithFallback";
import { useMayaStream } from "@/hooks/useMayaStream";

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
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agent');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { addToast } = useToast();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [element, setElement] = useState<"air"|"fire"|"water"|"earth"|"aether">("earth");
  
  // Maya streaming integration
  const { text: streamingText, isStreaming, metadata, stream, cancelSpeech } = useMayaStream();
  const currentStreamingMessage = useRef<string | null>(null);
  
  // Voice input functionality with smart endpointing
  const voiceInput = useVoiceInput({
    onResult: (transcript: string, isFinal: boolean) => {
      // Show live transcript as user speaks
      setInputText(transcript);
    },
    onAutoStop: (finalTranscript: string) => {
      console.log('🎤 Auto-stopped with transcript:', finalTranscript);
      setInputText(finalTranscript);
      // Auto-send after a brief delay
      setTimeout(() => {
        if (finalTranscript.trim()) {
          sendMessage();
        }
      }, 300);
    },
    onError: (error: string) => {
      addToast({
        title: 'Voice Input Error',
        description: error,
        variant: 'error',
        duration: 4000
      });
    },
    continuous: true,  // Enable continuous mode for smart endpointing
    interimResults: true,
    language: localStorage.getItem('mayaLang') || 'en-US',
    silenceTimeoutMs: 1200,  // 1.2s silence detection
    minSpeechLengthChars: 3  // Minimum 3 chars to trigger auto-send
  });
  
  // Update streaming message as text arrives
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
  
  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && currentStreamingMessage.current) {
      currentStreamingMessage.current = null;
    }
  }, [isStreaming]);
  
  useEffect(() => {
    // Load preferences from localStorage
    const savedAutoSpeak = localStorage.getItem('maya-auto-speak');
    const savedVoiceResponses = localStorage.getItem('maya-voice-responses');
    if (savedAutoSpeak) setAutoSpeak(JSON.parse(savedAutoSpeak));
    if (savedVoiceResponses) setVoiceResponses(JSON.parse(savedVoiceResponses));
    
    // Set up audio unlock listeners for autoplay policy
    addAutoUnlockListeners();
  }, []);

  useEffect(() => {
    // Save auto-speak preference
    localStorage.setItem('maya-auto-speak', JSON.stringify(autoSpeak));
  }, [autoSpeak]);

  useEffect(() => {
    // Save voice responses preference
    localStorage.setItem('maya-voice-responses', JSON.stringify(voiceResponses));
  }, [voiceResponses]);

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

  // Keyboard accessibility for voice input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space to toggle mic (when input is not focused)
      if (event.code === 'Space' && event.target !== document.querySelector('input')) {
        event.preventDefault();
        toggleVoiceRecording();
      }
      
      // Escape to cancel recording
      if (event.code === 'Escape' && voiceInput.isRecording) {
        event.preventDefault();
        voiceInput.stopRecording();
        voiceInput.resetTranscript();
        setInputText('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [voiceInput.isRecording]);

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
      setConnectionStatus('connecting');
      
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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
      stream(
        {
          backendUrl,
          element,
          userId: "web-user",
          voiceEnabled: voiceResponses && autoSpeak,
          lang: "en-US"
        },
        currentInput
      );
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Streaming error:', error);
      setConnectionStatus('disconnected');
      
      addToast({
        title: 'Network Error',
        description: 'Please check your connection and try again',
        variant: 'error'
      });
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

  const toggleVoiceRecording = async () => {
    if (voiceInput.isRecording) {
      voiceInput.stopRecording();
    } else {
      // Unlock audio on first voice interaction
      if (!isAudioUnlocked()) {
        await unlockAudio();
      }
      voiceInput.startRecording();
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
          
          {/* Maya Voice Controls & Element Selection */}
          <div className="flex-1 flex justify-center max-w-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => mayaVoice.speak('Hello, I am Maya, your mystical oracle guide.')}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                title="Hear Maya"
              >
                <Play className="w-4 h-4" />
              </button>
              
              {/* Element Selection */}
              <div className="flex gap-1">
                {['air', 'fire', 'water', 'earth', 'aether'].map(el => (
                  <button
                    key={el}
                    onClick={() => setElement(el as any)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      element === el 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={`${el} element ${el === 'air' ? '(Claude)' : ''}`}
                  >
                    {el}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceResponses}
                    onChange={(e) => setVoiceResponses(e.target.checked)}
                    className="rounded"
                  />
                  Voice responses
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeak}
                    onChange={(e) => setAutoSpeak(e.target.checked)}
                    className="rounded"
                    disabled={!voiceResponses}
                  />
                  Auto-play
                </label>
              </div>
              {voiceInput.isSupported && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Voice ready</span>
                  </div>
                  {voiceInput.isRecording && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span>Local processing</span>
                    </div>
                  )}
                </div>
              )}
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
          
          {isStreaming && (
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
                  <span className="text-xs text-muted-foreground">Maya is speaking...</span>
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
              onClick={toggleVoiceRecording}
              disabled={!voiceInput.isSupported || isStreaming}
              className={`p-3 rounded-full transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                voiceInput.isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-110' 
                  : voiceInput.isSupported 
                    ? 'text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 active:scale-95'
                    : 'text-gray-500 cursor-not-allowed opacity-50'
              }`}
              title={
                !voiceInput.isSupported 
                  ? 'Voice input not supported in this browser'
                  : voiceInput.isRecording 
                    ? 'Recording... (tap to stop or wait for silence)'
                    : 'Tap to start voice input (Space key also works)'
              }
              aria-label={
                voiceInput.isRecording 
                  ? 'Stop voice recording' 
                  : 'Start voice recording'
              }
            >
              {voiceInput.isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !voiceInput.isRecording && !isStreaming && sendMessage()}
                placeholder={
                  voiceInput.isRecording 
                    ? "🎤 Listening... speak now (or press Esc to cancel)"
                    : voiceInput.transcript && !voiceInput.isRecording
                      ? "Voice transcription complete - press Enter or click Send"
                      : "Type a message, click mic, or press Space to speak..."
                }
                className={`bg-background/50 border-purple-500/20 focus:border-purple-400 pr-12 ${
                  voiceInput.isRecording ? 'border-red-400 shadow-sm shadow-red-500/20' : ''
                }`}
                disabled={isStreaming}
                aria-label="Chat input"
                aria-describedby="voice-status"
              />
              {voiceInput.isRecording && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
              
              {/* Privacy indicator */}
              {voiceInput.isRecording && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-orange-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  <span>Local</span>
                </div>
              )}
            </div>
            
            {/* Screen reader announcements */}
            <div 
              id="voice-status"
              className="sr-only" 
              aria-live="polite" 
              aria-atomic="true"
            >
              {voiceInput.isRecording 
                ? "Voice recording active. Speak your message or press Escape to cancel."
                : voiceInput.transcript 
                  ? "Voice input complete. Message ready to send."
                  : ""
              }
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!inputText.trim() || isStreaming}
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