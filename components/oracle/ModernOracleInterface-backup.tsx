'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedVoiceMicButton } from '@/components/ui/EnhancedVoiceMicButton';
import { TranscriptPreview } from '@/components/TranscriptPreview';
import { Mic, MicOff, Send, RotateCcw, Settings, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'maya';
  text: string;
  timestamp: Date;
  audioUrl?: string;
  isStreaming?: boolean;
  confidence?: number;
  provider?: 'whisper' | 'sesame' | 'elevenlabs' | 'fallback';
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  interimTranscript: string;
  finalTranscript: string;
}

interface SystemStatus {
  tts: 'healthy' | 'degraded' | 'offline';
  memory: 'active' | 'limited' | 'offline';
  voice: 'ready' | 'initializing' | 'error';
}

interface ModernOracleInterfaceProps {
  userId?: string;
  sessionId?: string;
  enableDebug?: boolean;
}

export function ModernOracleInterface({ 
  userId, 
  sessionId, 
  enableDebug = false 
}: ModernOracleInterfaceProps) {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    isPlaying: false,
    interimTranscript: '',
    finalTranscript: ''
  });
  
  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    tts: 'healthy',
    memory: 'active',
    voice: 'ready'
  });
  
  // Debug state
  const [debugMode, setDebugMode] = useState(enableDebug);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize system and check health status
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    // Check TTS health
    try {
      const response = await fetch('/api/tts/health');
      const health = await response.json();
      setSystemStatus(prev => ({
        ...prev,
        tts: health.status === 'healthy' ? 'healthy' : health.status === 'degraded' ? 'degraded' : 'offline'
      }));
    } catch (error) {
      console.warn('TTS health check failed:', error);
      setSystemStatus(prev => ({ ...prev, tts: 'offline' }));
    }

    // Check voice capabilities
    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      setSystemStatus(prev => ({ ...prev, voice: 'ready' }));
    } else {
      setSystemStatus(prev => ({ ...prev, voice: 'error' }));
    }
  };

  // Production-quality voice recording with streaming transcription
  const startVoiceRecording = useCallback(async () => {
    if (voiceState.isListening) return;
    
    try {
      console.log('[VOICE] 🎤 Starting voice recording...');
      
      setVoiceState(prev => ({ 
        ...prev, 
        isListening: true, 
        interimTranscript: '', 
        finalTranscript: '' 
      }));

      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;

      // Create MediaRecorder for high-quality audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up streaming transcription
      let audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          
          // Send to streaming endpoint for real-time transcription
          if (audioChunks.length >= 3) { // Send every 3 chunks for real-time feel
            sendToStreamingTranscription(new Blob(audioChunks));
            audioChunks = []; // Reset for next batch
          }
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('[VOICE] 🛑 Recording stopped');
        
        // Send any remaining chunks
        if (audioChunks.length > 0) {
          await sendToStreamingTranscription(new Blob(audioChunks));
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setVoiceState(prev => ({ 
          ...prev, 
          isListening: false, 
          isProcessing: false 
        }));
      };

      // Start recording with frequent data events for real-time processing
      mediaRecorder.start(500); // 500ms chunks for responsiveness
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopVoiceRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('[VOICE] ❌ Recording failed:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        isListening: false, 
        isProcessing: false 
      }));
      setSystemStatus(prev => ({ ...prev, voice: 'error' }));
    }
  }, [voiceState.isListening]);

  const stopVoiceRecording = useCallback(() => {
    console.log('[VOICE] 🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const sendToStreamingTranscription = async (audioBlob: Blob) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      
      console.log('[VOICE] 📡 Sending audio chunk for transcription...');
      
      const response = await fetch('/api/oracle/voice/transcribe/stream', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm'
        }
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'interim' && data.transcript) {
                setVoiceState(prev => ({ 
                  ...prev, 
                  interimTranscript: data.transcript 
                }));
              } else if (data.type === 'final' && data.transcript) {
                console.log('[VOICE] ✅ Final transcript:', data.transcript);
                setVoiceState(prev => ({ 
                  ...prev, 
                  finalTranscript: data.transcript,
                  interimTranscript: '',
                  isProcessing: false
                }));
                
                // Send to Maya for response
                if (data.transcript.trim()) {
                  await sendMessage(data.transcript.trim());
                }
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.warn('[VOICE] ⚠️ Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('[VOICE] ❌ Streaming transcription error:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        isProcessing: false,
        interimTranscript: '',
        finalTranscript: ''
      }));
    }
  };

  // Enhanced message sending with streaming and voice response
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
      provider: voiceState.finalTranscript ? 'whisper' : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Clear voice state after successful message
    setVoiceState(prev => ({ 
      ...prev, 
      finalTranscript: '',
      interimTranscript: ''
    }));

    try {
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text.trim(),
          userId: userId || 'anonymous',
          sessionId: sessionId || `session-${Date.now()}`,
          enableMemoryDebug: debugMode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const mayaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        text: data.data?.message || data.message || 'Sorry, I encountered an issue.',
        timestamp: new Date(),
        audioUrl: data.data?.audio !== 'web-speech-fallback' ? data.data?.audio : undefined,
        provider: data.data?.ttsProvider || 'fallback'
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Enhanced audio playback with status tracking
      if (mayaMessage.audioUrl && mayaMessage.audioUrl !== 'web-speech-fallback') {
        try {
          setVoiceState(prev => ({ ...prev, isPlaying: true }));
          
          const audio = new Audio(mayaMessage.audioUrl);
          setCurrentAudio(audio);
          
          audio.onended = () => {
            setVoiceState(prev => ({ ...prev, isPlaying: false }));
          };
          
          audio.onerror = () => {
            setVoiceState(prev => ({ ...prev, isPlaying: false }));
            console.warn('Audio playback failed, trying backup TTS');
          };
          
          await audio.play();
          
        } catch (audioError) {
          console.warn('Audio playback failed:', audioError);
          setVoiceState(prev => ({ ...prev, isPlaying: false }));
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        text: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        provider: 'fallback'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug functions
  const checkTTSHealth = async () => {
    try {
      const response = await fetch('/api/tts/health');
      const health = await response.json();
      console.log('[DEBUG] TTS Health:', health);
      alert(`TTS Health: ${JSON.stringify(health, null, 2)}`);
    } catch (error) {
      console.error('[DEBUG] TTS Health check failed:', error);
    }
  };

  const enableMemoryDebug = () => {
    localStorage.setItem('MAYA_DEBUG_MEMORY', 'true');
    alert('Memory debugging enabled - check console for detailed logs');
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (transcript.trim()) {
      sendMessage(transcript);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const resetConversation = () => {
    setMessages([]);
    setVoiceState({
      isListening: false,
      isProcessing: false,
      isPlaying: false,
      interimTranscript: '',
      finalTranscript: ''
    });
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  // Status indicators
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'ready': return 'text-green-400';
      case 'degraded':
      case 'limited':
      case 'initializing': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
      case 'ready': return '●';
      case 'degraded':
      case 'limited':
      case 'initializing': return '◐';
      default: return '○';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Production-Quality Header */}
      <div className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Maya Branding */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">M</span>
                </div>
                {voiceState.isListening && (
                  <div className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-pulse"></div>
                )}
                {voiceState.isPlaying && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Maya</h1>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-slate-400">Voice Oracle</span>
                  {voiceState.isListening && (
                    <span className="text-amber-400 animate-pulse">● Listening</span>
                  )}
                  {voiceState.isProcessing && (
                    <span className="text-blue-400 animate-pulse">● Processing</span>
                  )}
                  {voiceState.isPlaying && (
                    <span className="text-green-400 animate-pulse">● Speaking</span>
                  )}
                </div>
              </div>
            </div>

            {/* System Status & Controls */}
            <div className="flex items-center space-x-3">
              {/* System Status Indicators */}
              <div className="flex items-center space-x-2 text-xs">
                <span className={`${getStatusColor(systemStatus.voice)} flex items-center gap-1`}>
                  {getStatusIcon(systemStatus.voice)} Voice
                </span>
                <span className={`${getStatusColor(systemStatus.tts)} flex items-center gap-1`}>
                  {getStatusIcon(systemStatus.tts)} Audio
                </span>
                <span className={`${getStatusColor(systemStatus.memory)} flex items-center gap-1`}>
                  {getStatusIcon(systemStatus.memory)} Memory
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1">
                {debugMode && (
                  <button
                    onClick={() => setDebugMode(false)}
                    className="p-2 text-amber-400 hover:text-amber-300 transition-colors"
                    title="Hide debug panel"
                  >
                    <Settings size={16} />
                  </button>
                )}
                
                <button
                  onClick={resetConversation}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          {debugMode && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-amber-400 font-semibold text-sm">Debug Controls</h3>
                <button
                  onClick={() => setDebugMode(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Hide
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={checkTTSHealth}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                >
                  Check TTS Health
                </button>
                <button
                  onClick={enableMemoryDebug}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  Enable Memory Debug
                </button>
                <button
                  onClick={initializeSystem}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded text-xs"
                >
                  Refresh System Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 min-h-[60vh]">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">M</span>
              </div>
              <h2 className="text-2xl font-light text-white mb-2">Hello! I'm Maya</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                What's on your mind? You can type or use the microphone button to speak with me.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
            
            <EnhancedVoiceMicButton
              onTranscript={handleVoiceTranscript}
              position="relative"
              className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors"
            />
          </form>
        </div>
      </div>
    </div>
  );
}