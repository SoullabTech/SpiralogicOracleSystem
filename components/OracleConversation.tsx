// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import AdaptiveVoiceMicButton from './ui/AdaptiveVoiceMicButton';
import MayaChatInterface from './chat/MayaChatInterface';
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
  const voiceMicRef = useRef<any>(null);
  
  // Agent configuration
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(getAgentConfig());
  
  // UI states
  const [showChatInterface, setShowChatInterface] = useState(true); // Default to chat interface for better UX
  const [showCaptions, setShowCaptions] = useState(false); // Default to no captions in voice mode
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

    // Resume microphone if needed
    setTimeout(() => {
      if (voiceMicRef.current?.startListening && !showChatInterface) {
        voiceMicRef.current.startListening();
      }
    }, 1000);
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
  const enableAudio = useCallback(() => {
    if (!audioEnabled) {
      console.log('🔊 Enabling audio context on user interaction');

      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('🎵 Audio context resumed in enableAudio');
        });
      }

      // Play silent audio to unlock
      const silentAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k9j1mVQdBh1qs+3yvmwhBSxy0PDbmzMGGWS/7+OXLgcPVqzn77VjHAU7k');
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

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    // If we're in text chat mode, handle voice input differently
    if (showChatInterface) {
      console.log('🎤 Voice input in text chat mode:', transcript);
      // Simply send the voice transcript as a text message
      await handleTextMessage(transcript);
      return;
    }

    // Original voice-only mode handling
    const startTime = Date.now();
    console.log('⏱️ Voice processing started');
    console.log('Current states:', { isProcessing, isAudioPlaying, isResponding });

    // Force reset if stuck - enhanced safety checks
    if (isProcessing && !isResponding && !isAudioPlaying) {
      const timeSinceStart = Date.now() - startTime;
      if (timeSinceStart > 5000) { // If stuck for more than 5 seconds
        console.warn('⚠️ Processing stuck for >5s - forcing complete reset');
        setIsProcessing(false);
        setIsResponding(false);
        setIsAudioPlaying(false);
        setIsMicrophonePaused(false);
        setIsStreaming(false);
        setCurrentMotionState('idle');
      }
    }

    // Debounce rapid calls
    if (isProcessing || isAudioPlaying) {
      console.log('⚠️ Ignoring voice transcript - processing or audio playing');
      return;
    }

    // Stop microphone immediately to prevent multiple inputs
    console.log('🛑 Stopping microphone to process user input');
    if (voiceMicRef.current?.stopListening) {
      voiceMicRef.current.stopListening();
    }
    setIsMicrophonePaused(true);

    // Clean the transcript of any artifacts
    const cleanedTranscript = cleanMessage(transcript);
    
    // Add user message immediately for responsiveness
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: cleanedTranscript,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onMessageAdded?.(userMessage);
    
    // Set processing state
    setIsProcessing(true);
    setCurrentMotionState('processing');
    
    // Call Oracle API with timeout for better performance
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: cleanedTranscript,
          userId: userId || 'anonymous',
          sessionId,
          agentName: agentConfig.name,
          agentVoice: agentConfig.voice,
          context: {
            previousInteractions: messages.length,
            userPreferences: {
              voice: {
                enabled: voiceEnabled,
                autoSpeak: true,
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
      console.log(`⏱️ API response received in ${apiTime}ms`);

      // Handle PersonalOracleAgent response format
      const oracleResponse = responseData.data || responseData;
      let responseText = oracleResponse.message || 'I am here with you.';

      // Clean any voice command artifacts from the response text
      responseText = cleanMessage(responseText);

      // Use the element and voice characteristics from PersonalOracleAgent
      const element = oracleResponse.element || 'aether';
      const voiceCharacteristics = oracleResponse.voiceCharacteristics;

      // Fix audio URL access - it's in the data object
      const audioUrl = responseData.data?.audio || oracleResponse.audio; // Audio URL from ElevenLabs generation

      console.log('🎤 Audio response details:', {
        hasAudio: !!audioUrl,
        audioType: audioUrl === 'web-speech-fallback' ? 'fallback' : 'elevenlabs',
        audioLength: audioUrl ? audioUrl.length : 0,
        inputSource: showChatInterface ? 'text' : 'voice',
        totalTime: `${(Date.now() - startTime) / 1000}s`,
        audioUrl: audioUrl ? audioUrl.substring(0, 50) + '...' : 'null',
        oracleResponse: Object.keys(oracleResponse)
      });
      
      // Map element to facet for holoflower visualization
      const facetId = mapElementToFacetId(element);
      setActiveFacetId(facetId);
      setCurrentMotionState('responding');
      setCoherenceLevel(oracleResponse.confidence || 0.85);
      
      // Add oracle message with empty text initially
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        text: '',  // Start with empty text
        timestamp: new Date(),
        facetId: element,
        motionState: 'responding',
        coherenceLevel: oracleResponse.confidence || 0.85
      };
      setMessages(prev => [...prev, oracleMessage]);
      onMessageAdded?.(oracleMessage);
      
      // DON'T start streaming yet - wait for audio to begin
      
      // Update context
      contextRef.current.previousResponses.push({
        text: responseText,
        primaryFacetId: element,
        element,
        voiceCharacteristics,
        confidence: oracleResponse.confidence
      });
      contextRef.current.coherenceHistory.push(oracleResponse.confidence || 0.85);
      
      // Set responding state
      setIsResponding(true);
      setCurrentMotionState('responding');
      
      // Safety timeout to ensure processing state is reset
      // Only apply for voice mode, not text chat
      let safetyTimeout: NodeJS.Timeout | null = null;
      if (!showChatInterface && voiceEnabled) {
        safetyTimeout = setTimeout(() => {
          console.warn('⚠️ Voice processing stuck, forcing reset after 15 seconds');
          resetAllStates();
        }, 15000);
      }

      // Play Maya's voice response - use backend audio if available
      if (voiceEnabled && mayaReady) {
        if (audioUrl && audioUrl !== 'web-speech-fallback') {
          // Play the Sesame-generated audio directly
          try {
            console.log('🎵 Attempting to play audio, length:', audioUrl.length);
            console.log('🎵 Audio URL preview:', audioUrl.substring(0, 100) + '...');

            // Validate data URL format
            if (audioUrl.startsWith('data:audio/mpeg;base64,')) {
              const base64Part = audioUrl.substring(23);
              console.log('📊 Base64 audio size:', base64Part.length, 'characters');

              // Check if base64 is valid
              try {
                atob(base64Part.substring(0, 100)); // Test decode first 100 chars
                console.log('✅ Base64 format appears valid');
              } catch (e) {
                console.error('❌ Invalid base64 encoding:', e);
              }
            }

            const audio = new Audio(audioUrl);
            audio.volume = 0.8;

            // Set audio to muted initially to bypass autoplay restrictions
            // Will unmute after user interaction
            if (!document.hasFocus() || !window.navigator.userActivation?.hasBeenActive) {
              console.log('⚠️ No user interaction yet, muting audio initially');
              audio.muted = true;
            }

            // Stop listening while audio plays to prevent feedback loop
            console.log('🔇 Stopping mic for audio playback');
            setIsAudioPlaying(true);
            setIsMicrophonePaused(true);
            if (voiceMicRef.current?.stopListening) {
              voiceMicRef.current.stopListening();
            }

            // Add error handler BEFORE attempting to play
            audio.addEventListener('error', (e) => {
              console.error('❌ Audio error event:', e);
              const audioError = e.target as HTMLAudioElement;
              console.error('Audio error details:', {
                error: audioError.error,
                src: audioError.src?.substring(0, 100),
                readyState: audioError.readyState,
                networkState: audioError.networkState
              });
              console.log('🔄 Resetting states after audio error');
              setIsAudioPlaying(false);
              setIsMicrophonePaused(false);
              setIsProcessing(false);
              setIsResponding(false);
              setIsStreaming(false);
              setCurrentMotionState('listening');

              // Stream text as fallback
              setIsStreaming(true);
              setStreamingText('');
              streamText(responseText, oracleMessage.id);
            });

            // Add loadeddata event to ensure audio is ready
            audio.addEventListener('loadeddata', () => {
              console.log('🔊 Audio loaded, stopping mic completely');
              setIsAudioPlaying(true); // Ensure it's set
            });
            
            // Start streaming text when audio begins playing
            audio.addEventListener('play', () => {
              console.log('🔊 Audio playing, mic should be stopped');
              setIsAudioPlaying(true); // Double ensure
              setIsStreaming(true);
              setStreamingText('');
              streamText(responseText, oracleMessage.id);
            });
            
            audio.addEventListener('ended', () => {
              console.log('🔊 Audio ended event fired, resetting all states');
              if (safetyTimeout) clearTimeout(safetyTimeout); // Clear safety timeout if exists
              setIsAudioPlaying(false);
              setIsResponding(false);
              setIsStreaming(false);
              setIsMicrophonePaused(false);
              setCurrentMotionState('listening');
              setIsProcessing(false);
              console.log('✅ Audio ended - processing state reset to false');
              
              // Simple resume with shorter delay
              setTimeout(() => {
                console.log('🎤 Resuming microphone after audio ended');
                if (voiceMicRef.current?.startListening) {
                  voiceMicRef.current.startListening();
                }
              }, 1000);
            });
            
            // Attempt to play audio with better error handling
            console.log('🔊 Attempting to play ElevenLabs audio');

            // Only play audio if enabled and ensure user interaction
            if (audioEnabled) {
              // Try to enable audio context first
              if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume().then(() => {
                  console.log('🔊 Audio context resumed');
                });
              }

              audio.play()
                .then(() => {
                  console.log('✅ Audio playback started');
                  setIsAudioPlaying(true);
                  setIsResponding(false);
                  setIsProcessing(false);
                  // The audio.addEventListener('ended') above handles microphone resume
                  console.log('🎤 Audio playback started, ended handler is set');
                })
                .catch(error => {
                  console.error('❌ Audio playback failed:', error);
                  if (error.name === 'NotAllowedError') {
                    console.log('⚠️ Audio still blocked - need genuine user gesture');
                    setAudioEnabled(false);
                    // Try to play a click sound to unlock audio
                    const unlockAudio = () => {
                      const silent = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAABAAEAAgABAAIAAwACAQADAAQAAwAEAAUABAAFAAAGAAUABgAFAAYABQAGAQcEBgEHAwcBCAMHAQgBCAEIAAAJBQgACQEIAQkBCAEJAQgBCQQI');
                      silent.volume = 0;
                      silent.play();
                    };
                    document.addEventListener('click', unlockAudio, { once: true });
                    document.addEventListener('touchstart', unlockAudio, { once: true });
                  }

                  // Reset all states immediately
                setIsAudioPlaying(false);
                setIsMicrophonePaused(false);
                setIsProcessing(false);
                setIsResponding(false);

                // Start streaming text immediately for fallback
                setIsStreaming(true);
                setStreamingText('');
                streamText(responseText, oracleMessage.id);

                // Use Web Speech API as fallback
                if (voiceEnabled && mayaReady) {
                  console.log('🔊 Using Web Speech API as fallback');
                  mayaSpeak(cleanMessageForVoice(responseText), {
                    element,
                    tone: voiceCharacteristics?.tone,
                    masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
                  }).then(() => {
                    // Resume mic after speech
                    if (voiceMicRef.current?.startListening) {
                      voiceMicRef.current.startListening();
                    }
                    setIsMicrophonePaused(false);
                  });
                } else {
                  // Just resume mic if no voice available
                  setTimeout(() => {
                    console.log('🎤 Resuming microphone after failure');
                    if (voiceMicRef.current?.startListening) {
                      voiceMicRef.current.startListening();
                    }
                    setIsMicrophonePaused(false);
                  }, 500);
                }
              });
            } else {
              // Audio not enabled - show text response immediately
              console.log('🔇 Audio not enabled - showing text only');
              setIsStreaming(true);
              setStreamingText('');
              streamText(responseText, oracleMessage.id);

              // Reset states
              setIsAudioPlaying(false);
              setIsMicrophonePaused(false);
              setIsProcessing(false);
              setIsResponding(false);

              // Resume microphone for next input
              setTimeout(() => {
                if (voiceMicRef.current?.startListening) {
                  voiceMicRef.current.startListening();
                }
              }, 500);
            }
          } catch (error) {
            console.error('Audio creation failed:', error);
            // Start streaming text immediately for fallback
            setIsStreaming(true);
            setStreamingText('');
            streamText(responseText, oracleMessage.id);
            // Fallback to Maya voice synthesis - clean stage directions
            mayaSpeak(cleanMessageForVoice(responseText), {
              element,
              tone: voiceCharacteristics?.tone,
              masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
            });
          }
        } else {
          // Use Maya voice synthesis with element characteristics - clean stage directions
          console.log('🔊 Using Web Speech API');
          setIsAudioPlaying(true);
          setIsMicrophonePaused(true);
          if (voiceMicRef.current?.stopListening) {
            voiceMicRef.current.stopListening();
          }
          
          // Start streaming text when voice begins
          setIsStreaming(true);
          setStreamingText('');
          streamText(responseText, oracleMessage.id);
          
          mayaSpeak(cleanMessageForVoice(responseText), {
            element,
            tone: voiceCharacteristics?.tone,
            masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
          }).then(() => {
            console.log('🔊 Web Speech ended');
            setIsAudioPlaying(false);
            setIsResponding(false);
            setIsStreaming(false);
            setIsMicrophonePaused(false);
            setCurrentMotionState('listening');
            setIsProcessing(false);
            
            // Simple resume after Web Speech
            setTimeout(() => {
              console.log('🎤 Resuming microphone after Web Speech');
              if (voiceMicRef.current?.startListening) {
                voiceMicRef.current.startListening();
              }
            }, 1000);
          }).catch(error => {
            console.error('Maya voice failed:', error);
            setIsAudioPlaying(false);
            setIsStreaming(false);
            setIsMicrophonePaused(false);
            setIsProcessing(false);
            
            // Resume mic even on error
            setTimeout(() => {
              console.log('🎤 Resuming microphone after voice error');
              if (voiceMicRef.current?.startListening) {
                voiceMicRef.current.startListening();
              }
            }, 1000);
          });
        }
      } else {
        // No voice - show text immediately
        setIsStreaming(true);
        setStreamingText('');
        await streamText(responseText, oracleMessage.id);
        setIsResponding(false);
        setCurrentMotionState('listening');
      }
      
    } catch (error) {
      console.error('Oracle API error:', error);
      
      // Add an error message to the conversation
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
      // Always reset processing state for voice
      console.log('🎤 Voice processing complete - resetting states');
      setIsProcessing(false);
      setIsResponding(false);
      setIsAudioPlaying(false);
      setIsMicrophonePaused(false);

      // Return to idle quickly
      setTimeout(() => {
        setCurrentMotionState('idle');
      }, 500);
    }
  }, [isProcessing, sessionId, userId, voiceEnabled, onMessageAdded, mayaReady, mayaSpeak]);

  // Handle text messages from chat interface
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
      let responseText = oracleResponse.message || 'I am here with you.';
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
  }, [isProcessing, isAudioPlaying, isResponding, sessionId, userId, onMessageAdded, agentConfig, messages.length, showChatInterface, handleTextMessage]);

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
    <div className="oracle-conversation min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black overflow-hidden">
      {/* Agent Customizer - Orbital position */}
      <AgentCustomizer 
        position="top-right"
        onConfigChange={(config) => {
          setAgentConfig(config);
          // Refresh conversation with new agent
          console.log('Agent changed to:', config.name);
        }}
      />

      {/* Beautiful Sacred Holoflower - Responsive sizing */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center justify-center" style={{ width: holoflowerSize, height: holoflowerSize }}>
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
                  filter: 'blur(30px)'
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
                  filter: 'blur(40px)'
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

            {/* The holoflower logo itself */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ zIndex: 10 }}
            >
              <Image
                src="/holoflower.svg"
                alt="Spiralogic Holoflower"
                width={80}
                height={80}
                className="object-contain opacity-80"
                priority
              />
            </motion.div>
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
                        bottom-0 left-0 right-0 md:left-auto md:bottom-auto
                        max-h-[40vh] md:max-h-[70vh] overflow-y-auto
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
          {/* Mode Toggle - Mobile positioned */}
          <div className="fixed top-4 md:top-8 left-4 md:left-8 flex gap-2 z-40">
            <button
              onClick={() => {
                setShowChatInterface(false);
                enableAudio();
              }}
              className={`px-2 md:px-3 py-1 rounded-full text-xs transition-colors ${
                !showChatInterface
                  ? 'bg-[#D4B896] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => {
                setShowChatInterface(true);
                enableAudio();
              }}
              className={`px-2 md:px-3 py-1 rounded-full text-xs transition-colors ${
                showChatInterface
                  ? 'bg-[#D4B896] text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Chat
            </button>
          </div>

          {showChatInterface ? (
            /* Text Chat Interface - Mobile optimized */
            <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
              <MayaChatInterface
                onSendMessage={handleTextMessage}
                onVoiceTranscript={handleVoiceTranscript}
                onSpeakMessage={handleSpeakMessage}
                onStopSpeaking={handleStopSpeaking}
                messages={messages.map(msg => ({
                  id: msg.id,
                  role: msg.role === 'oracle' ? 'maya' : 'user',
                  text: msg.text,
                  timestamp: msg.timestamp
                }))}
                agentName={agentConfig.name}
                isProcessing={isProcessing}
                disabled={isProcessing}
                currentlySpeakingId={currentlySpeakingId}
              />
            </div>
          ) : (
            /* Voice-Only Interface - Adaptive for intimate conversations */
            <AdaptiveVoiceMicButton
              ref={voiceMicRef}
              onVoiceStateChange={setUserVoiceState}
              onTranscript={handleVoiceTranscript}
              position="bottom-center"
              conversationMode="intimate"  // Thoughtful, unhurried conversation
              pauseListening={isAudioPlaying}
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

      {/* Session Controls - Mobile optimized */}
      <div className="fixed top-4 md:top-8 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-4 z-50">
        {/* Download button for all modes */}
        {messages.length > 0 && (
          <button
            onClick={downloadTranscript}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm rounded-full
                       hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center gap-2"
            title="Download conversation transcript"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden md:inline">Download</span>
          </button>
        )}

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to end this conversation?')) {
              onSessionEnd?.('user_ended');
              window.location.href = '/';
            }
          }}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm text-white text-xs md:text-sm rounded-full
                     hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          End Conversation
        </button>
        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-green-500/20 backdrop-blur-sm text-green-300 text-xs md:text-sm rounded-full
                        border border-green-500/30 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Session Active
        </div>
      </div>

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