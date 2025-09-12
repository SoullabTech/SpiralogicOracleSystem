// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflower } from './sacred/SacredHoloflower';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import MayaChatInterface from './chat/MayaChatInterface';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { cleanMessage, cleanMessageForVoice, formatMessageForDisplay } from '@/lib/cleanMessage';

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
  
  // UI states
  const [showChatInterface, setShowChatInterface] = useState(true); // Default to chat interface for better UX
  
  // Conversation context
  const contextRef = useRef<ConversationContext>({
    sessionId,
    userId,
    checkIns,
    previousResponses: [],
    coherenceHistory: [],
    currentMotionState: 'idle'
  });

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

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    // Debounce rapid calls
    if (isProcessing) return;
    
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
          context: {
            previousInteractions: messages.length,
            userPreferences: {
              voice: {
                enabled: voiceEnabled,
                autoSpeak: true
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
      console.log('Oracle response:', responseData);
      
      // Handle PersonalOracleAgent response format
      const oracleResponse = responseData.data || responseData;
      let responseText = oracleResponse.message || 'I am here with you.';
      
      // Clean any voice command artifacts from the response text
      responseText = cleanMessage(responseText);
      
      // Use the element and voice characteristics from PersonalOracleAgent
      const element = oracleResponse.element || 'aether';
      const voiceCharacteristics = oracleResponse.voiceCharacteristics;
      const audioUrl = oracleResponse.audio; // Audio URL from Sesame generation
      
      // Map element to facet for holoflower visualization
      const facetId = mapElementToFacetId(element);
      setActiveFacetId(facetId);
      setCurrentMotionState('responding');
      setCoherenceLevel(oracleResponse.confidence || 0.85);
      
      // Add oracle message
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
        voiceCharacteristics,
        confidence: oracleResponse.confidence
      });
      contextRef.current.coherenceHistory.push(oracleResponse.confidence || 0.85);
      
      // Set responding state
      setIsResponding(true);
      setCurrentMotionState('responding');
      
      // Play Maya's voice response - use backend audio if available
      if (voiceEnabled && mayaReady) {
        if (audioUrl && audioUrl !== 'web-speech-fallback') {
          // Play the Sesame-generated audio directly
          try {
            const audio = new Audio(audioUrl);
            audio.volume = 0.8;
            audio.play().catch(error => {
              console.error('Audio playback failed, falling back to Maya voice:', error);
              // Fallback to Maya voice synthesis
              mayaSpeak(responseText, {
                element,
                tone: voiceCharacteristics?.tone,
                masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
              });
            });
          } catch (error) {
            console.error('Audio creation failed:', error);
            // Fallback to Maya voice synthesis - clean stage directions
            mayaSpeak(cleanMessageForVoice(responseText), {
              element,
              tone: voiceCharacteristics?.tone,
              masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
            });
          }
        } else {
          // Use Maya voice synthesis with element characteristics - clean stage directions
          mayaSpeak(cleanMessageForVoice(responseText), {
            element,
            tone: voiceCharacteristics?.tone,
            masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
          }).catch(error => {
            console.error('Maya voice failed:', error);
          });
        }
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
      setIsProcessing(false);
      setIsResponding(false);
      
      // Return to idle quickly
      setTimeout(() => {
        setCurrentMotionState('idle');
      }, 500);
    }
  }, [isProcessing, sessionId, userId, voiceEnabled, onMessageAdded, mayaReady, mayaSpeak]);

  // Handle text messages from chat interface
  const handleTextMessage = useCallback(async (text: string, attachments?: File[]) => {
    // Process attachments first if any
    let messageText = text;
    if (attachments && attachments.length > 0) {
      // For now, just mention the files - in a full implementation you'd upload them
      const fileNames = attachments.map(f => f.name).join(', ');
      messageText = `${text}\n\n[Files attached: ${fileNames}]`;
    }
    
    // Use the same handler as voice transcript
    handleVoiceTranscript(messageText);
  }, [handleVoiceTranscript]);

  // Clear all check-ins
  const clearCheckIns = useCallback(() => {
    setCheckIns({});
    contextRef.current.checkIns = {};
  }, []);

  return (
    <div className="oracle-conversation min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black overflow-hidden">
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

      {/* Message flow - Mobile: Bottom sheet, Desktop: Right side */}
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
                    {message.role === 'user' ? 'You' : 'Maya'}
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

      {/* Chat Interface or Voice Mic */}
      {voiceEnabled && (
        <>
          {/* Mode Toggle - Mobile positioned */}
          <div className="fixed top-4 md:top-8 left-4 md:left-8 flex gap-2 z-40">
            <button
              onClick={() => setShowChatInterface(false)}
              className={`px-2 md:px-3 py-1 rounded-full text-xs transition-colors ${
                !showChatInterface 
                  ? 'bg-[#D4B896] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setShowChatInterface(true)}
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
                messages={messages.map(msg => ({
                  id: msg.id,
                  role: msg.role === 'oracle' ? 'maya' : 'user',
                  text: msg.text,
                  timestamp: msg.timestamp
                }))}
                isProcessing={isProcessing}
                disabled={isProcessing}
              />
            </div>
          ) : (
            /* Voice-Only Interface */
            <EnhancedVoiceMicButton
              onVoiceStateChange={setUserVoiceState}
              onTranscript={handleVoiceTranscript}
              position="bottom-center"
              silenceThreshold={1000}  // Reduced from 3000ms to 1000ms for faster response
            />
          )}
        </>
      )}


      {/* Session Controls - Mobile optimized */}
      <div className="fixed top-4 md:top-8 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-4 z-50">
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