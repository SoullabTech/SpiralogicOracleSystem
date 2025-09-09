'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';
import { MemorySavePrompt } from '@/components/auth/MemorySavePrompt';
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
}

export function ConversationFlow({ initialMode = 'welcome' }: ConversationFlowProps) {
  const { isAuthenticated, user } = useAuth();
  const { saveMemory, hasPendingMemory } = useConversationMemory();
  
  const [mode, setMode] = useState<'welcome' | 'conversation' | 'reflection'>(initialMode);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);
  const [showMemorySavePrompt, setShowMemorySavePrompt] = useState(false);
  const [conversationToSave, setConversationToSave] = useState<string>('');

  // Start a new conversation session
  const startConversation = () => {
    const newSession: ConversationSession = {
      id: `session_${Date.now()}`,
      messages: [],
      startedAt: new Date().toISOString(),
      isActive: true
    };
    setCurrentSession(newSession);
    setMode('conversation');
  };

  // Handle conversation completion
  const handleConversationEnd = async (finalTranscript: string) => {
    if (!currentSession) return;

    // Update session with final state
    const completedSession = {
      ...currentSession,
      isActive: false
    };
    setCurrentSession(completedSession);

    // Generate conversation summary
    const conversationSummary = generateConversationSummary(completedSession, finalTranscript);
    setConversationToSave(conversationSummary);

    // Auto-save for authenticated users, prompt for anonymous users
    if (isAuthenticated) {
      await saveMemoryFromConversation(conversationSummary, completedSession.id);
      setMode('reflection');
    } else {
      setShowMemorySavePrompt(true);
    }
  };

  // Generate a meaningful conversation summary
  const generateConversationSummary = (session: ConversationSession, finalTranscript?: string): string => {
    const duration = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / (1000 * 60)
    );

    let summary = `Sacred dialogue with Maya (${duration} minutes)\n\n`;
    
    if (finalTranscript) {
      summary += `Conversation essence: ${finalTranscript}\n\n`;
    }

    if (session.messages.length > 0) {
      summary += 'Key exchanges:\n';
      session.messages.slice(-3).forEach((msg, index) => {
        summary += `${msg.role === 'user' ? 'Seeker' : 'Maya'}: ${msg.content.slice(0, 100)}...\n`;
      });
    }

    return summary;
  };

  // Save memory with appropriate metadata
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
      transformation: ['change', 'transform', 'evolve', 'growth', 'shift'],
      healing: ['heal', 'pain', 'wound', 'recovery', 'wholeness'],
      purpose: ['purpose', 'calling', 'mission', 'meaning', 'destiny'],
      relationships: ['relationship', 'love', 'connection', 'family', 'partner'],
      creativity: ['create', 'art', 'express', 'imagination', 'inspiration'],
      spirituality: ['spirit', 'soul', 'divine', 'sacred', 'prayer', 'meditation'],
      fear: ['fear', 'anxiety', 'worry', 'afraid', 'terror'],
      joy: ['joy', 'happy', 'delight', 'celebration', 'bliss'],
      wisdom: ['wisdom', 'insight', 'understanding', 'clarity', 'truth'],
      shadow: ['shadow', 'dark', 'hidden', 'suppressed', 'denied']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    });

    return themes.slice(0, 5); // Limit to 5 most relevant themes
  };

  // Detect elemental resonance
  const detectElementalResonance = (content: string): string | undefined => {
    const lowerContent = content.toLowerCase();
    
    const elementalKeywords = {
      earth: ['ground', 'body', 'practical', 'stable', 'foundation', 'material', 'physical'],
      water: ['feel', 'emotion', 'flow', 'intuition', 'dream', 'heart', 'fluid'],
      fire: ['passion', 'energy', 'vision', 'transform', 'action', 'will', 'power'],
      air: ['think', 'idea', 'communicate', 'mental', 'breath', 'clarity', 'perspective']
    };

    let maxCount = 0;
    let dominantElement: string | undefined;

    Object.entries(elementalKeywords).forEach(([element, keywords]) => {
      const count = keywords.reduce((sum, keyword) => {
        return sum + (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
      }, 0);
      
      if (count > maxCount) {
        maxCount = count;
        dominantElement = element;
      }
    });

    return maxCount > 2 ? dominantElement : undefined;
  };

  // Detect emotional tone
  const detectEmotionalTone = (content: string): string => {
    const lowerContent = content.toLowerCase();
    
    if (['pain', 'hurt', 'sad', 'grief', 'loss'].some(word => lowerContent.includes(word))) {
      return 'melancholic';
    }
    if (['joy', 'happy', 'excited', 'celebrate'].some(word => lowerContent.includes(word))) {
      return 'joyful';
    }
    if (['peace', 'calm', 'serene', 'tranquil'].some(word => lowerContent.includes(word))) {
      return 'peaceful';
    }
    if (['curious', 'wonder', 'explore', 'question'].some(word => lowerContent.includes(word))) {
      return 'curious';
    }
    if (['hope', 'optimistic', 'bright', 'possibility'].some(word => lowerContent.includes(word))) {
      return 'hopeful';
    }
    
    return 'reflective';
  };

  // Handle successful memory save and account creation
  const handleMemorySaved = () => {
    setShowMemorySavePrompt(false);
    setMode('reflection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
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

          {mode === 'conversation' && (
            <motion.div
              key="conversation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Replace with your actual conversation component */}
              <div className="text-center space-y-8">
                <h2 className="text-2xl text-white/90">Sacred Conversation Active</h2>
                <p className="text-white/70">
                  Your conversation interface would be rendered here
                </p>
                {/* Example integration point:
                <OracleConversation
                  sessionId={currentSession?.id}
                  onConversationEnd={handleConversationEnd}
                  onMessageAdded={(message) => {
                    if (currentSession) {
                      setCurrentSession({
                        ...currentSession,
                        messages: [...currentSession.messages, message]
                      });
                    }
                  }}
                />
                */}
                
                {/* Temporary end conversation button for testing */}
                <button
                  onClick={() => handleConversationEnd('This was a meaningful dialogue about life purpose and spiritual growth.')}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
                >
                  End Conversation (Test)
                </button>
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
              className="text-center space-y-8"
            >
              <div className="text-6xl">✨</div>
              <h2 className="text-2xl font-light text-white/90">
                Sacred Reflection Preserved
              </h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Your dialogue with Maya has been woven into the tapestry of your sacred journey. 
                These insights will inform future conversations and deepen your path of remembrance.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={startConversation}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full transition-all duration-200"
                >
                  Continue Sacred Dialogue
                </button>
                
                <button
                  onClick={() => setMode('welcome')}
                  className="block mx-auto px-6 py-2 text-white/70 hover:text-white/90 transition-colors"
                >
                  Return to Welcome
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Memory Save Prompt for Anonymous Users */}
      <MemorySavePrompt
        isOpen={showMemorySavePrompt}
        onClose={() => setShowMemorySavePrompt(false)}
        conversationContent={conversationToSave}
        onSave={handleMemorySaved}
      />
    </div>
  );
}