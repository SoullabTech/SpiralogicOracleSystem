'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';
// import { MemorySavePrompt } from '@/components/auth/MemorySavePrompt'; // DISABLED - Legacy
import { MayaWelcome } from './MayaWelcome';
import { OracleConversation } from '@/components/OracleConversation';

interface ConversationFlowProps {
  initialMode?: 'welcome' | 'conversation';
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'oracle';
  text: string;
  timestamp: Date;
  facetId?: string;
}

interface ConversationSession {
  id: string;
  messages: ConversationMessage[];
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  totalMessages: number;
  userId?: string;
}

export function ConversationFlow({ initialMode = 'welcome' }: ConversationFlowProps) {
  const { isAuthenticated, user } = useAuth();
  const { saveMemory, hasPendingMemory } = useConversationMemory();
  
  const [mode, setMode] = useState<'welcome' | 'conversation' | 'reflection'>(initialMode);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [showMemorySavePrompt, setShowMemorySavePrompt] = useState(false);
  const [conversationToSave, setConversationToSave] = useState<string>('');
  const [inactivityTimeoutId, setInactivityTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Session tracking
  const messagesRef = useRef<ConversationMessage[]>([]);
  const lastActivityRef = useRef<Date>(new Date());

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start a new conversation session
  const startConversation = useCallback(() => {
    const sessionId = generateSessionId();
    const newSession: ConversationSession = {
      id: sessionId,
      messages: [],
      startedAt: new Date().toISOString(),
      isActive: true,
      totalMessages: 0,
      userId: user?.id
    };
    
    setCurrentSession(newSession);
    messagesRef.current = [];
    lastActivityRef.current = new Date();
    setMode('conversation');

    // Set up inactivity timeout (5 minutes)
    if (inactivityTimeoutId) {
      clearTimeout(inactivityTimeoutId);
    }
    const timeoutId = setTimeout(() => {
      handleConversationTimeout();
    }, 5 * 60 * 1000);
    setInactivityTimeoutId(timeoutId);
  }, [user?.id, inactivityTimeoutId]);

  // Handle conversation timeout due to inactivity
  const handleConversationTimeout = useCallback(async () => {
    if (currentSession && messagesRef.current.length > 0) {
      await handleConversationEnd('Session ended due to inactivity');
    }
  }, [currentSession]);

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = new Date();
    
    if (inactivityTimeoutId) {
      clearTimeout(inactivityTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      handleConversationTimeout();
    }, 5 * 60 * 1000);
    setInactivityTimeoutId(timeoutId);
  }, [inactivityTimeoutId, handleConversationTimeout]);

  // Track messages from OracleConversation component
  const handleMessageAdded = useCallback((message: ConversationMessage) => {
    messagesRef.current.push(message);
    
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        totalMessages: prev.totalMessages + 1
      } : null);
    }
    
    resetInactivityTimer();
  }, [currentSession, resetInactivityTimer]);

  // Handle when user ends conversation manually or it times out
  const handleConversationEnd = useCallback(async (reason?: string) => {
    if (inactivityTimeoutId) {
      clearTimeout(inactivityTimeoutId);
      setInactivityTimeoutId(null);
    }

    if (!currentSession) return;

    // Update session with final state
    const endedSession: ConversationSession = {
      ...currentSession,
      isActive: false,
      endedAt: new Date().toISOString(),
      messages: messagesRef.current
    };
    setCurrentSession(endedSession);

    // Only process if there were meaningful exchanges
    if (messagesRef.current.length >= 2) { // At least one exchange
      const conversationSummary = generateConversationSummary(endedSession, reason);
      setConversationToSave(conversationSummary);

      // Skip authentication for now - allow anonymous use
      // if (isAuthenticated) {
      //   await saveMemoryFromConversation(conversationSummary, endedSession.id);
      //   setMode('reflection');
      // } else {
      //   setShowMemorySavePrompt(true);
      // }
      
      // Just go to reflection mode without saving
      setMode('reflection');
    } else {
      // No meaningful conversation, just go back to welcome
      setMode('welcome');
    }
  }, [currentSession, isAuthenticated, inactivityTimeoutId]);

  // Generate conversation summary for memory storage
  const generateConversationSummary = (session: ConversationSession, reason?: string): string => {
    const duration = session.endedAt && session.startedAt
      ? Math.floor((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / (1000 * 60))
      : 0;

    let summary = `Sacred dialogue with Maia (${duration} minutes, ${session.totalMessages} messages)\n\n`;
    
    if (reason) {
      summary += `Session ended: ${reason}\n\n`;
    }

    // Include key exchanges from the conversation
    if (session.messages.length > 0) {
      summary += 'Sacred Exchange:\n';
      
      // Include first exchange and last few exchanges
      const firstExchange = session.messages.slice(0, 2);
      const lastExchanges = session.messages.slice(-4);
      
      [...firstExchange, ...lastExchanges].forEach((msg, index) => {
        const speaker = msg.role === 'user' ? 'Seeker' : 'Maia';
        summary += `\n${speaker}: ${msg.text}`;
      });

      // Add facet information if present
      const facets = session.messages
        .filter(m => m.facetId)
        .map(m => m.facetId)
        .filter((id, index, arr) => arr.indexOf(id) === index);
      
      if (facets.length > 0) {
        summary += `\n\nActive facets: ${facets.join(', ')}`;
      }
    }

    return summary;
  };

  // Save memory with wisdom extraction
  const saveMemoryFromConversation = async (content: string, sessionId: string) => {
    const themes = extractWisdomThemes(content);
    const elementalResonance = detectElementalResonance(content);
    const emotionalTone = detectEmotionalTone(content);

    await saveMemory(content, {
      memoryType: 'conversation',
      sourceType: 'voice',
      sessionId,
      wisdomThemes: themes,
      elementalResonance,
      emotionalTone
    });
  };

  // Extract wisdom themes from conversation content
  const extractWisdomThemes = (content: string): string[] => {
    const themes: string[] = [];
    const lowerContent = content.toLowerCase();

    const themeKeywords = {
      transformation: ['change', 'transform', 'evolve', 'growth', 'shift', 'breakthrough'],
      healing: ['heal', 'pain', 'wound', 'recovery', 'wholeness', 'mending'],
      purpose: ['purpose', 'calling', 'mission', 'meaning', 'destiny', 'path'],
      relationships: ['relationship', 'love', 'connection', 'family', 'partner', 'bond'],
      creativity: ['create', 'art', 'express', 'imagination', 'inspiration', 'vision'],
      spirituality: ['spirit', 'soul', 'divine', 'sacred', 'prayer', 'meditation'],
      fear: ['fear', 'anxiety', 'worry', 'afraid', 'terror', 'doubt'],
      joy: ['joy', 'happy', 'delight', 'celebration', 'bliss', 'gratitude'],
      wisdom: ['wisdom', 'insight', 'understanding', 'clarity', 'truth', 'awareness'],
      shadow: ['shadow', 'dark', 'hidden', 'suppressed', 'denied', 'unconscious'],
      embodiment: ['body', 'physical', 'sensation', 'breath', 'movement', 'grounding'],
      intuition: ['intuition', 'feeling', 'sense', 'knowing', 'instinct', 'inner']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matches = keywords.reduce((count, keyword) => {
        return count + (lowerContent.match(new RegExp(`\\b${keyword}`, 'g')) || []).length;
      }, 0);
      
      if (matches >= 2) { // Threshold for theme presence
        themes.push(theme);
      }
    });

    return themes.slice(0, 5); // Limit to top 5 themes
  };

  // Detect elemental resonance
  const detectElementalResonance = (content: string): string | undefined => {
    const lowerContent = content.toLowerCase();
    
    const elementalKeywords = {
      earth: ['ground', 'body', 'practical', 'stable', 'foundation', 'material', 'physical', 'solid'],
      water: ['feel', 'emotion', 'flow', 'intuition', 'dream', 'heart', 'fluid', 'deep'],
      fire: ['passion', 'energy', 'vision', 'transform', 'action', 'will', 'power', 'bright'],
      air: ['think', 'idea', 'communicate', 'mental', 'breath', 'clarity', 'perspective', 'light']
    };

    let maxScore = 0;
    let dominantElement: string | undefined;

    Object.entries(elementalKeywords).forEach(([element, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (lowerContent.match(new RegExp(`\\b${keyword}`, 'g')) || []).length;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        dominantElement = element;
      }
    });

    return maxScore >= 3 ? dominantElement : undefined;
  };

  // Detect emotional tone
  const detectEmotionalTone = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (['pain', 'hurt', 'sad', 'grief', 'loss', 'sorrow'].some(word => lowerContent.includes(word))) {
      return 'melancholic';
    }
    if (['joy', 'happy', 'excited', 'celebrate', 'delight'].some(word => lowerContent.includes(word))) {
      return 'joyful';
    }
    if (['peace', 'calm', 'serene', 'tranquil', 'stillness'].some(word => lowerContent.includes(word))) {
      return 'peaceful';
    }
    if (['curious', 'wonder', 'explore', 'question', 'discover'].some(word => lowerContent.includes(word))) {
      return 'curious';
    }
    if (['hope', 'optimistic', 'bright', 'possibility', 'future'].some(word => lowerContent.includes(word))) {
      return 'hopeful';
    }
    if (['fear', 'anxious', 'worry', 'scared', 'nervous'].some(word => lowerContent.includes(word))) {
      return 'anxious';
    }
    
    return 'contemplative';
  };

  // Handle successful memory save and account creation
  const handleMemorySaved = () => {
    setShowMemorySavePrompt(false);
    setMode('reflection');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutId) {
        clearTimeout(inactivityTimeoutId);
      }
    };
  }, [inactivityTimeoutId]);

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {mode === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MayaWelcome onConversationStart={startConversation} />
          </motion.div>
        )}

        {mode === 'conversation' && currentSession && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OracleConversation
              userId={user?.id}
              sessionId={currentSession.id}
              voiceEnabled={true}
              showAnalytics={false}
              onMessageAdded={handleMessageAdded}
              onSessionEnd={handleConversationEnd}
            />
            
            {/* End conversation button */}
            <div className="fixed top-8 left-8 z-50">
              <button
                onClick={() => handleConversationEnd('User ended session')}
                className="bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
              >
                End Conversation
              </button>
            </div>

            {/* Session indicator */}
            <div className="fixed top-8 right-8 z-50">
              <div className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                Session Active
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'reflection' && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              <div className="text-6xl">✨</div>
              <h2 className="text-3xl font-light text-white/90">
                Sacred Reflection Preserved
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                Your dialogue with Maia has been woven into the eternal tapestry of remembrance. 
                These insights will illuminate future conversations and deepen your journey of discovery.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={startConversation}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full transition-all duration-200 font-medium"
                >
                  Continue Sacred Dialogue
                </button>
                
                <button
                  onClick={() => setMode('welcome')}
                  className="block mx-auto px-6 py-2 text-white/70 hover:text-white/90 transition-colors text-sm"
                >
                  Return to Welcome
                </button>
              </div>

              {isAuthenticated && (
                <div className="pt-8 text-sm text-white/50">
                  <p>🌿 Conversation saved to your sacred memory</p>
                  <p>🧙‍♀️ Maia's understanding of your journey has deepened</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Save Prompt DISABLED - Legacy code to be removed */}
      {/* <MemorySavePrompt
        isOpen={showMemorySavePrompt}
        onClose={() => setShowMemorySavePrompt(false)}
        conversationContent={conversationToSave}
        onSave={handleMemorySaved}
      /> */}
    </div>
  );
}