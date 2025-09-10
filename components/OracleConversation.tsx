// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflowerWithAudio } from './sacred/SacredHoloflowerWithAudio';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import MayaChatInterface from './chat/MayaChatInterface';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';
import { useMayaVoice } from '@/hooks/useMayaVoice';

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

  // Handle voice transcript from mic button
  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    // Debounce rapid calls
    if (isProcessing) return;
    
    // Add user message immediately for responsiveness
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: transcript,
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
      
      const response = await fetch('/api/oracle/personal/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: transcript,
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

      const responseData = await response.json();
      
      // Handle PersonalOracleAgent response format
      const oracleResponse = responseData.data || responseData;
      let responseText = oracleResponse.message || 'I am here with you.';
      
      // Maya's responses should already be natural from canonical prompt
      // No need to clean up - just ensure basic formatting
      responseText = responseText.trim();
      
      // Use the element and voice characteristics from PersonalOracleAgent
      const element = oracleResponse.element || 'aether';
      const voiceCharacteristics = oracleResponse.voiceCharacteristics;
      const audioUrl = oracleResponse.audio; // Audio URL from Sesame generation
      
      // Map element to facet for holoflower visualization
      setActiveFacetId(element);
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
            // Fallback to Maya voice synthesis
            mayaSpeak(responseText, {
              element,
              tone: voiceCharacteristics?.tone,
              masteryVoiceApplied: voiceCharacteristics?.masteryVoiceApplied
            });
          }
        } else {
          // Use Maya voice synthesis with element characteristics
          mayaSpeak(responseText, {
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
    } finally {
      setIsProcessing(false);
      setIsResponding(false);
      
      // Return to idle quickly
      setTimeout(() => {
        setCurrentMotionState('idle');
      }, 500);
    }
  }, [isProcessing, messages.length, sessionId, userId, voiceEnabled, onMessageAdded]);

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


  // Handle petal click for check-ins
  const handlePetalClick = useCallback((facetId: string) => {
    setCheckIns(prev => ({
      ...prev,
      [facetId]: Math.min(1, (prev[facetId] || 0) + 0.25)
    }));
    
    // Update context
    contextRef.current.checkIns = {
      ...contextRef.current.checkIns,
      [facetId]: Math.min(1, (contextRef.current.checkIns[facetId] || 0) + 0.25)
    };
  }, []);

  // Clear all check-ins
  const clearCheckIns = useCallback(() => {
    setCheckIns({});
    contextRef.current.checkIns = {};
  }, []);

  return (
    <div className="oracle-conversation min-h-screen bg-gradient-to-b from-slate-900 via-[#1a1f3a] to-black">
      {/* Sacred Holoflower - Always centered */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <SacredHoloflowerWithAudio
            size={400}
            activeFacetId={activeFacetId}
            userCheckIns={checkIns}
            onPetalClick={handlePetalClick}
            showLabels={false}
            interactive={!isProcessing}
            audioEnabled={true}
            audioVolume={0.4}
            motionState={currentMotionState}
            coherenceLevel={coherenceLevel}
            coherenceShift={coherenceShift}
            isListening={isListening}
            isProcessing={isProcessing}
            isResponding={isResponding || mayaVoiceState.isPlaying}
            showBreakthrough={showBreakthrough}
          />
          
          {/* Shadow petal overlay */}
          {shadowPetals.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
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
          )}
        </div>
      </div>

      {/* Message overlay - minimal, non-intrusive */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 max-w-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 text-white">
              {messages.slice(-1).map(message => (
                <div key={message.id} className="space-y-2">
                  <div className="text-xs text-purple-300 uppercase tracking-wider">
                    {message.role === 'user' ? 'You' : 'Maya'}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface or Voice Mic */}
      {voiceEnabled && (
        <>
          {/* Mode Toggle */}
          <div className="fixed top-8 left-8 flex gap-2">
            <button
              onClick={() => setShowChatInterface(false)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                !showChatInterface 
                  ? 'bg-[#D4B896] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setShowChatInterface(true)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                showChatInterface 
                  ? 'bg-[#D4B896] text-white' 
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Chat
            </button>
          </div>

          {showChatInterface ? (
            /* Text Chat Interface */
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
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
              silenceThreshold={3000}
            />
          )}
        </>
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