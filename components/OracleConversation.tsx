// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X } from 'lucide-react';
import { SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/SimplifiedOrganicVoice';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import AdaptiveVoiceMicButton from './ui/AdaptiveVoiceMicButton';
// import MaiaChatInterface from './chat/MaiaChatInterface'; // File doesn't exist
import { EmergencyChatInterface } from './ui/EmergencyChatInterface';
import { SimpleVoiceMic } from './ui/SimpleVoiceMic';
import { OrganicVoiceMaia } from './ui/OrganicVoiceMaia';
// import { VoiceActivatedMaia as SimplifiedOrganicVoice, VoiceActivatedMaiaRef } from './ui/VoiceActivatedMaiaFixed'; // File doesn't exist
import { AgentCustomizer } from './oracle/AgentCustomizer';
import { MaiaSettingsPanel } from './MaiaSettingsPanel';
import { QuickSettingsButton } from './QuickSettingsButton';
import { SoulprintMetricsWidget } from './SoulprintMetricsWidget';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';
import { useMaiaVoice } from '@/hooks/useMaiaVoice';
import { cleanMessage, cleanMessageForVoice, formatMessageForDisplay } from '@/lib/cleanMessage';
import { getAgentConfig, AgentConfig } from '@/lib/agent-config';
import { toast } from 'react-hot-toast';
import { trackEvent } from '@/lib/analytics/track';

interface OracleConversationProps {
  userId?: string;
  userName?: string;
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

// Component to clean messages by removing stage directions
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  // Remove ALL stage directions and tone markers
  const cleanedText = text
    .replace(/\*[^*]*\*/g, '') // Remove single asterisk content
    .replace(/\*\*[^*]*\*\*/g, '') // Remove double asterisk content
    .replace(/\*{1,}[^*]+\*{1,}/g, '') // Remove any asterisk-wrapped content
    .replace(/\([^)]*\)/gi, '') // Remove ALL parenthetical content
    .replace(/\[[^\]]*\]/g, '') // Remove bracketed content
    .replace(/\{[^}]*\}/g, '') // Remove content in curly braces
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .replace(/^\s*[,;.]\s*/, '') // Remove leading punctuation
    .trim();

  return <span>{cleanedText}</span>;
};

export const OracleConversation: React.FC<OracleConversationProps> = ({
  userId,
  userName,
  sessionId,
  initialCheckIns = {},
  showAnalytics = false,
  voiceEnabled = true,
  onMessageAdded,
  onSessionEnd
}) => {
  // Maia Voice Integration - Initialize immediately for Voice mode
  const { speak: maiaSpeak, voiceState: maiaVoiceState, isReady: maiaReady } = useMaiaVoice();

  // This effect will be moved after state declarations to avoid hoisting issues

  // Responsive holoflower size
  const [holoflowerSize, setHoloflowerSize] = useState(400);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Motion states
  const [currentMotionState, setCurrentMotionState] = useState<MotionState>('idle');
  const [voiceAudioLevel, setVoiceAudioLevel] = useState(0);
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
  const [isMuted, setIsMuted] = useState(false); // Start unmuted in voice mode for immediate use
  const voiceMicRef = useRef<VoiceActivatedMaiaRef>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [maiaResponseText, setMaiaResponseText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Client-side only check
  useEffect(() => {
    setIsMounted(true);
    trackEvent.newSession(userId || 'anonymous', sessionId);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
  const [showCaptions, setShowCaptions] = useState(true); // Show text by default in voice mode
  const [showVoiceText, setShowVoiceText] = useState(true); // Toggle for showing text in voice mode
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [enableVoiceInChat, setEnableVoiceInChat] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Keyboard shortcut for settings (Cmd/Ctrl + ,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettingsPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize voice when in voice mode
  useEffect(() => {
    if (!showChatInterface && voiceEnabled && !isMuted) {
      // Delay to ensure component is ready
      const timer = setTimeout(async () => {
        if (voiceMicRef.current?.startListening && !isProcessing && !isResponding) {
          await voiceMicRef.current.startListening();
          console.log('🎤 Voice auto-started in voice mode');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showChatInterface, voiceEnabled, isMuted, isProcessing, isResponding]);
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

  // Sync local audio state with Maia voice state to prevent conflicts
  useEffect(() => {
    if (maiaVoiceState?.isPlaying !== isAudioPlaying) {
      setIsAudioPlaying(maiaVoiceState?.isPlaying || false);
    }
    if (maiaVoiceState?.isPlaying !== isResponding) {
      setIsResponding(maiaVoiceState?.isPlaying || false);
    }
  }, [maiaVoiceState?.isPlaying]);

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
      if (!audioContextRef.current && typeof window !== 'undefined') {
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

  // Stream text word by word as Maia speaks
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

    // IMMEDIATELY mute microphone to prevent Maia from hearing herself
    if (voiceMicRef.current && voiceMicRef.current.muteImmediately) {
      voiceMicRef.current.muteImmediately();
      console.log('🔇 PREEMPTIVE MUTE: Microphone disabled before processing');
    }

    // Prevent multiple processing - comprehensive guard
    if (isProcessing || isResponding || isAudioPlaying) {
      console.log('⚠️ Text message blocked - already processing/responding', {
        isProcessing,
        isResponding,
        isAudioPlaying
      });
      return;
    }

    // Process attachments first if any
    let messageText = text;
    let fileContents: string[] = [];

    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(', ');
      messageText = `${text}\n\n[Files attached: ${fileNames}]`;

      // Read text-based file contents
      for (const file of attachments) {
        if (file.type.startsWith('text/') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.md') ||
            file.name.endsWith('.json') ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.py') ||
            file.name.endsWith('.js') ||
            file.name.endsWith('.jsx') ||
            file.name.endsWith('.ts') ||
            file.name.endsWith('.tsx')) {
          try {
            const content = await file.text();
            fileContents.push(`\n\nFile: ${file.name}\n${content}`);
          } catch (err) {
            console.error(`Failed to read file ${file.name}:`, err);
          }
        }
      }

      if (fileContents.length > 0) {
        messageText += fileContents.join('');
      }
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
      const timeoutId = setTimeout(() => controller.abort(), 60000); // UNLEASHED: 60 second timeout for longer conversations

      const response = await fetch('/api/oracle/personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: cleanedText,
          userId: userId || 'anonymous',
          userName: userName,
          sessionId,
          agentName: agentConfig.name,
          agentVoice: agentConfig.voice,
          attachments: attachments ? attachments.map(f => ({
            name: f.name,
            type: f.type,
            size: f.size
          })) : undefined,
          preferences: {
            previousInteractions: messages.length,
            inputType: 'text',
            hasAttachments: attachments && attachments.length > 0,
            userPreferences: {
              voice: {
                enabled: false,
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
      trackEvent.apiCall('/api/oracle/personal', apiTime, true);

      const oracleResponse = responseData.data || responseData;
      let responseText = oracleResponse.message || oracleResponse.content || oracleResponse.text || oracleResponse.response || 'Tell me your truth.';
      responseText = cleanMessage(responseText);

      const element = oracleResponse.element || 'aether';
      const facetId = mapElementToFacetId(element);
      setActiveFacetId(facetId);
      setCoherenceLevel(oracleResponse.confidence || 0.85);

      // Create oracle message
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        text: responseText,
        timestamp: new Date(),
        facetId: element,
        motionState: 'responding',
        coherenceLevel: oracleResponse.confidence || 0.85
      };

      // In Chat mode, add message immediately
      // In Voice mode, delay text until after speaking
      const isInVoiceMode = !showChatInterface;

      if (!isInVoiceMode) {
        // Chat mode - show text immediately
        setMessages(prev => [...prev, oracleMessage]);
        onMessageAdded?.(oracleMessage);
      }

      // Play audio response with Maia's voice - ALWAYS in voice mode
      const shouldSpeak = !showChatInterface || (showChatInterface && voiceEnabled && maiaReady && enableVoiceInChat);

      console.log('🎤 Voice response check:', {
        shouldSpeak,
        showChatInterface,
        voiceEnabled,
        maiaReady,
        hasMaiaSpeak: !!maiaSpeak
      });

      if (shouldSpeak && maiaSpeak) {
        console.log('🔊 Maia speaking response in', showChatInterface ? 'Chat' : 'Voice', 'mode');
        const ttsStartTime = Date.now();
        trackEvent.ttsSpoken(userId || 'anonymous', responseText.length, 0);
        // Set speaking state for visual feedback
        setIsResponding(true);
        setIsAudioPlaying(true);
        setMaiaResponseText(responseText); // Update display text

        // Clean the response for voice - remove stage directions and markup
        const cleanVoiceText = cleanMessageForVoice(responseText);
        console.log('🧹 Cleaned for voice:', cleanVoiceText);

        try {
          // Start speaking immediately
          const startSpeakTime = Date.now();
          console.log('⏱️ Starting speech at:', startSpeakTime);

          // Speak the cleaned response with timeout protection
          const speakPromise = maiaSpeak(cleanVoiceText);

          // Add timeout to prevent infinite hanging (15 seconds max for better UX)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Speech timeout after 15s')), 15000);
          });

          await Promise.race([speakPromise, timeoutPromise]);

          const speakDuration = Date.now() - startSpeakTime;
          console.log(`🔇 Maia finished speaking after ${speakDuration}ms`);

          // In Voice mode, show text after speaking completes
          if (isInVoiceMode && showVoiceText) {
            setMessages(prev => [...prev, oracleMessage]);
            onMessageAdded?.(oracleMessage);
          }
        } catch (error) {
          console.error('❌ Speech error or timeout:', error);
          // Show text even if speech fails in Voice mode
          if (isInVoiceMode) {
            setMessages(prev => [...prev, oracleMessage]);
            onMessageAdded?.(oracleMessage);
          }
        } finally {
          // Always reset states to prevent getting stuck
          setIsResponding(false);
          setIsAudioPlaying(false);
        }
      } else {
        console.log('⚠️ Not speaking because:', {
          shouldSpeak,
          hasMaiaSpeak: !!maiaSpeak,
          showChatInterface
        });
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
      trackEvent.error(userId || 'anonymous', 'api_error', String(error));

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
  }, [isProcessing, isAudioPlaying, isResponding, sessionId, userId, onMessageAdded, agentConfig, messages.length, showChatInterface, voiceEnabled, maiaReady, maiaSpeak]);

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    console.log('🎤 handleVoiceTranscript called with:', transcript);
    const t = transcript?.trim();
    if (!t) {
      console.log('⚠️ Empty transcript, returning');
      return;
    }

    // Prevent duplicate processing if already handling a message
    if (isProcessing || isResponding) {
      console.log('⚠️ Already processing, ignoring duplicate transcript');
      return;
    }

    // Deduplicate: check if this is the same as the last message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && lastMessage.text === t) {
      console.log('⚠️ Duplicate transcript detected, ignoring');
      return;
    }

    console.log('🎯 Voice transcript received:', t);
    console.log('📊 Current states:', {
      isProcessing,
      isResponding,
      isAudioPlaying,
      showChatInterface,
      voiceEnabled,
      isMuted
    });
    console.log('📞 Calling handleTextMessage...');

    const voiceStartTime = Date.now();
    trackEvent.voiceResult(userId || 'anonymous', t, 0);

    try {
      // Route all voice through text message handler for reliability
      await handleTextMessage(t);
      const duration = Date.now() - voiceStartTime;
      trackEvent.voiceResult(userId || 'anonymous', t, duration);
      console.log('✅ handleTextMessage completed');
    } catch (error) {
      console.error('❌ Error in handleTextMessage:', error);
      trackEvent.error(userId || 'anonymous', 'voice_processing_error', String(error));
      // Reset states on error
      setIsProcessing(false);
      setIsResponding(false);
    }
  }, [handleTextMessage, isProcessing, isResponding, isAudioPlaying, messages]);

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

    // Save as markdown file (only on client side)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([fullContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${agentConfig.name}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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

      // Call OpenAI TTS API with Alloy voice
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: 'alloy',     // Calm, composed, warm presence
          speed: 0.95,        // Slightly slower for natural conversational pace
          model: 'tts-1-hd'   // Higher quality for better clarity
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
      {/* MAIA Settings Panel */}
      {showSettingsPanel && (
        <MaiaSettingsPanel onClose={() => setShowSettingsPanel(false)} />
      )}

      {/* Agent Customizer - Only show when settings clicked */}
      {showCustomizer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCustomizer(false)} />
          <div className="relative z-10">
            <AgentCustomizer
              position="center"
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
                setShowCustomizer(false); // Close after selection
              }}
            />
          </div>
        </div>
      )}

      {/* Beautiful Sacred Holoflower - Responsive sizing - Always show */}
      <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
        {/* Adjusted container to shift light up and left */}
        <div className="flex items-center justify-center"
             style={{
               width: holoflowerSize,
               height: holoflowerSize,
               transform: 'translate(-20px, -30px)',
               pointerEvents: 'none',
               background: 'transparent',
               overflow: 'visible'
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

            {/* Holoflower Image */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <img
                src="/holoflower.svg"
                alt="Holoflower"
                className="w-32 h-32 object-contain"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                }}
              />
            </div>

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

            {/* Voice Visualizer - User's voice (clean blue rings for now) */}
            {isMounted && !showChatInterface && voiceEnabled && voiceMicRef.current?.isListening && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Elemental colored pulsing rings */}
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={`voice-ring-${i}`}
                    className="absolute rounded-full border-2"
                    style={{
                      width: `${200 + i * 100}px`,
                      height: `${200 + i * 100}px`,
                      borderColor: '#6B9BD1', // Clean blue - temporarily disabled elemental colors
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 0.4, 0.8],
                    }}
                    transition={{
                      duration: 2 + i * 0.5, // Standard timing - temporarily disabled elemental timing
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Audio level responsive inner ring */}
                {voiceAudioLevel > 0.05 && (
                  <motion.div
                    className="absolute rounded-full border-2 border-[#6B9BD1]"
                    style={{
                      width: '180px',
                      height: '180px',
                    }}
                    animate={{
                      scale: 1 + voiceAudioLevel * 0.3,
                      opacity: 0.5 + voiceAudioLevel * 0.5,
                    }}
                    transition={{
                      duration: 0.1,
                      ease: "linear"
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Voice Visualizer - Maya's voice (clean golden rings) */}
            {(isResponding || isAudioPlaying || maiaVoiceState?.isPlaying) && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Clean golden pulsing rings for Maya */}
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={`maya-ring-${i}`}
                    className="absolute rounded-full border-2"
                    style={{
                      width: `${250 + i * 100}px`,
                      height: `${250 + i * 100}px`,
                      borderColor: '#D4B896', // Golden for Maya
                    }}
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.7, 0.3, 0.7],
                    }}
                    transition={{
                      duration: 2.5 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Subtle inner glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(212, 184, 150, 0.2) 0%, transparent 60%)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            )}

            {/* Status text below holoflower */}
            {isMounted && !showChatInterface && voiceEnabled && (
              <div className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 text-center">
                {/* Elemental Mode Indicator - TEMPORARILY DISABLED
                {voiceMicRef.current?.elementalMode && (
                  <motion.div
                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      backgroundColor: `${voiceMicRef.current.elementalMode === 'fire' ? 'rgba(239, 68, 68, 0.2)' :
                        voiceMicRef.current.elementalMode === 'water' ? 'rgba(107, 155, 209, 0.2)' :
                        voiceMicRef.current.elementalMode === 'earth' ? 'rgba(161, 98, 7, 0.2)' :
                        voiceMicRef.current.elementalMode === 'air' ? 'rgba(212, 184, 150, 0.2)' :
                        'rgba(147, 51, 234, 0.2)'}`,
                      border: `1px solid ${voiceMicRef.current.elementalMode === 'fire' ? 'rgba(239, 68, 68, 0.4)' :
                        voiceMicRef.current.elementalMode === 'water' ? 'rgba(107, 155, 209, 0.4)' :
                        voiceMicRef.current.elementalMode === 'earth' ? 'rgba(161, 98, 7, 0.4)' :
                        voiceMicRef.current.elementalMode === 'air' ? 'rgba(212, 184, 150, 0.4)' :
                        'rgba(147, 51, 234, 0.4)'}`
                    }}
                  >
                    <span className="text-xs font-medium" style={{
                      color: voiceMicRef.current.elementalMode === 'fire' ? '#ef4444' :
                        voiceMicRef.current.elementalMode === 'water' ? '#6B9BD1' :
                        voiceMicRef.current.elementalMode === 'earth' ? '#a16207' :
                        voiceMicRef.current.elementalMode === 'air' ? '#D4B896' :
                        '#9333ea'
                    }}>
                      {voiceMicRef.current.elementalMode === 'fire' ? '🔥 Fire' :
                        voiceMicRef.current.elementalMode === 'water' ? '💧 Water' :
                        voiceMicRef.current.elementalMode === 'earth' ? '🌍 Earth' :
                        voiceMicRef.current.elementalMode === 'air' ? '🌬️ Air' :
                        '✨ Aether'}
                    </span>
                  </motion.div>
                )} */}
                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {voiceMicRef.current?.isListening && !isResponding && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-[#6B9BD1] text-sm font-medium"
                    >
                      Listening...
                    </motion.div>
                  )}
                  {(isResponding || isAudioPlaying) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-[#D4B896] text-sm font-medium"
                    >
                      Speaking...
                    </motion.div>
                  )}
                  {!voiceMicRef.current?.isListening && !isResponding && !isAudioPlaying && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-neutral-mystic text-sm"
                    >
                      Click to activate
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Larger clickable area for holoflower voice activation */}
            <motion.button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🌸 Holoflower clicked!', {
                  showChatInterface,
                  voiceEnabled,
                  isMuted,
                  isProcessing,
                  isResponding,
                  contemplationMode: voiceMicRef.current?.isContemplationMode
                });
                // Always enable audio first
                await enableAudio();

                // In voice mode, handle contemplation and listening modes
                if (!showChatInterface && voiceEnabled) {
                  // If in contemplation mode, exit it and resume normal conversation
                  if (voiceMicRef.current?.isContemplationMode) {
                    voiceMicRef.current.toggleContemplationMode();
                    console.log('🔙 Exited contemplation mode - ready for conversation');
                    return;
                  }

                  if (!isMuted) {
                    // Currently listening, so stop
                    setIsMuted(true);
                    if (voiceMicRef.current?.stopListening) {
                      voiceMicRef.current.stopListening();
                      console.log('🔇 Voice stopped via holoflower click');
                    }
                  } else {
                    // Currently muted, so start listening
                    setIsMuted(false);
                    // Small delay to ensure component is ready
                    setTimeout(async () => {
                      if (voiceMicRef.current?.startListening && !isProcessing && !isResponding) {
                        await voiceMicRef.current.startListening();
                        console.log('🎤 Voice started via holoflower click');
                      }
                    }, 100);
                  }
                } else if (showChatInterface) {
                  // In chat mode, switch to voice mode and activate
                  setShowChatInterface(false);
                  setIsMuted(false);
                  setTimeout(async () => {
                    if (voiceMicRef.current?.startListening && !isProcessing && !isResponding) {
                      await voiceMicRef.current.startListening();
                      console.log('🎤 Voice started via mode switch from holoflower');
                    }
                  }, 200);
                }
              }}
              className="relative cursor-pointer bg-transparent border-none p-8 hover:bg-white/5 rounded-full touch-manipulation"
              style={{
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                pointerEvents: 'auto'
              }}
              onContextMenu={(e) => {
                e.preventDefault(); // Prevent default context menu
                if (!showChatInterface && voiceEnabled && voiceMicRef.current?.toggleContemplationMode) {
                  voiceMicRef.current.toggleContemplationMode();
                  console.log('🧘 Contemplation mode toggled via right-click');
                }
              }}
              onTouchStart={(e) => {
                const touchStartTime = Date.now();
                let longPressTimer: NodeJS.Timeout;

                // Set up long press detection
                longPressTimer = setTimeout(() => {
                  if (!showChatInterface && voiceEnabled && voiceMicRef.current?.toggleContemplationMode) {
                    e.preventDefault();
                    voiceMicRef.current.toggleContemplationMode();
                    console.log('🧘 Contemplation mode toggled via long press');
                  }
                }, 800);

                // Clear timer on touch end or if touch moves
                const clearTimer = () => {
                  clearTimeout(longPressTimer);
                  e.currentTarget.removeEventListener('touchend', clearTimer);
                  e.currentTarget.removeEventListener('touchmove', clearTimer);
                };

                e.currentTarget.addEventListener('touchend', clearTimer);
                e.currentTarget.addEventListener('touchmove', clearTimer);

                // Also trigger normal click for short taps
                setTimeout(() => {
                  const clickEvent = new MouseEvent('click', { bubbles: true });
                  e.currentTarget.dispatchEvent(clickEvent);
                }, 50);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
            >
              {/* The actual holoflower image */}
              <img
                src="/holoflower.svg"
                alt="Sacred Holoflower"
                className="w-24 h-24 object-contain pointer-events-none"
                style={{
                  filter: voiceMicRef.current?.isListening
                    ? 'brightness(1.2)'
                    : isResponding
                      ? 'brightness(1.1)'
                      : 'brightness(1)',
                }}
              />

              {/* Mic status indicator - positioned at edge */}
              <div className="absolute bottom-4 right-4 w-4 h-4 pointer-events-none">
                <motion.div
                  className={`w-full h-full rounded-full ${
                    isMounted && voiceMicRef.current?.isContemplationMode
                      ? 'bg-amber-500'
                      : !showChatInterface && voiceEnabled && !isMuted
                      ? 'bg-green-500'
                      : 'bg-red-500/60'
                  }`}
                  animate={{
                    scale: isMounted && voiceMicRef.current?.isContemplationMode
                      ? [1, 1.3, 1] // Slower, deeper pulse for contemplation
                      : isMounted && voiceMicRef.current?.isListening ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: isMounted && voiceMicRef.current?.isContemplationMode ? 3 : 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
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

      {/* Message flow - Show in both Chat mode and optionally in Voice mode */}
      {(showChatInterface || (!showChatInterface && showVoiceText)) && messages.length > 0 && (
        <div className="fixed inset-x-4 top-24 sm:top-16 sm:right-8 sm:left-auto sm:transform-none
                        sm:w-96 z-30 overflow-hidden"
             style={{
               height: showChatInterface ? 'calc(100vh - 380px)' : 'calc(100vh - 240px)',
               bottom: showChatInterface ? '240px' : '120px'
             }}>
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2"
               style={{ scrollBehavior: 'smooth' }}>
            <AnimatePresence>
              {messages.length > 0 && (
                <div className="space-y-3 pb-4">
                {/* Show all messages with proper scrolling */}
                {messages
                  .map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: Math.min(index * 0.05, 0.3) }}
                      className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-white
                               border border-gold-divine/30 shadow-lg max-w-full"
                    >
                      <div className="text-xs text-gold-divine/60 mb-2">
                        {message.role === 'user' ? 'You' : agentConfig.name}
                      </div>
                      <div className="text-sm sm:text-base leading-relaxed break-words">
                        {message.role === 'oracle' ? (
                          <FormattedMessage text={message.text} />
                        ) : (
                          message.text
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Chat Interface or Voice Mic */}
      {voiceEnabled && (
        <>
          {/* Mode Toggle - Top area on mobile, bottom-left on desktop */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 md:top-auto md:bottom-8 md:left-8 md:transform-none flex flex-col gap-3 items-center md:items-start z-50">
            {/* Mode switcher */}
            <div className="flex gap-2 bg-black/20 backdrop-blur-md rounded-full p-1">
              <button
                onClick={async () => {
                  setShowChatInterface(false);
                  await enableAudio();
                  // Start voice after mode switch
                  setTimeout(async () => {
                    await voiceMicRef.current?.startListening();
                  }, 300);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !showChatInterface
                    ? 'bg-amber-500/80 text-white shadow-sm'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Voice
              </button>
              <button
                onClick={() => {
                  setShowChatInterface(true);
                  enableAudio();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  showChatInterface
                    ? 'bg-blue-500/80 text-white shadow-sm'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Chat
              </button>
            </div>
          </div>

          {/* Text Display Toggle for Voice Mode */}
          {!showChatInterface && (
            <div className="fixed top-20 right-8 z-50">
              <button
                onClick={() => setShowVoiceText(!showVoiceText)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/20 backdrop-blur-md
                         text-white/60 hover:text-white/80 transition-all"
              >
                {showVoiceText ? 'Hide Text' : 'Show Text'}
              </button>
            </div>
          )}

          {showChatInterface ? (
            /* Chat Interface - Only show text input in Chat mode */
            <>
              {/* Compact Holoflower at top for mobile */}
              <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 sm:hidden">
                <motion.div
                  className="relative"
                  animate={{
                    scale: isResponding || isAudioPlaying ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isResponding || isAudioPlaying ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-20 h-20 relative">
                    {/* Glow effect when speaking */}
                    {(isResponding || isAudioPlaying) && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(212, 184, 150, 0.6) 0%, transparent 70%)',
                          filter: 'blur(20px)',
                        }}
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 0.3, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    {/* Empty - just show the glow effect */}
                  </div>
                </motion.div>
              </div>

              {/* Voice toggle for chat mode */}
              <div className="fixed top-20 right-8 z-50">
                <button
                  onClick={() => setEnableVoiceInChat(!enableVoiceInChat)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    enableVoiceInChat
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-black/20 text-white/40 border border-white/10'
                  } backdrop-blur-md hover:bg-opacity-30`}
                  title={enableVoiceInChat ? 'Voice responses enabled' : 'Voice responses disabled'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>{enableVoiceInChat ? 'Voice On' : 'Voice Off'}</span>
                </button>
              </div>

              {/* Expanded text input area - only in Chat mode */}
              {showChatInterface && (
              <div className="fixed inset-x-0 bottom-24 z-40">
                {/* Text input area */}
                <div className="bg-black/20 backdrop-blur-sm p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement;
                      if (input?.value.trim()) {
                        handleTextMessage(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex flex-col gap-3 max-w-4xl mx-auto"
                  >
                    {/* Larger text area on mobile */}
                    <textarea
                      name="message"
                      placeholder="Share your thoughts with Maya..."
                      disabled={isProcessing}
                      className="w-full min-h-[120px] sm:min-h-[60px] px-4 py-3
                               bg-black/40 backdrop-blur-sm
                               border border-gold-divine/30 rounded-2xl
                               text-gold-divine placeholder-gold-divine/50
                               text-base sm:text-sm leading-relaxed
                               focus:outline-none focus:border-gold-divine/50 focus:ring-2 focus:ring-gold-divine/20
                               disabled:opacity-50 resize-none
                               touch-manipulation"
                      autoComplete="off"
                      autoFocus={false}
                    />

                    <div className="flex justify-between items-center">
                      {/* Processing indicator */}
                      <div className="text-xs text-gold-divine/50">
                        {isProcessing ? 'Maia is reflecting...' : ''}
                      </div>

                      {/* Send button */}
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="px-6 py-2 bg-gold-divine/20 border border-gold-divine/30
                                 rounded-full text-gold-divine
                                 hover:bg-gold-divine/30 transition-all
                                 disabled:opacity-30"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              )}
            </>
          ) : (
            <>
              {/* Simplified Organic Voice - No visual mic, just voice logic */}
              <SimplifiedOrganicVoice
                ref={voiceMicRef}
                onTranscript={(transcript) => {
                  console.log('📝 Voice transcript received:', transcript);
                  setUserTranscript(transcript);
                  handleVoiceTranscript(transcript);
                }}
                enabled={!isMuted && !isAudioPlaying && !isResponding && !maiaVoiceState?.isPlaying}
                isMayaSpeaking={isResponding || isAudioPlaying || maiaVoiceState?.isPlaying}
                onAudioLevelChange={setVoiceAudioLevel}
              />
            </>
          )}
        </>
      )}


      {/* Mic Hint Message */}
      {!showChatInterface && voiceEnabled && isMuted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <p className="text-white/80 text-sm">Click the holoflower to activate voice</p>
          </div>
        </motion.div>
      )}



      {/* Analytics toggle */}
      {showAnalytics && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+2rem)] right-8">
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
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+2rem)] left-8 bg-black/80 text-white text-xs p-3 rounded-lg">
          <div className="font-bold mb-2">Voice State</div>
          <div>Amplitude: {(userVoiceState.amplitude * 100).toFixed(0)}%</div>
          <div>Emotion: {userVoiceState.emotion}</div>
          <div>Breath: {(userVoiceState.breathDepth * 100).toFixed(0)}%</div>
          <div>Speaking: {userVoiceState.isSpeaking ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Redesigned Bottom Icon Bar - Sacred Style - Always at bottom */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pb-safe">
        <div className="flex justify-center items-center gap-8 py-4 px-8 bg-black/60 backdrop-blur-lg rounded-full border border-[#D4B896]/20">
          {/* Voice Toggle - Activate mic when switching to voice mode */}
          <button
            onClick={async () => {
              setShowChatInterface(false);
              setIsMuted(false); // Unmute FIRST
              await enableAudio();
              // Start listening when switching to voice mode
              setTimeout(async () => {
                if (voiceMicRef.current?.startListening && !isProcessing && !isResponding) {
                  await voiceMicRef.current.startListening();
                  console.log('🎤 Voice started via mode switch');
                }
              }, 300); // Slightly longer delay to ensure state updates
            }}
            className={`p-3 rounded-full transition-all duration-300 ${
              !showChatInterface
                ? 'bg-[#D4B896]/20 text-[#D4B896]'
                : 'text-[#D4B896]/40 hover:text-[#D4B896]/60'
            }`}
            title="Voice Mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Heart/Favorites */}
          <button
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300"
            title="Favorites"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Profile/User */}
          <button
            onClick={() => window.location.href = '/profile'}
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300"
            title="Your Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Lab Notes */}
          <button
            onClick={() => window.location.href = '/lab-notes'}
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300"
            title="Lab Notes"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Journal/Book Icon - Open Book Style */}
          <button
            onClick={() => window.location.href = '/journal'}
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300 group"
            title="Sacred Journal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              {/* Left page */}
              <path
                d="M 4,8 Q 4,6 6,6 L 14,6 L 14,24 Q 14,25 13,25 L 6,25 Q 4,25 4,23 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:animate-pulse"
              />
              {/* Right page */}
              <path
                d="M 28,8 Q 28,6 26,6 L 18,6 L 18,24 Q 18,25 19,25 L 26,25 Q 28,25 28,23 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:animate-pulse"
              />
              {/* Book spine */}
              <path
                d="M 14,6 L 14,25 L 18,25 L 18,6 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Text lines */}
              <path d="M 7,10 L 11,10" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
              <path d="M 7,13 L 11,13" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
              <path d="M 20,10 L 24,10" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
              <path d="M 20,13 L 24,13" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            </svg>
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChatInterface(true)}
            className={`p-3 rounded-full transition-all duration-300 ${
              showChatInterface
                ? 'bg-[#D4B896]/20 text-[#D4B896]'
                : 'text-[#D4B896]/40 hover:text-[#D4B896]/60'
            }`}
            title="Chat Mode"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Text Display Toggle - Only visible in Voice mode */}
          {!showChatInterface && (
            <button
              onClick={() => setShowVoiceText(!showVoiceText)}
              className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300"
              title={showVoiceText ? "Hide Text" : "Show Text"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showVoiceText
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      } />
              </svg>
            </button>
          )}

          {/* File Upload for Maia */}
          <input
            type="file"
            id="maiaFileUpload"
            className="hidden"
            multiple
            accept="*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                const fileNames = files.map(f => f.name).join(', ');
                handleTextMessage(`Please analyze these files: ${fileNames}`, files);
                e.target.value = ''; // Reset input
              }
            }}
          />
          <label
            htmlFor="maiaFileUpload"
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/80 hover:bg-[#D4B896]/10 transition-all duration-300 cursor-pointer"
            title="Upload files for Maia to explore"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </label>

          {/* Quick Settings - Opens comprehensive MAIA settings */}
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896] hover:bg-[#D4B896]/10 transition-all duration-300 group relative"
            title="MAIA Settings - Voice, Memory, Personality"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>

          {/* Download/Share */}
          <button
            onClick={downloadTranscript}
            disabled={messages.length === 0}
            className="p-3 rounded-full text-[#D4B896]/40 hover:text-[#D4B896]/60 transition-all duration-300 disabled:opacity-30"
            title="Download Transcript"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Quick Settings Button */}
      <QuickSettingsButton />

      {/* Soulprint Metrics Widget */}
      {userId && <SoulprintMetricsWidget userId={userId} />}
    </div>
  );
};

export default OracleConversation;
