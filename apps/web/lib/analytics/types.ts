// Analytics event types for beta testing metrics
export interface AnalyticsEvent {
  id?: string;
  session_id: string;
  user_id?: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, any>;
  timestamp: string;
  created_at?: string;
}

export type AnalyticsEventType = 
  | 'interaction_start'
  | 'interaction_complete'
  | 'voice_recording_start'
  | 'voice_recording_stop'
  | 'voice_recording_error'
  | 'transcription_success'
  | 'transcription_error'
  | 'maya_response_start'
  | 'maya_response_complete' 
  | 'maya_response_error'
  | 'tts_start'
  | 'tts_success'
  | 'tts_error'
  | 'tts_playback_start'
  | 'tts_playback_complete'
  | 'tts_playback_error'
  | 'session_start'
  | 'session_end'
  | 'page_view';

export interface InteractionMetrics {
  mode: 'voice' | 'text';
  input_length?: number;
  response_length?: number;
  latency_ms?: number;
  success: boolean;
  error_type?: string;
  error_message?: string;
}

export interface VoiceMetrics {
  recording_duration_ms?: number;
  audio_size_bytes?: number;
  transcription_confidence?: number;
  transcription_duration_ms?: number;
}

export interface TTSMetrics {
  provider: 'Sesame' | 'ElevenLabs' | 'fallback_failed';
  generation_duration_ms?: number;
  audio_duration_ms?: number;
  playback_success: boolean;
  fallback_triggered?: boolean;
}

export interface SessionMetrics {
  session_duration_ms?: number;
  total_interactions: number;
  voice_interactions: number;
  text_interactions: number;
  successful_interactions: number;
  failed_interactions: number;
  avg_response_latency_ms?: number;
}

export interface ErrorMetrics {
  error_type: 'mic_denied' | 'empty_audio' | 'whisper_fail' | 'audio_file_missing' | 'playback_error' | 'network_error' | 'api_error' | 'unknown';
  error_message: string;
  stack_trace?: string;
  user_agent?: string;
  component: string;
}