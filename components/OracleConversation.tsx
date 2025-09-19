// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import AdaptiveVoiceMicButton from './ui/AdaptiveVoiceMicButton';
import MayaChatInterface from './chat/MayaChatInterface';
import { EmergencyChatInterface } from './ui/EmergencyChatInterface';
import { SimpleVoiceMic } from './ui/SimpleVoiceMic';
import { OrganicVoiceMaya } from './ui/OrganicVoiceMaya';
import { VoiceActivatedMaya as SimplifiedOrganicVoice, VoiceActivatedMayaRef } from './ui/VoiceActivatedMayaFixed';
import { AgentCustomizer } from './oracle/AgentCustomizer';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { cleanMessage, cleanMessageForVoice, formatMessageForDisplay } from '@/lib/cleanMessage';
import { getAgentConfig, AgentConfig } from '@/lib/agent-config';
import { toast } from 'react-hot-toast';

interface OracleConversationProps {
  userId?: string;
  sessionId: string;
  initialCheckIns?: Record<string, number>;
  showAnalytics?: boolean;
  voiceEnabled?: boolean;
  onMessageAdded?: (message: ConversationMessage) => void;
  onSessionEnd?: (reason?: string) => void;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'oracle';
  text: string;
  timestamp: Date;
  facetId?: string;
  motionState?: MotionState;
  coherenceLevel?: number;
}

// Component to format messages with stage directions as italics
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  // Replace stage directions (*text*) with styled spans
  const parts = text.split(/(\*[^*]+\*)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          // Stage direction - render as italic and slightly faded
          const direction = part.slice(1, -1); // Remove asterisks
          return (
            <span key={index} className="italic opacity-70 text-purple-300">
              {direction}
            </span>
          );
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export const OracleConversation: React.FC<OracleConversationProps> = ({
  userId,
  sessionId,
  initialCheckIns = {},
  showAnalytics = false,
  voiceEnabled = true,
  onMessageAdded,
  onSessionEnd
}) => {
  // Maya Voice Integration
  const { speak: mayaSpeak, voiceState: mayaVoiceState, isReady: mayaReady } = useMayaVoice();

  // Responsive holoflower size
  const [holoflowerSize, setHoloflowerSize] = useState(400);
  
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setHoloflowerSize(Math.min(width - 64, 350)); // Mobile
      } else if (width < 1024) {
        setHoloflowerSize(400); // Tablet
      } else {
        setHoloflowerSize(500); // Desktop
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Core state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, number>>(initialCheckIns);
  const [activeFacetId, setActiveFacetId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Motion states
  const [currentMotionState, setCurrentMotionState] = useState<MotionState>('idle');
  const [coherenceLevel, setCoherenceLevel] = useState(0.5);
  const [coherenceShift, setCoherenceShift] = useState<CoherenceShift>('stable');
  const [shadowPetals, setShadowPetals] = useState<string[]>([]);
  const [showBreakthrough, setShowBreakthrough] = useState(false);
  
  // Voice states
  const [userVoiceState, setUserVoiceState] = useState<VoiceState | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [streamingText, setStreamingText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMicrophonePaused, setIsMicrophonePaused] = useState(false);
  const voiceMicRef = useRef<VoiceActivatedMayaRef>(null);
  
  // Agent configuration with persistence
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() => {
    // Load saved voice preference from localStorage
    if (typeof window !== 'undefined') {
      const savedVoice = localStorage.getItem('selected_voice');
      const config = getAgentConfig(savedVoice || undefined);
      return config;
    }
    return getAgentConfig();
  });
  
  // UI states
  const [showChatInterface, setShowChatInterface] = useState(true); // Default to chat interface for better UX
  const [showCaptions, setShowCaptions] = useState(false); // Default to no captions in voice mode
  const [showCustomizer, setShowCustomizer] = useState(false); // Settings panel
  const [audioEnabled, setAudioEnabled] = useState(false); // Track if user has enabled audio
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Conversation context
  const contextRef = useRef<ConversationContext>({
    sessionId,
    userId,
    checkIns,
    previousResponses: [],
    coherenceHistory: [],
    currentMotionState: 'idle'
  });

  // Global state reset function for emergency recovery
  const resetAllStates = useCallback(() => {
    console.log('🔄 Emergency state reset triggered');
    setIsProcessing(false);
    setIsResponding(false);
    setIsAudioPlaying(false);
    setIsStreaming(false);
    setIsMicrophonePaused(false);
    setCurrentMotionState('idle');
    setStreamingText('');

    // EMERGENCY: Disabled voice mic resume since component is disabled
    // setTimeout(() => {
    //   if (voiceMicRef.current?.startListening && !showChatInterface) {
    //     voiceMicRef.current.startListening();
    //   }
    // }, 1000);
  }, [showChatInterface]);

  // Auto-recovery timer - if processing states are stuck for too long, reset
  useEffect(() => {
    if (isProcessing || isResponding) {
      const recoveryTimer = setTimeout(() => {
        if (isProcessing || isResponding) {
          console.warn('⚠️ States stuck for >30s - auto-recovery triggered');
          resetAllStates();
        }
      }, 30000); // 30 second recovery timeout

      return () => clearTimeout(recoveryTimer);
    }
  }, [isProcessing, isResponding, resetAllStates]);

  // Sync local audio state with Maya voice state to prevent conflicts
  useEffect(() => {
    if (mayaVoiceState?.isPlaying !== isAudioPlaying) {
      setIsAudioPlaying(mayaVoiceState?.isPlaying || false);
    }
    if (mayaVoiceState?.isPlaying !== isResponding) {
      setIsResponding(mayaVoiceState?.isPlaying || false);
    }
  }, [mayaVoiceState?.isPlaying, isAudioPlaying, isResponding]);

  // Update motion state based on voice activity
  useEffect(() => {
    if (userVoiceState?.isSpeaking) {
      setCurrentMotionState('listening');
      setIsListening(true);

      // Map voice amplitude to petal breathing
      const breathingIntensity = userVoiceState.amplitude;
      // This will be picked up by the Holoflower's motion orchestrator
    } else {
      setIsListening(false);
    }
  }, [userVoiceState]);

  // Helper function to map element to facet ID (using SPIRALOGIC_FACETS IDs)
  const mapElementToFacetId = (element: string): string => {
    const elementToFacetMap: { [key: string]: string } = {
      'air': 'air-1',
      'fire': 'fire-1', 
      'water': 'water-1',
      'earth': 'earth-1',
      'aether': 'earth-1' // Default to earth for aether
    };
    return elementToFacetMap[element] || 'earth-1';
  };

  // Enable audio on user interaction
  const enableAudio = useCallback(async () => {
    if (!audioEnabled) {
      console.log('🔊 Enabling audio context on user interaction');

      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🎵 Audio context resumed, state:', audioContextRef.current.state);
      }

      // Play silent audio to unlock
      const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silentAudio.volume = 0.001;
      silentAudio.play().catch(() => {});

      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  // Stream text word by word as Maya speaks
  const streamText = useCallback(async (fullText: string, messageId: string) => {
    const words = fullText.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      // Update the specific message with streaming text
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: currentText }
          : msg
      ));
      
      // Adjust delay based on word length for natural pacing
      const delay = Math.max(50, Math.min(150, words[i].length * 20));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setIsStreaming(false);
  }, []);

  // Handle text messages from chat interface - MUST be defined before handleVoiceTranscript
  const handleTextMessage = useCallback(async (text: string, attachments?: File[]) => {
    console.log('📝 Text message received:', { text, isProcessing, isAudioPlaying, isResponding });

    // Prevent multiple processing
    if (isProcessing) {
      console.log('⚠️ Text message blocked - already processing');
      return;
    }

    // Process attachments first if any
    let messageText = text;
    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(', ');
      messageText = `${text}\n\n[Files attached: ${fileNames}]`;
    }

    const startTime = Date.now();
    const cleanedText = cleanMessage(messageText);

    // Add user message immediately
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: cleanedText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onMessageAdded?.(userMessage);

    // Set processing state for text chat
    setIsProcessing(true);
    setCurrentMotionState('processing');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for text

      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: cleanedText,
          userId: userId || 'anonymous',
          sessionId,
          agentName: agentConfig.name,
          agentVoice: agentConfig.voice,
          context: {
            previousInteractions: messages.length,
            inputType: 'text', // Mark as text input
            userPreferences: {
              voice: {
                enabled: false, // Disable voice for text responses
                autoSpeak: false,
                agentConfig
              }
            }
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const apiTime = Date.now() - startTime;
      console.log(`⏱️ Text API response received in ${apiTime}ms`);

      const oracleResponse = responseData.data || responseData;
      let responseText = oracleResponse.message || oracleResponse.content || oracleResponse.text || oracleResponse.response || 'Tell me your truth.';
      responseText = cleanMessage(responseText);

      const element = oracleResponse.element || 'aether';
      const facetId = mapElementToFacetId(element);
      setActiveFacetId(facetId);
      setCoherenceLevel(oracleResponse.confidence || 0.85);

      // Add oracle message with full text immediately for text chat
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        text: responseText,
        timestamp: new Date(),
        facetId: element,
        motionState: 'responding',
        coherenceLevel: oracleResponse.confidence || 0.85
      };
      setMessages(prev => [...prev, oracleMessage]);
      onMessageAdded?.(oracleMessage);

      // Play audio response with Maya's voice
      if (voiceEnabled && mayaReady && mayaSpeak) {
        console.log('🔊 Maya speaking response');
        // Set speaking state for visual feedback
        setIsResponding(true);
        setIsAudioPlaying(true);

        // Speak the response
        await mayaSpeak(responseText);

        // Wait for voice to completely finish before resetting states
        // This prevents microphone from resuming too early
        setTimeout(() => {
          setIsResponding(false);
          setIsAudioPlaying(false);
          console.log('🔇 Maya finished speaking, states reset');
        }, 3000); // Increased delay to ensure audio is completely done
      }

      // Update context
      contextRef.current.previousResponses.push({
        text: responseText,
        primaryFacetId: element,
        element,
        voiceCharacteristics: oracleResponse.voiceCharacteristics,
        confidence: oracleResponse.confidence
      });
      contextRef.current.coherenceHistory.push(oracleResponse.confidence || 0.85);

    } catch (error) {
      console.error('Text chat API error:', error);

      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'oracle',
        text: 'I apologize, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        motionState: 'idle'
      };
      setMessages(prev => [...prev, errorMessage]);
      onMessageAdded?.(errorMessage);
    } finally {
      // Always reset processing state for text chat
      console.log('📝 Text processing complete - resetting states');
      setIsProcessing(false);
      setIsResponding(false);
      setCurrentMotionState('idle');
    }
  }, [isProcessing, isAudioPlaying, isResponding, sessionId, userId, onMessageAdded, agentConfig, messages.length, showChatInterface]);

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    console.log('🎤 handleVoiceTranscript called with:', transcript);
    const t = transcript?.trim();
    if (!t) {
      console.log('⚠️ Empty transcript, returning');
      return;
    }

    console.log('🎯 Voice transcript received:', t);
    console.log('📊 Current states:', { isProcessing, isResponding, isAudioPlaying });
    console.log('📞 Calling handleTextMessage...');

    try {
      // Route all voice through text message handler for reliability
      await handleTextMessage(t);
      console.log('✅ handleTextMessage completed');
    } catch (error) {
      console.error('❌ Error in handleTextMessage:', error);
      // Reset states on error
      setIsProcessing(false);
      setIsResponding(false);
    }
  }, [handleTextMessage, isProcessing, isResponding, isAudioPlaying]);

  // Clear all check-ins
  const clearCheckIns = useCallback(() => {
    setCheckIns({});
    contextRef.current.checkIns = {};
  }, []);

  // Download conversation transcript
  const downloadTranscript = useCallback(() => {
    // Create a formatted transcript with markdown
    const header = `# Conversation with ${agentConfig.name}\n`;
    const date = `Date: ${new Date().toLocaleString()}\n`;
    const sessionInfo = `Session ID: ${sessionId}\n`;
    const separator = `${'='.repeat(50)}\n\n`;

    const transcript = messages.map(msg => {
      const timestamp = msg.timestamp?.toLocaleString() || '';
      const speaker = msg.role === 'user' ? '**You**' : `**${agentConfig.name}**`;
      return `### ${speaker}\n*${timestamp}*\n\n${msg.text}\n`;
    }).join('\n---\n\n');

    const fullContent = header + date + sessionInfo + separator + transcript;

    // Save as markdown file
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${agentConfig.name}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, agentConfig.name, sessionId]);

  // Voice synthesis for text chat
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | undefined>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeakMessage = useCallback(async (text: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setCurrentlySpeakingId(messageId);

      // Clean text for voice
      const cleanText = cleanMessageForVoice(text);

      // Call ElevenLabs API to synthesize voice
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceId: agentConfig.voice?.voiceId || 'Xb7hH8MSUJpSbSDYk0k2', // Maya's default voice
          modelId: 'eleven_turbo_v2_5',
          stability: 0.75,
          similarityBoost: 0.85
        })
      });

      if (!response.ok) {
        throw new Error('Voice synthesis failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setCurrentlySpeakingId(undefined);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error('Error speaking message:', error);
      toast.error('Failed to speak message');
      setCurrentlySpeakingId(undefined);
    }
  }, [agentConfig.voice]);

  const handleStopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlySpeakingId(undefined);
  }, []);

  return (
    <div className="oracle-conversation min-h-screen bg-[#1a1f2e] overflow-hidden">
      {/* Agent Customizer - Orbital position */}
      <AgentCustomizer 
        position="top-right"
        onConfigChange={(config) => {
          setAgentConfig(config);
          // Save voice preference to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('selected_voice', config.name);
            // Cancel any playing audio when voice changes
            if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
          }
          // Refresh conversation with new agent
          console.log('Agent changed to:', config.name);
        }}
      />

      {/* Beautiful Sacred Holoflower - Responsive sizing */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        {/* Adjusted container to shift light up and left */}
        <div className="flex items-center justify-center"
             style={{
               width: holoflowerSize,
               height: holoflowerSize,
               transform: 'translate(-20px, -30px)' /* Shift left and up */
             }}>
          {/* Non-interactive Sacred Holoflower with animations */}
          <SacredHoloflower
            size={holoflowerSize}
            interactive={false}
            showLabels={false}
            motionState={currentMotionState}
            coherenceLevel={coherenceLevel}
            coherenceShift={coherenceShift}
            isListening={isListening}
            isProcessing={isProcessing}
            isResponding={isResponding}
            showBreakthrough={showBreakthrough}
          />
          
          {/* Central Holoflower Logo with Glow and Sparkles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Radiant glow behind the holoflower - ENHANCED */}
            <motion.div
              className="absolute flex items-center justify-center"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-48 h-48 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 184, 150, 1) 0%, rgba(212, 184, 150, 0.7) 30%, rgba(212, 184, 150, 0.3) 60%, transparent 100%)',
                  filter: 'blur(30px)',
                  transform: 'translate(0, 0)' /* Center the main glow */
                }}
              />
            </motion.div>
            
            {/* Secondary outer glow layer for extra radiance */}
            <motion.div
              className="absolute flex items-center justify-center"
              animate={{
                scale: [1.2, 1.6, 1.2],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div
                className="w-64 h-64 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(212, 184, 150, 0.6) 0%, rgba(212, 184, 150, 0.2) 50%, transparent 100%)',
                  filter: 'blur(40px)',
                  transform: 'translate(0, 0)' /* Center the secondary glow */
                }}
              />
            </motion.div>

            {/* Sparkles emanating from center - ULTRA SLOW & EPHEMERAL */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Main radial sparkles - slower drift */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-0.5 h-0.5 bg-white/80 rounded-full"
                  style={{
                    filter: 'blur(0.5px)'
                  }}
                  animate={{
                    x: [0, Math.cos(i * Math.PI / 6) * 100],
                    y: [0, Math.sin(i * Math.PI / 6) * 100],
                    opacity: [0, 0.7, 0.3, 0],
                    scale: [0, 1.2, 0.8, 0]
                  }}
                  transition={{
                    duration: 10 + Math.random() * 5, // 10-15 seconds
                    repeat: Infinity,
                    delay: i * 1.5 + Math.random() * 5, // Very sporadic
                    ease: "easeInOut",
                    repeatDelay: Math.random() * 5 // Long pauses
                  }}
                />
              ))}
              
              {/* Spiraling sparkles - dreamy drift */}
              {[...Array(16)].map((_, i) => {
                const angle = (i * Math.PI * 2) / 16;
                const spiralRotation = i * 30;
                const randomDuration = 12 + Math.random() * 6; // 12-18 seconds
                const randomDelay = Math.random() * 10; // 0-10 second random delay
                return (
                  <motion.div
                    key={`sparkle-spiral-${i}`}
                    className="absolute w-0.5 h-0.5 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,200,0.9) 0%, transparent 70%)',
                      filter: 'blur(0.3px)'
                    }}
                    animate={{
                      x: [
                        0,
                        Math.cos(angle) * 20,
                        Math.cos(angle + 0.5) * 50,
                        Math.cos(angle + 1) * 80,
                        Math.cos(angle + 1.5) * 100
                      ],
                      y: [
                        0,
                        Math.sin(angle) * 20,
                        Math.sin(angle + 0.5) * 50,
                        Math.sin(angle + 1) * 80,
                        Math.sin(angle + 1.5) * 100
                      ],
                      opacity: [0, 0.6, 0.4, 0.2, 0],
                      scale: [0, 1, 0.8, 0.5, 0],
                      rotate: [0, spiralRotation]
                    }}
                    transition={{
                      duration: randomDuration,
                      repeat: Infinity,
                      delay: randomDelay + i * 0.5,
                      ease: "easeInOut",
                      repeatDelay: Math.random() * 8 // Very long pauses
                    }}
                  />
                );
              })}
              
              {/* Tiny twinkling sparkles - ultra gentle */}
              {[...Array(25)].map((_, i) => (
                <motion.div
                  key={`sparkle-tiny-${i}`}
                  className="absolute w-px h-px rounded-full"
                  style={{
                    left: `${35 + Math.random() * 30}%`,
                    top: `${35 + Math.random() * 30}%`,
                    background: 'white',
                    boxShadow: '0 0 2px rgba(255,255,255,0.5)'
                  }}
                  animate={{
                    opacity: [0, 0, Math.random() * 0.6 + 0.2, 0, 0],
                    scale: [0, 0, Math.random() + 0.5, 0, 0],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 7, // 8-15 seconds
                    repeat: Infinity,
                    delay: Math.random() * 15, // 0-15 second random start
                    ease: "easeInOut",
                    repeatDelay: Math.random() * 10, // Very long pauses between twinkles
                    times: [0, 0.3, 0.5, 0.7, 1] // Quick twinkle in the middle
                  }}
                />
              ))}
            </div>

            {/* The holoflower logo itself - Clickable for voice input */}
            <motion.button
              onClick={() => {
                if (!showChatInterface && voiceMicRef.current) {
                  voiceMicRef.current.toggleListening();
                  enableAudio();
                }
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{
                scale: !showChatInterface ? 1.1 : 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{
                scale: !showChatInterface ? 0.95 : 1,
                transition: { duration: 0.1 }
              }}
              className={`relative z-10 rounded-full p-4 transition-all duration-300 ${
                !showChatInterface && voiceEnabled
                  ? 'cursor-pointer hover:bg-white/5 active:bg-white/10'
                  : 'cursor-default'
              }`}
              disabled={showChatInterface || !voiceEnabled}
              style={{ zIndex: 10 }}
            >
              <Image
                src="/holoflower.svg"
                alt="Spiralogic Holoflower - Click to speak"
                width={80}
                height={80}
                className={`object-contain transition-opacity duration-300 ${
                  !showChatInterface && voiceEnabled
                    ? 'opacity-80 hover:opacity-100'
                    : 'opacity-80'
                }`}
                priority
              />

              {/* Voice state indicator ring around holoflower */}
              {!showChatInterface && voiceEnabled && voiceMicRef.current?.isListening && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#D4B896]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Shadow petal overlay */}
      {shadowPetals.length > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ width: 400, height: 400 }}>
            {shadowPetals.map(petalId => (
              <div
                key={petalId}
                className="absolute inset-0 bg-black/20 rounded-full"
                style={{
                  clipPath: `polygon(50% 50%, ${Math.random() * 100}% 0%, ${Math.random() * 100}% 100%)`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Message flow - Only show in chat mode or when captions enabled */}
      {(showChatInterface || showCaptions) && (
        <div className="fixed md:right-8 md:top-1/2 md:transform md:-translate-y-1/2 md:w-96
                        bottom-20 sm:bottom-0 left-0 right-0 md:left-auto md:bottom-auto
                        max-h-[30vh] sm:max-h-[40vh] md:max-h-[70vh] overflow-y-auto
                        bg-black/60 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none
                        rounded-t-3xl md:rounded-none p-4 md:p-0">
          <AnimatePresence>
            {messages.length > 0 && (
            <div className="space-y-3">
              {messages.slice(-5).map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-black/40 md:bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4 text-white border ${
                    message.role === 'user' 
                      ? 'border-blue-500/20' 
                      : 'border-purple-500/20'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-60">
                    {message.role === 'user' ? 'You' : agentConfig.name}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.role === 'oracle' ? (
                      <FormattedMessage text={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Chat Interface or Voice Mic */}
      {voiceEnabled && (
        <>
          {/* Mode Toggle - TESTING DEPLOYMENT 1:05AM */}
          <div className="fixed top-4 left-4 flex gap-2 z-50" title="DEPLOYMENT TEST 1:05AM - If you see this, it's working!" style={{border: '2px solid red'}}>
            <button
              onClick={() => {
                setShowChatInterface(false);
                enableAudio();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-sm max-w-[70px] max-h-[32px] ${
                !showChatInterface
                  ? 'bg-[#D4B896]/90 text-white border border-[#D4B896]/30'
                  : 'bg-black/20 text-white/60 hover:bg-black/30 border border-white/10'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => {
                setShowChatInterface(true);
                enableAudio();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-sm max-w-[70px] max-h-[32px] ${
                showChatInterface
                  ? 'bg-[#64748b]/90 text-white border border-[#64748b]/30'
                  : 'bg-black/20 text-white/60 hover:bg-black/30 border border-white/10'
              }`}
            >
              Chat
            </button>
          </div>

          {showChatInterface ? (
            /* Maya Chat Interface - Full voice and text support */
            <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
              <MayaChatInterface
                onSendMessage={handleTextMessage}
                isProcessing={isProcessing}
                voiceEnabled={voiceEnabled}
                messages={messages}
              />
            </div>
          ) : (
            /* Simplified Organic Voice - No visual mic, just voice logic */
            <SimplifiedOrganicVoice
              ref={voiceMicRef}
              onTranscript={handleVoiceTranscript}
              isProcessing={isProcessing}
              enabled={!isAudioPlaying && !isResponding && !mayaVoiceState?.isPlaying}
              isMayaSpeaking={isResponding || isAudioPlaying || mayaVoiceState?.isPlaying}
              mayaVoiceState={mayaVoiceState}
            />
          )}
        </>
      )}


      {/* Voice Mode Controls */}
      {!showChatInterface && (
        <div className="fixed bottom-24 right-4 flex flex-col gap-2">
          {/* Download Transcript Button */}
          <button
            onClick={downloadTranscript}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full
                       hover:bg-white/20 transition-all duration-300 border border-white/20"
            title="Download conversation"
            disabled={messages.length === 0}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* CC/Transcript Toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full
                       hover:bg-white/20 transition-all duration-300 border border-white/20"
            title={showCaptions ? "Hide transcript" : "Show transcript"}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showCaptions ? (
                // CC On icon
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              ) : (
                // CC Off icon
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              )}
            </svg>
          </button>
        </div>
      )}


      {/* Analytics toggle */}
      {showAnalytics && (
        <div className="fixed top-8 right-8">
          <button
            className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full
                       hover:bg-white/20 transition-colors"
          >
            Analytics →
          </button>
        </div>
      )}


      {/* Voice state visualization (development) */}
      {process.env.NODE_ENV === 'development' && userVoiceState && (
        <div className="fixed top-8 left-8 bg-black/80 text-white text-xs p-3 rounded-lg">
          <div className="font-bold mb-2">Voice State</div>
          <div>Amplitude: {(userVoiceState.amplitude * 100).toFixed(0)}%</div>
          <div>Emotion: {userVoiceState.emotion}</div>
          <div>Breath: {(userVoiceState.breathDepth * 100).toFixed(0)}%</div>
          <div>Speaking: {userVoiceState.isSpeaking ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default OracleConversation;
