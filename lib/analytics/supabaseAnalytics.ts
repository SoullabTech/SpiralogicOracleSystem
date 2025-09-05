import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/supabase';
import { AnalyticsEvent, AnalyticsEventType } from './types';

// Supabase client for analytics (separate from main app client)
let analyticsClient: any = null;

function getAnalyticsClient() {
  if (!analyticsClient) {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      analyticsClient = createClient(config.url, config.anonKey);
    }
  }
  return analyticsClient;
}

// Session management
let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;

export function startAnalyticsSession(userId?: string): string {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  currentSessionId = sessionId;
  sessionStartTime = Date.now();
  
  // Log session start
  trackEvent('session_start', {
    user_id: userId,
    timestamp: new Date().toISOString(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  });

  return sessionId;
}

export function endAnalyticsSession(metrics?: any) {
  if (!currentSessionId) return;

  const sessionDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;
  
  trackEvent('session_end', {
    session_duration_ms: sessionDuration,
    ...metrics
  });

  currentSessionId = null;
  sessionStartTime = null;
}

export function getCurrentSessionId(): string {
  if (!currentSessionId) {
    return startAnalyticsSession();
  }
  return currentSessionId;
}

// Core analytics function
export async function trackEvent(
  eventType: AnalyticsEventType, 
  eventData: Record<string, any> = {},
  sessionId?: string
): Promise<void> {
  try {
    const client = getAnalyticsClient();
    if (!client) {
      // Fallback to console logging in demo mode
      console.log('[Analytics]', eventType, eventData);
      return;
    }

    const event: AnalyticsEvent = {
      session_id: sessionId || getCurrentSessionId(),
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      user_id: eventData.user_id || undefined
    };

    // Remove user_id from event_data to avoid duplication
    if (event.event_data.user_id) {
      delete event.event_data.user_id;
    }

    const { error } = await client
      .from('analytics_events')
      .insert([event]);

    if (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics should never break the app
    }

  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Don't throw - analytics should never break the app
  }
}

// Convenience functions for common events
export const Analytics = {
  // Interaction tracking
  startInteraction: (mode: 'voice' | 'text', data?: any) => 
    trackEvent('interaction_start', { mode, ...data }),
  
  completeInteraction: (mode: 'voice' | 'text', metrics: any) =>
    trackEvent('interaction_complete', { mode, ...metrics }),

  // Voice flow tracking
  startRecording: (data?: any) =>
    trackEvent('voice_recording_start', data),
  
  stopRecording: (metrics: any) =>
    trackEvent('voice_recording_stop', metrics),
  
  recordingError: (error: any) =>
    trackEvent('voice_recording_error', { error_type: error.type || 'unknown', error_message: error.message }),

  // Transcription tracking
  transcriptionSuccess: (metrics: any) =>
    trackEvent('transcription_success', metrics),
  
  transcriptionError: (error: any) =>
    trackEvent('transcription_error', { error_type: error.type || 'unknown', error_message: error.message }),

  // Maya response tracking
  startMayaResponse: (data?: any) =>
    trackEvent('maya_response_start', data),
  
  completeMayaResponse: (metrics: any) =>
    trackEvent('maya_response_complete', metrics),
  
  mayaResponseError: (error: any) =>
    trackEvent('maya_response_error', { error_type: error.type || 'unknown', error_message: error.message }),

  // TTS tracking
  startTTS: (provider: string, data?: any) =>
    trackEvent('tts_start', { provider, ...data }),
  
  ttsSuccess: (provider: string, metrics: any) =>
    trackEvent('tts_success', { provider, ...metrics }),
  
  ttsError: (provider: string, error: any) =>
    trackEvent('tts_error', { 
      provider, 
      error_type: error.type || 'unknown', 
      error_message: error.message 
    }),

  // Playback tracking
  startPlayback: (provider: string, data?: any) =>
    trackEvent('tts_playback_start', { provider, ...data }),
  
  completePlayback: (provider: string, metrics: any) =>
    trackEvent('tts_playback_complete', { provider, ...metrics }),
  
  playbackError: (provider: string, error: any) =>
    trackEvent('tts_playback_error', { 
      provider, 
      error_type: error.type || 'unknown', 
      error_message: error.message 
    }),

  // Page tracking
  pageView: (path: string, data?: any) =>
    trackEvent('page_view', { path, ...data }),

  // Session management
  startSession: startAnalyticsSession,
  endSession: endAnalyticsSession,
  getCurrentSession: getCurrentSessionId
};