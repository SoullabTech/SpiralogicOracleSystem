/**
 * Beta Testing Analytics Tracker
 * Logs events to Supabase for live dashboard monitoring
 */

import { createClient } from '@/lib/supabase/client';

// Check if we're in mock mode
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_SUPABASE === 'true';

export class BetaTracker {
  private supabase = MOCK_MODE ? null : createClient();
  private userId: string | null = null;
  private sessionId: string | null = null;
  private sessionStartTime: Date | null = null;

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('beta_user_id');
      this.sessionId = localStorage.getItem('current_session_id');
      
      // Start session tracking
      this.startSession();
    }
  }

  /**
   * Initialize beta tester profile
   */
  async initBetaTester(userId: string, metadata: {
    username?: string;
    email?: string;
    preferredElement?: string;
    consentAnalytics?: boolean;
  }) {
    this.userId = userId;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('beta_user_id', userId);
    }

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping beta tester init');
      return;
    }
    
    try {
      await this.supabase
        .from('beta_testers')
        .upsert({
          user_id: userId,
          username: metadata.username,
          email: metadata.email,
          preferred_element: metadata.preferredElement || 'aether',
          consent_analytics: metadata.consentAnalytics || false,
          last_active: new Date().toISOString(),
          metadata: {
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            screen: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.warn('Failed to initialize beta tester profile:', error);
    }
  }

  /**
   * Start a new session
   */
  async startSession() {
    if (!this.userId) return;

    this.sessionId = `session-${this.userId}-${Date.now()}`;
    this.sessionStartTime = new Date();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_session_id', this.sessionId);
    }

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping session start');
      return;
    }
    
    try {
      await this.supabase
        .from('user_sessions')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          metadata: {
            page: typeof window !== 'undefined' ? window.location.pathname : null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null
          }
        });
    } catch (error) {
      console.warn('Failed to start session tracking:', error);
    }
  }

  /**
   * Update session with interaction data
   */
  async updateSession(data: {
    interactionCount?: number;
    voiceUsed?: boolean;
    durationMinutes?: number;
    metadata?: any;
  }) {
    if (!this.userId || !this.sessionId) return;

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping session update');
      return;
    }
    
    try {
      await this.supabase
        .from('user_sessions')
        .update({
          interaction_count: data.interactionCount,
          voice_used: data.voiceUsed,
          duration_minutes: data.durationMinutes,
          metadata: data.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.warn('Failed to update session:', error);
    }
  }

  /**
   * Track voice event (STT/TTS)
   */
  async trackVoiceEvent(eventType: 'stt' | 'tts' | 'permission', data: {
    success: boolean;
    latencyMs?: number;
    errorMessage?: string;
    metadata?: any;
  }) {
    if (!this.userId || !this.sessionId) return;

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping voice event');
      return;
    }

    try {
      await this.supabase
        .from('voice_events')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          event_type: eventType,
          success: data.success,
          latency_ms: data.latencyMs,
          error_message: data.errorMessage,
          metadata: data.metadata || {}
        });
    } catch (error) {
      console.warn('Failed to track voice event:', error);
    }
  }

  /**
   * Track memory operation
   */
  async trackMemoryEvent(operationType: 'load' | 'persist' | 'search', layerType: 'session' | 'journal' | 'profile' | 'symbolic' | 'external', data: {
    success: boolean;
    latencyMs?: number;
    contextSize?: number;
    errorMessage?: string;
    metadata?: any;
  }) {
    if (!this.userId || !this.sessionId) return;

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping memory event');
      return;
    }
    
    try {
      await this.supabase
        .from('memory_events')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          operation_type: operationType,
          layer_type: layerType,
          success: data.success,
          latency_ms: data.latencyMs,
          context_size: data.contextSize,
          error_message: data.errorMessage,
          metadata: data.metadata || {}
        });
    } catch (error) {
      console.warn('Failed to track memory event:', error);
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(data: {
    rating: number;
    feedbackText: string;
    category?: 'voice' | 'memory' | 'experience' | 'technical' | 'general';
    metadata?: any;
  }) {
    if (!this.userId) return;

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping feedback');
      return;
    }
    
    try {
      await this.supabase
        .from('beta_feedback')
        .insert({
          user_id: this.userId,
          session_id: this.sessionId,
          rating: data.rating,
          feedback_text: data.feedbackText,
          category: data.category || 'general',
          metadata: data.metadata || {}
        });
      
      // Trigger dashboard refresh
      console.log('Beta feedback submitted successfully');
      
    } catch (error) {
      console.warn('Failed to submit feedback:', error);
    }
  }

  /**
   * End current session
   */
  async endSession() {
    if (!this.userId || !this.sessionId || !this.sessionStartTime) return;

    const duration = Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 60000); // Minutes

    if (MOCK_MODE || !this.supabase) {
      console.log('📦 [BetaTracker] Mock mode - skipping session end');
      return;
    }
    
    try {
      await this.supabase
        .from('user_sessions')
        .update({
          duration_minutes: duration,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', this.sessionId);

      // Update beta tester last active
      if (!MOCK_MODE && this.supabase) {
        await this.supabase
          .from('beta_testers')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('user_id', this.userId);
      }
    } catch (error) {
      console.warn('Failed to end session:', error);
    }

    // Clear session data
    this.sessionId = null;
    this.sessionStartTime = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_session_id');
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime
    };
  }
}

// Singleton instance
export const betaTracker = new BetaTracker();

// Automatic session management
if (typeof window !== 'undefined') {
  // End session on page unload
  window.addEventListener('beforeunload', () => {
    betaTracker.endSession();
  });

  // Handle visibility changes (user switching tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // User returned to tab - could start new session or resume
      const sessionInfo = betaTracker.getSessionInfo();
      if (!sessionInfo.sessionId) {
        betaTracker.startSession();
      }
    }
  });
}