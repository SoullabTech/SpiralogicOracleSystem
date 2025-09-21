/**
 * Client-side session persistence hook for Maya Beta
 * Maintains conversation state across page refreshes without backend dependencies
 */

import { useEffect, useState } from 'react';

interface PersistedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  element?: string;
}

interface SessionState {
  messages: PersistedMessage[];
  sessionCount: number;
  messageCount: number;
  currentElement: string;
  lastActivity: string;
  explorerName: string;
  explorerId: string;
}

export function useSessionPersistence() {
  const STORAGE_KEY = 'maya-session-state';
  const EXPIRY_HOURS = 24;

  const [isRestored, setIsRestored] = useState(false);

  /**
   * Save session state
   */
  const saveSession = (state: Partial<SessionState>) => {
    try {
      const existing = getSession();
      const updated: SessionState = {
        messages: existing?.messages || [],
        sessionCount: existing?.sessionCount || 1,
        messageCount: existing?.messageCount || 0,
        currentElement: existing?.currentElement || 'aether',
        explorerName: sessionStorage.getItem('explorerName') || '',
        explorerId: sessionStorage.getItem('explorerId') || '',
        ...state,
        lastActivity: new Date().toISOString()
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  /**
   * Get session state
   */
  const getSession = (): SessionState | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored) as SessionState;

      // Check if session is expired
      const lastActivity = new Date(session.lastActivity);
      const hoursElapsed = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursElapsed > EXPIRY_HOURS) {
        clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  };

  /**
   * Clear session
   */
  const clearSession = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Add a message to the session
   */
  const addMessage = (message: PersistedMessage) => {
    const session = getSession() || {
      messages: [],
      sessionCount: 1,
      messageCount: 0,
      currentElement: 'aether',
      lastActivity: new Date().toISOString(),
      explorerName: sessionStorage.getItem('explorerName') || '',
      explorerId: sessionStorage.getItem('explorerId') || ''
    };

    // Keep only last 50 messages to prevent overflow
    const messages = [...session.messages, message].slice(-50);

    saveSession({
      ...session,
      messages,
      messageCount: session.messageCount + 1
    });
  };

  /**
   * Restore conversation on mount
   */
  const restoreConversation = () => {
    const session = getSession();

    if (!session || !session.messages.length) {
      // No previous session or empty
      setIsRestored(true);
      return {
        messages: [],
        sessionCount: 1,
        messageCount: 0,
        currentElement: 'aether',
        shouldShowWelcome: true
      };
    }

    // Convert stored messages to proper format
    const messages = session.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    setIsRestored(true);

    // If last message was more than 1 hour ago, increment session count
    const lastMessage = messages[messages.length - 1];
    const hoursSinceLastMessage =
      (Date.now() - new Date(lastMessage.timestamp).getTime()) / (1000 * 60 * 60);

    const sessionCount = hoursSinceLastMessage > 1
      ? session.sessionCount + 1
      : session.sessionCount;

    // Add a welcome back message if returning after break
    if (hoursSinceLastMessage > 1) {
      messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Welcome back. Let\'s continue where we left off.',
        timestamp: new Date(),
        element: session.currentElement
      } as any);
    }

    return {
      messages,
      sessionCount,
      messageCount: session.messageCount,
      currentElement: session.currentElement,
      shouldShowWelcome: false
    };
  };

  /**
   * Check if user is paused
   */
  const isPaused = (): boolean => {
    const pausedUntil = sessionStorage.getItem('pausedUntil');
    if (!pausedUntil) return false;

    const pauseDate = new Date(pausedUntil);
    return pauseDate > new Date();
  };

  /**
   * Get pause remaining
   */
  const getPauseRemaining = (): string => {
    const pausedUntil = sessionStorage.getItem('pausedUntil');
    if (!pausedUntil) return '';

    const pauseDate = new Date(pausedUntil);
    const now = new Date();

    if (pauseDate <= now) {
      sessionStorage.removeItem('pausedUntil');
      sessionStorage.removeItem('betaPaused');
      return '';
    }

    const daysRemaining = Math.ceil(
      (pauseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
  };

  // Auto-save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const session = getSession();
      if (session) {
        saveSession(session);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    saveSession,
    getSession,
    clearSession,
    addMessage,
    restoreConversation,
    isPaused,
    getPauseRemaining,
    isRestored
  };
}