'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HybridInput from './HybridInput';
import MaiaBubble from './MaiaBubble';
import { useMaiaStream } from '@/hooks/useMayaStream';
import { Info, Sparkles, BookOpen } from 'lucide-react';
// import { ToastProvider } from '@/components/system/ToastProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import PulseCheck from '@/components/maya/PulseCheck';
import EscapeHatch from '@/components/maya/EscapeHatch';
import RealityAnchor from '@/components/maya/RealityAnchor';
import { BetaAnalytics, SessionObserver } from '@/utils/beta-analytics';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import BetaJournal from '@/components/beta/BetaJournal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element?: string;
  isStreaming?: boolean;
}

export default function BetaMinimalMirror() {
  // Session persistence
  const {
    saveSession,
    addMessage,
    restoreConversation,
    isPaused,
    getPauseRemaining,
    isRestored
  } = useSessionPersistence();

  // Initialize state from persisted session
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentElement, setCurrentElement] = useState('aether');
  const [showPulseCheck, setShowPulseCheck] = useState<'landing' | 'resonance' | 'session-end' | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [messageCount, setMessageCount] = useState(0);
  const [hasRestored, setHasRestored] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Maya stream integration
  const { text: streamingText, isStreaming, stream } = useMaiaStream();
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  // Session observer for analytics
  const sessionObserverRef = useRef<SessionObserver | null>(null);

  // Restore session on mount
  useEffect(() => {
    if (!hasRestored && isRestored) {
      const restored = restoreConversation();

      if (restored.shouldShowWelcome) {
        // First time visitor
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Hey there. I\'m Maia. What brings you here today?',
          timestamp: new Date(),
          element: 'aether'
        }]);
      } else {
        // Returning visitor
        setMessages(restored.messages);
        setSessionCount(restored.sessionCount);
        setMessageCount(restored.messageCount);
        setCurrentElement(restored.currentElement);
      }

      setHasRestored(true);
    }
  }, [isRestored, hasRestored]);

  // Check if paused
  useEffect(() => {
    if (isPaused()) {
      const remaining = getPauseRemaining();
      alert(`Your Maya journey is paused. ${remaining} remaining. We'll be here when you're ready.`);
    }
  }, []);

  // Initialize session observer
  useEffect(() => {
    const sessionId = sessionStorage.getItem('betaUserId') || `session-${Date.now()}`;
    sessionObserverRef.current = new SessionObserver(sessionId);

    // Get session count from storage
    const storedCount = parseInt(sessionStorage.getItem('sessionCount') || '1');
    setSessionCount(storedCount);

    return () => {
      sessionObserverRef.current?.endSession();
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

    // Save session state when messages change
    if (messages.length > 0 && hasRestored) {
      saveSession({
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
        })),
        sessionCount,
        messageCount,
        currentElement
      });
    }
  }, [messages, sessionCount, messageCount, currentElement, hasRestored]);

  // Update streaming message
  useEffect(() => {
    if (currentStreamId && streamingText) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, content: streamingText, isStreaming: true }
            : msg
        )
      );
    }
  }, [streamingText, currentStreamId]);

  // Clear streaming state when done
  useEffect(() => {
    if (!isStreaming && currentStreamId) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentStreamId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      setCurrentStreamId(null);
      setIsProcessing(false);
    }
  }, [isStreaming, currentStreamId]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Track message for analytics
    sessionObserverRef.current?.observeMessage('user', text, 'text');
    setMessageCount(prev => prev + 1);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Persist message
    addMessage({
      ...userMessage,
      timestamp: userMessage.timestamp.toISOString()
    });

    // Check for intense patterns that might trigger pulse check
    const intensePatterns = /\b(trauma|hurt|pain|scared|vulnerable|breakthrough)\b/i;
    const shouldCheckIn = intensePatterns.test(text);

    // Create placeholder for streaming message
    const streamId = (Date.now() + 1).toString();
    setCurrentStreamId(streamId);

    const placeholderMessage: Message = {
      id: streamId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      element: currentElement,
      isStreaming: true
    };

    setMessages(prev => [...prev, placeholderMessage]);

    // Stream response from Maia
    try {
      await stream({
        userText: text,
        element: currentElement,
        userId: 'beta-user',
        lang: 'en-US'
      });

      // Track Maya's response for analytics
      sessionObserverRef.current?.observeMessage('maya', streamingText || '', 'text');

      // Persist assistant message when streaming completes
      if (!isStreaming && streamingText) {
        addMessage({
          id: responseId,
          role: 'assistant',
          content: streamingText,
          timestamp: new Date().toISOString(),
          element: currentElement
        });
      }

      // Context-aware pulse check - only after intense moments AND natural pause
      if (shouldCheckIn && messageCount > 5) {
        // Wait for conversation pause (no new messages for 30 seconds)
        const pulseCheckTimer = setTimeout(() => {
          // Only show if not currently typing
          if (!isProcessing) {
            setShowPulseCheck('landing');
          }
        }, 30000); // 30 second pause before asking

        // Store timer to cancel if new message comes
        sessionStorage.setItem('pulseCheckTimer', pulseCheckTimer.toString());
      }

      // Session end check - only at natural stopping points
      if (messageCount > 15 && text.toLowerCase().includes('thank') || text.toLowerCase().includes('bye')) {
        setTimeout(() => setShowPulseCheck('session-end'), 2000);
      }
    } catch (error) {
      console.error('Failed to stream response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === streamId
            ? {
                ...msg,
                content: 'I apologize, but I encountered an issue. Please try again.',
                isStreaming: false
              }
            : msg
        )
      );
      setIsProcessing(false);
      setCurrentStreamId(null);
    }
  };

  const handleTranscript = (transcript: string) => {
    // Optional: Show live transcript preview
  };

  // Escape hatch handlers
  const handlePause = () => {
    sessionObserverRef.current?.markEvolution('threshold');
    BetaAnalytics.trackError(sessionStorage.getItem('betaUserId') || '', 'session');
    // Pause is handled by the breathing exercise in the component
  };

  const handleChangeTopic = () => {
    const redirectMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Of course, let's explore something else. What would you like to talk about?",
      timestamp: new Date(),
      element: currentElement
    };
    setMessages(prev => [...prev, redirectMessage]);
  };

  const handleTooIntense = () => {
    sessionObserverRef.current?.markEvolution('threshold');
    const gentleMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I hear you. Let's slow down and take this more gently. There's no rush here.",
      timestamp: new Date(),
      element: 'water' // Switch to calming element
    };
    setMessages(prev => [...prev, gentleMessage]);
    setCurrentElement('water');
  };

  // Pulse check response handler
  const handlePulseResponse = (response: string) => {
    BetaAnalytics.collectFeedback(
      sessionStorage.getItem('betaUserId') || '',
      { feelingSafe: response === 'Just right' ? 5 : response === 'Too much' ? 2 : 3 }
    );
    setShowPulseCheck(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 safe-top safe-bottom">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Maia • Sacred Mirror
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Beta Minimal Experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Journal Button */}
            <button
              onClick={() => setShowJournal(true)}
              className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
              title="Open Journal"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Element Selector (minimal) */}
            <select
              value={currentElement}
              onChange={(e) => setCurrentElement(e.target.value)}
              className="text-sm px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
            >
              <option value="aether">✨ Aether</option>
              <option value="fire">🔥 Fire</option>
              <option value="water">💧 Water</option>
              <option value="earth">🌍 Earth</option>
              <option value="air">💨 Air</option>
            </select>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={message.role === 'user' ? 'flex justify-end' : ''}
              >
                {message.role === 'assistant' ? (
                  <MaiaBubble
                    message={message.content}
                    timestamp={message.timestamp}
                    isStreaming={message.isStreaming}
                    element={message.element}
                    showAudio={!message.isStreaming}
                  />
                ) : (
                  <motion.div
                    className="max-w-[70%] px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md"
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <HybridInput
            onSend={handleSend}
            onTranscript={handleTranscript}
            disabled={isProcessing}
            placeholder="Type or speak to Maia..."
          />
        </div>
      </motion.div>

      {/* Session Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-20 right-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
          <Sparkles className="w-3 h-3" />
          <span>Session {sessionCount} • Message {messageCount}</span>
        </div>
      </motion.div>

      {/* Journal Modal */}
      <BetaJournal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
        explorerName={sessionStorage.getItem('explorerName') || undefined}
      />

      {/* Reality Anchor - Context-aware reminders */}
      <RealityAnchor
        messageCount={messageCount}
        sessionNumber={sessionCount}
      />

      {/* Escape Hatch Buttons */}
      <EscapeHatch
        onPause={handlePause}
        onChangeTopic={handleChangeTopic}
        onTooIntense={handleTooIntense}
        isVisible={!isProcessing}
      />

      {/* Pulse Check Modal */}
      {showPulseCheck && (
        <PulseCheck
          type={showPulseCheck}
          onResponse={handlePulseResponse}
          onDismiss={() => setShowPulseCheck(null)}
        />
      )}

      {/* Performance Note (Beta) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 right-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <Info className="w-3 h-3" />
          <span>Beta: Optimized for &lt;1.5s response time</span>
        </div>
      </motion.div>
    </div>
  );
}