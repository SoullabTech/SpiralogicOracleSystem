// Voice Flow Analytics - Beta Testing Metrics
import { supabase } from '@/lib/supabase';

export type InteractionMode = 'voice' | 'text';
export type TTSProvider = 'Sesame' | 'ElevenLabs' | 'fallback_failed';
export type VoiceFlowStage = 'recording' | 'transcription' | 'processing' | 'speaking' | 'complete' | 'error';

export interface VoiceFlowEvent {
  session_id: string;
  user_id?: string;
  event_type: 'flow_start' | 'flow_complete' | 'flow_error' | 'provider_switch' | 'interaction' | 'session_metrics';
  stage?: VoiceFlowStage;
  interaction_mode: InteractionMode;
  tts_provider?: TTSProvider;
  metadata?: {
    // Recording metrics
    recording_duration_ms?: number;
    audio_size_bytes?: number;
    
    // Transcription metrics
    transcript_length?: number;
    stt_confidence?: number;
    
    // Response metrics
    response_latency_ms?: number;
    response_length?: number;
    
    // TTS metrics
    tts_latency_ms?: number;
    audio_file_size?: number;
    playback_success?: boolean;
    
    // Error details
    error_type?: string;
    error_message?: string;
    
    // Session metrics
    total_interactions?: number;
    session_duration_ms?: number;
    voice_interactions?: number;
    text_interactions?: number;
  };
  created_at?: string;
}

export class VoiceFlowAnalytics {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: number;
  private interactionCount = 0;
  private voiceInteractions = 0;
  private textInteractions = 0;
  private currentFlowStartTime?: number;

  constructor(sessionId?: string, userId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
    this.userId = userId;
    this.sessionStartTime = Date.now();
    
    // Track session start
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'session_metrics',
      interaction_mode: 'voice', // Will be updated based on first interaction
      metadata: {
        session_duration_ms: 0,
        total_interactions: 0
      }
    });
  }

  private generateSessionId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async trackEvent(event: Omit<VoiceFlowEvent, 'created_at'>) {
    try {
      const { error } = await supabase
        .from('voice_flow_analytics')
        .insert({
          ...event,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('📊 [VoiceFlowAnalytics] Failed to track event:', error);
      } else {
        console.log('📊 [VoiceFlowAnalytics] Event tracked:', event.event_type, event.stage);
      }
    } catch (err) {
      console.warn('📊 [VoiceFlowAnalytics] Analytics error:', err);
    }
  }

  // Voice Flow Tracking
  startVoiceFlow(mode: InteractionMode) {
    this.currentFlowStartTime = Date.now();
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'flow_start',
      stage: 'recording',
      interaction_mode: mode
    });
  }

  trackRecordingComplete(durationMs: number, audioSizeBytes: number) {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'interaction',
      stage: 'transcription',
      interaction_mode: 'voice',
      metadata: {
        recording_duration_ms: durationMs,
        audio_size_bytes: audioSizeBytes
      }
    });
  }

  trackTranscriptionComplete(transcript: string, confidence?: number) {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'interaction',
      stage: 'processing',
      interaction_mode: 'voice',
      metadata: {
        transcript_length: transcript.length,
        stt_confidence: confidence
      }
    });
  }

  trackResponseComplete(responseText: string, latencyMs: number) {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'interaction',
      stage: 'speaking',
      interaction_mode: 'voice',
      metadata: {
        response_latency_ms: latencyMs,
        response_length: responseText.length
      }
    });
  }

  trackTTSComplete(provider: TTSProvider, latencyMs: number, fileSizeBytes?: number, playbackSuccess: boolean = true) {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'interaction',
      stage: 'complete',
      interaction_mode: 'voice',
      tts_provider: provider,
      metadata: {
        tts_latency_ms: latencyMs,
        audio_file_size: fileSizeBytes,
        playback_success
      }
    });

    // Track complete flow
    if (this.currentFlowStartTime) {
      const totalFlowTime = Date.now() - this.currentFlowStartTime;
      this.trackEvent({
        session_id: this.sessionId,
        user_id: this.userId,
        event_type: 'flow_complete',
        interaction_mode: 'voice',
        tts_provider: provider,
        metadata: {
          response_latency_ms: totalFlowTime
        }
      });
    }
  }

  trackTextInteraction(inputText: string, responseText: string, latencyMs: number) {
    this.textInteractions++;
    this.interactionCount++;
    
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'interaction',
      stage: 'complete',
      interaction_mode: 'text',
      metadata: {
        transcript_length: inputText.length,
        response_length: responseText.length,
        response_latency_ms: latencyMs
      }
    });
  }

  trackVoiceInteraction() {
    this.voiceInteractions++;
    this.interactionCount++;
  }

  trackError(stage: VoiceFlowStage, errorType: string, errorMessage: string, mode: InteractionMode = 'voice') {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'flow_error',
      stage,
      interaction_mode: mode,
      metadata: {
        error_type: errorType,
        error_message: errorMessage
      }
    });
  }

  trackProviderSwitch(fromProvider: TTSProvider, toProvider: TTSProvider, reason: string) {
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'provider_switch',
      interaction_mode: 'voice',
      tts_provider: toProvider,
      metadata: {
        error_type: `switch_from_${fromProvider}`,
        error_message: reason
      }
    });
  }

  updateSessionMetrics() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.trackEvent({
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'session_metrics',
      interaction_mode: this.voiceInteractions > this.textInteractions ? 'voice' : 'text',
      metadata: {
        session_duration_ms: sessionDuration,
        total_interactions: this.interactionCount,
        voice_interactions: this.voiceInteractions,
        text_interactions: this.textInteractions
      }
    });
  }

  // Getters for external use
  getSessionId(): string {
    return this.sessionId;
  }

  getMetrics() {
    return {
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      totalInteractions: this.interactionCount,
      voiceInteractions: this.voiceInteractions,
      textInteractions: this.textInteractions,
      preferredMode: this.voiceInteractions > this.textInteractions ? 'voice' : 'text'
    };
  }
}

// Export singleton instance for global use
export const voiceFlowAnalytics = new VoiceFlowAnalytics();