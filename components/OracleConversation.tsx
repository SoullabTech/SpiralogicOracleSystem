// Oracle Conversation - Voice-synchronized sacred dialogue
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredHoloflowerWithAudio } from './sacred/SacredHoloflowerWithAudio';
import { EnhancedVoiceMicButton } from './ui/EnhancedVoiceMicButton';
import { MotionState, CoherenceShift } from './motion/MotionOrchestrator';
import { OracleResponse, ConversationContext } from '@/lib/oracle-response';
import { mapResponseToMotion, enrichOracleResponse } from '@/lib/motion-mapper';
import { VoiceState } from '@/lib/voice/voice-capture';

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
  const [oracleVoiceState, setOracleVoiceState] = useState<VoiceState | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  
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
    // Add user message
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
    
    // Call Oracle API
    try {
      const response = await fetch('/api/oracle/unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: transcript,
          type: 'voice',
          userId: userId || 'anonymous',
          sessionId,
          context: {
            element: 'aether',
            previousInteractions: messages.length
          }
        })
      });

      const responseData = await response.json();
      
      // Extract text from response - handle both formats
      const responseText = responseData.message || responseData.mayaResponse || 'I am here with you.';
      
      // Map response to motion
      const motionMapping = mapResponseToMotion(responseText);
      
      // Update motion states
      setCurrentMotionState(motionMapping.motionState);
      setCoherenceLevel(motionMapping.coherenceLevel);
      setCoherenceShift(motionMapping.coherenceShift);
      setShadowPetals(motionMapping.shadowPetals);
      setActiveFacetId(responseData.primaryFacetId || 'voice');
      
      // Check for breakthrough
      if (motionMapping.isBreakthrough) {
        setShowBreakthrough(true);
        setTimeout(() => setShowBreakthrough(false), 3000);
      }
      
      // Add oracle message
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}-oracle`,
        role: 'oracle',
        text: responseText,
        timestamp: new Date(),
        facetId: responseData.primaryFacetId || 'voice',
        motionState: motionMapping.motionState,
        coherenceLevel: motionMapping.coherenceLevel
      };
      setMessages(prev => [...prev, oracleMessage]);
      onMessageAdded?.(oracleMessage);
      
      // Update context
      contextRef.current.previousResponses.push({
        text: responseText,
        primaryFacetId: responseData.primaryFacetId || 'voice',
        ...responseData
      });
      contextRef.current.coherenceHistory.push(motionMapping.coherenceLevel);
      
      // Set responding state
      setIsResponding(true);
      setCurrentMotionState('responding');
      
      // Play Maya's voice response
      if (voiceEnabled) {
        await playMayaVoice(responseText);
      }
      
    } catch (error) {
      console.error('Oracle API error:', error);
    } finally {
      setIsProcessing(false);
      setIsResponding(false);
      
      // Return to idle after response
      setTimeout(() => {
        setCurrentMotionState('idle');
      }, 2000);
    }
  }, [messages, sessionId, userId, voiceEnabled, onMessageAdded, activeFacetId]);

  // Play Maya's voice using TTS
  const playMayaVoice = async (text: string) => {
    try {
      // Call TTS API
      const response = await fetch('/api/tts/maya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice: 'maya',
          element: activeFacetId?.split('-')[0] || 'aether'
        })
      });

      if (response.ok) {
        const { audio } = await response.json();
        
        if (audio) {
          // Play the audio
          const audioData = `data:audio/mp3;base64,${audio}`;
          const audioElement = new Audio(audioData);
          
          setOracleVoiceState({
            amplitude: 0.6,
            pitch: 180,
            emotion: 'calm',
            isSpeaking: true,
            energy: 0.5,
            clarity: 0.9,
            breathDepth: 0.7
          });
          
          audioElement.onended = () => {
            setOracleVoiceState(prev => prev ? { ...prev, isSpeaking: false } : null);
          };
          
          await audioElement.play();
        }
      }
    } catch (error) {
      console.error('TTS playback error:', error);
      // Fallback to duration simulation
      const words = text.split(' ');
      const duration = words.length * 200;
      
      setOracleVoiceState({
        amplitude: 0.6,
        pitch: 180,
        emotion: 'calm',
        isSpeaking: true,
        energy: 0.5,
        clarity: 0.9,
        breathDepth: 0.7
      });
      
      await new Promise(resolve => setTimeout(resolve, duration));
      setOracleVoiceState(prev => prev ? { ...prev, isSpeaking: false } : null);
    }
  };

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
            isResponding={isResponding}
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
                    {message.role === 'user' ? 'You' : 'Oracle'}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.text}
                  </div>
                  {message.coherenceLevel && (
                    <div className="text-xs text-purple-400">
                      Coherence: {Math.round(message.coherenceLevel * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Voice Mic with Transcript Display */}
      {voiceEnabled && (
        <EnhancedVoiceMicButton
          onVoiceStateChange={setUserVoiceState}
          onTranscript={handleVoiceTranscript}
          position="bottom-center"
          silenceThreshold={3000}
        />
      )}

      {/* Check-in controls */}
      <div className="fixed bottom-8 left-8 space-y-2">
        <button
          onClick={clearCheckIns}
          className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full
                     hover:bg-white/20 transition-colors"
        >
          Clear Check-ins
        </button>
        
        {Object.keys(checkIns).length > 0 && (
          <div className="text-xs text-white/60">
            {Object.keys(checkIns).length} active
          </div>
        )}
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

      {/* Coherence indicator */}
      <div className="fixed bottom-8 right-8 text-right">
        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
          Coherence
        </div>
        <div className="text-2xl font-bold text-white">
          {Math.round(coherenceLevel * 100)}%
        </div>
        {coherenceShift !== 'stable' && (
          <div className={`text-xs mt-1 ${
            coherenceShift === 'rising' ? 'text-green-400' : 'text-red-400'
          }`}>
            {coherenceShift === 'rising' ? '↑ Rising' : '↓ Falling'}
          </div>
        )}
      </div>

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