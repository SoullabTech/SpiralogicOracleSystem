'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedVoiceMicButton } from '@/components/ui/EnhancedVoiceMicButton';
import { TranscriptPreview } from '@/components/TranscriptPreview';
import { Mic, MicOff, Send, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { cleanMessage } from '@/lib/cleanMessage';

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
  autoPlayVoice?: boolean;
}

export function ModernOracleInterface({ 
  userId, 
  sessionId, 
  enableDebug = false,
  autoPlayVoice = true
}: ModernOracleInterfaceProps) {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(autoPlayVoice);
  
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
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);

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

  // Clean response text - remove any command artifacts and SSML tags
  const cleanResponseText = (text: string): string => {
    // First apply the comprehensive SSML cleaning
    let cleaned = cleanMessage(text);
    
    // Then remove any additional command patterns that might leak through
    cleaned = cleaned
      .replace(/\$\{[^}]*\}/g, '') // Remove template literals
      .replace(/`[^`]*`/g, '') // Remove backtick strings
      .replace(/\[VOICE\]/gi, '') // Remove debug markers
      .replace(/\[.*?\]/g, '') // Remove all bracketed content
      .replace(/console\.\w+\([^)]*\)/g, '') // Remove console commands
      .replace(/^(run|exec|execute|command:).*/gim, '') // Remove command lines
      .trim();
    
    // Ensure we have meaningful content
    if (!cleaned || cleaned.length < 10) {
      return cleanMessage(text.trim()); // Fallback to just SSML cleaning if too aggressive
    }
    
    return cleaned;
  };

  // Voice recording functions
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await sendToStreamingTranscription(audioBlob);
      };
      
      mediaRecorder.start();
      setVoiceState(prev => ({ ...prev, isListening: true }));
      
      console.log('[VOICE] 🎤 Started listening');
    } catch (error) {
      console.error('[VOICE] ❌ Failed to start recording:', error);
      setVoiceState(prev => ({ ...prev, isListening: false }));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setVoiceState(prev => ({ ...prev, isListening: false }));
      console.log('[VOICE] 🛑 Stopped listening');
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const sendToStreamingTranscription = async (audioBlob: Blob) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      
      console.log('[VOICE] 📡 Sending audio for transcription...');
      
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

  // Play audio response
  const playAudioResponse = async (audioUrl: string, fallbackText?: string) => {
    if (!voiceEnabled) return;
    
    try {
      // Stop any current audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      
      setVoiceState(prev => ({ ...prev, isPlaying: true }));
      
      if (audioUrl && audioUrl !== 'web-speech-fallback') {
        // Use provided audio URL
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        
        audio.onended = () => {
          setVoiceState(prev => ({ ...prev, isPlaying: false }));
          setCurrentAudio(null);
        };
        
        audio.onerror = async () => {
          console.warn('[VOICE] Audio playback failed, trying fallback TTS');
          setVoiceState(prev => ({ ...prev, isPlaying: false }));
          
          // Try Web Speech API fallback
          if (fallbackText && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(fallbackText);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            utterance.onend = () => {
              setVoiceState(prev => ({ ...prev, isPlaying: false }));
            };
            
            window.speechSynthesis.speak(utterance);
          }
        };
        
        await audio.play();
        console.log('[VOICE] 🔊 Playing audio response');
      } else if (fallbackText && 'speechSynthesis' in window) {
        // Use Web Speech API
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          setVoiceState(prev => ({ ...prev, isPlaying: false }));
        };
        
        window.speechSynthesis.speak(utterance);
        console.log('[VOICE] 🗣️ Using Web Speech API');
      }
    } catch (error) {
      console.error('[VOICE] ❌ Audio playback error:', error);
      setVoiceState(prev => ({ ...prev, isPlaying: false }));
    }
  };

  // Stop audio playback
  const stopAudioPlayback = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setVoiceState(prev => ({ ...prev, isPlaying: false }));
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
      
      // Clean the response text
      const cleanedText = cleanResponseText(
        data.data?.message || data.message || 'Sorry, I encountered an issue.'
      );

      const mayaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        text: cleanedText,
        timestamp: new Date(),
        audioUrl: data.data?.audio !== 'web-speech-fallback' ? data.data?.audio : undefined,
        provider: data.data?.ttsProvider || 'fallback'
      };

      setMessages(prev => [...prev, mayaMessage]);

      // Play audio response if available
      if (voiceEnabled) {
        console.log('[VOICE] Audio URL:', mayaMessage.audioUrl);
        console.log('[VOICE] Clean text:', cleanedText);
        
        // Always use Web Speech API fallback for now since ElevenLabs might not be configured
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanedText);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';
          
          // Select a female voice if available
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(voice => 
            voice.name.includes('Female') || 
            voice.name.includes('Samantha') || 
            voice.name.includes('Victoria') ||
            voice.name.includes('Karen') ||
            voice.name.includes('Zira')
          );
          
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
          
          utterance.onend = () => {
            setVoiceState(prev => ({ ...prev, isPlaying: false }));
          };
          
          window.speechSynthesis.speak(utterance);
          console.log('[VOICE] Using Web Speech API for voice synthesis');
        } else {
          console.warn('[VOICE] Web Speech API not available');
        }
      }

      if (debugMode && data.data?.consciousnessProfile) {
        console.log('[DEBUG] Consciousness Profile:', data.data.consciousnessProfile);
      }

    } catch (error) {
      console.error('[ERROR] Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'maya',
        text: "I'm having trouble connecting right now. Let me try to reconnect...",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const toggleVoice = () => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleVoicePlayback = () => {
    setVoiceEnabled(prev => !prev);
    if (voiceState.isPlaying) {
      stopAudioPlayback();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    stopAudioPlayback();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-light">Maya</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.tts === 'healthy' ? 'bg-green-500' : 
              systemStatus.tts === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-white/60">
              {systemStatus.tts === 'healthy' ? 'Connected' : 
               systemStatus.tts === 'degraded' ? 'Limited' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoicePlayback}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled ? 'text-white hover:bg-white/10' : 'text-white/40 hover:bg-white/5'
            }`}
            title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={clearConversation}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`p-2 rounded-lg transition-colors ${
              debugMode ? 'text-purple-400 bg-purple-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle debug mode"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${
                message.role === 'user' 
                  ? 'bg-purple-500/20 text-purple-100' 
                  : 'bg-white/5 text-white/90'
              } rounded-2xl px-4 py-3`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                
                {debugMode && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/40">
                    {message.provider && <div>Provider: {message.provider}</div>}
                    {message.audioUrl && <div>Audio: {message.audioUrl ? 'Yes' : 'No'}</div>}
                    {message.confidence !== undefined && <div>Confidence: {(message.confidence * 100).toFixed(0)}%</div>}
                  </div>
                )}
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
            <div className="bg-white/5 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Voice state indicators */}
        {(voiceState.isListening || voiceState.isProcessing || voiceState.interimTranscript) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl px-4 py-3">
              {voiceState.isListening && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Mic size={16} className="animate-pulse" />
                  <span className="text-sm">Listening...</span>
                </div>
              )}
              {voiceState.isProcessing && (
                <div className="text-sm text-purple-400">Processing audio...</div>
              )}
              {voiceState.interimTranscript && (
                <div className="text-sm text-white/60 italic">{voiceState.interimTranscript}</div>
              )}
            </div>
          </motion.div>
        )}
        
        {voiceState.isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 text-green-400">
                <Volume2 size={16} className="animate-pulse" />
                <span className="text-sm">Speaking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleVoice}
            disabled={voiceState.isProcessing}
            className={`p-3 rounded-full transition-all ${
              voiceState.isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            } ${voiceState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {voiceState.isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or use voice..."
            disabled={isLoading || voiceState.isListening}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 disabled:opacity-50"
          />
          
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        
        {voiceState.finalTranscript && (
          <div className="mt-2 text-sm text-white/60">
            Recognized: "{voiceState.finalTranscript}"
          </div>
        )}
      </div>
    </div>
  );
}