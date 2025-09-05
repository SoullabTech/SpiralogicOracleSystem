import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/supabase';

export interface DashboardData {
  overview: BetaOverview[];
  voiceFunnel: VoiceFunnel;
  ttsProviders: TTSProviderData[];
  userPatterns: UserPatterns;
  errors: ErrorData[];
  recentActivity: ActivityEvent[];
  performanceTrends: PerformanceTrend[];
}

export interface BetaOverview {
  hour: string;
  day: string;
  active_sessions: number;
  total_interactions: number;
  voice_interactions: number;
  text_interactions: number;
  total_errors: number;
  interaction_success_rate: number;
  voice_playback_success_rate: number;
  avg_response_latency_ms: number;
  sesame_successes: number;
  elevenlabs_successes: number;
  sesame_errors: number;
  elevenlabs_errors: number;
}

export interface VoiceFunnel {
  total_sessions: number;
  step1_recording_started: number;
  step2_recording_completed: number;
  step3_transcription_success: number;
  step4_response_generated: number;
  step5_tts_generated: number;
  step6_playback_completed: number;
  recording_completion_rate: number;
  transcription_success_rate: number;
  response_generation_rate: number;
  tts_generation_rate: number;
  playback_completion_rate: number;
  end_to_end_completion_rate: number;
  recording_error_rate: number;
  transcription_error_rate: number;
  response_error_rate: number;
  tts_error_rate: number;
  playback_error_rate: number;
}

export interface TTSProviderData {
  provider: string;
  hour: string;
  successes: number;
  errors: number;
  playbacks_completed: number;
  playback_errors: number;
  tts_success_rate: number;
  playback_success_rate: number;
  avg_generation_ms: number;
  avg_audio_duration_ms: number;
  fallback_triggers: number;
}

export interface UserPatterns {
  unique_users: number;
  total_sessions: number;
  avg_session_duration_seconds: number;
  avg_interactions_per_session: number;
  voice_preference_percent: number;
  text_preference_percent: number;
  overall_completion_rate: number;
  avg_response_latency_ms: number;
  engaged_sessions: number;
  sessions_over_1min: number;
}

export interface ErrorData {
  event_type: string;
  error_type: string;
  error_message: string;
  error_count: number;
  affected_sessions: number;
  avg_duration_before_error_ms: number;
  last_occurrence: string;
  error_category: string;
}

export interface ActivityEvent {
  timestamp: string;
  session_id: string;
  user_id: string;
  event_type: string;
  activity_description: string;
  latency_ms: string;
  provider: string;
  interaction_mode: string;
}

export interface PerformanceTrend {
  hour: string;
  avg_response_latency: number;
  avg_transcription_latency: number;
  avg_tts_generation_latency: number;
  interactions_per_hour: number;
  active_sessions_per_hour: number;
  errors_per_hour: number;
  success_rate_per_hour: number;
}

class DashboardService {
  private client: any = null;

  constructor() {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      this.client = createClient(config.url, config.anonKey);
    }
  }

  async getDashboardData(): Promise<DashboardData | null> {
    if (!this.client) {
      console.warn('Supabase not configured, returning mock data');
      return this.getMockDashboardData();
    }

    try {
      const [
        overviewResult,
        funnelResult,
        ttsResult,
        patternsResult,
        errorsResult,
        activityResult,
        trendsResult
      ] = await Promise.all([
        this.client.from('beta_dashboard_overview').select('*').limit(24),
        this.client.from('voice_flow_funnel').select('*').single(),
        this.client.from('tts_provider_dashboard').select('*').limit(48),
        this.client.from('user_interaction_patterns').select('*').single(),
        this.client.from('error_breakdown_dashboard').select('*').limit(50),
        this.client.from('recent_activity_feed').select('*').limit(100),
        this.client.from('performance_trends').select('*').limit(24)
      ]);

      return {
        overview: overviewResult.data || [],
        voiceFunnel: funnelResult.data || this.getEmptyFunnel(),
        ttsProviders: ttsResult.data || [],
        userPatterns: patternsResult.data || this.getEmptyPatterns(),
        errors: errorsResult.data || [],
        recentActivity: activityResult.data || [],
        performanceTrends: trendsResult.data || []
      };

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return this.getMockDashboardData();
    }
  }

  async getRealtimeOverview(): Promise<BetaOverview[]> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('beta_dashboard_overview')
        .select('*')
        .order('hour', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Realtime overview fetch error:', error);
      return [];
    }
  }

  async getVoiceFunnel(): Promise<VoiceFunnel> {
    if (!this.client) return this.getEmptyFunnel();

    try {
      const { data, error } = await this.client
        .from('voice_flow_funnel')
        .select('*')
        .single();

      if (error) throw error;
      return data || this.getEmptyFunnel();
    } catch (error) {
      console.error('Voice funnel fetch error:', error);
      return this.getEmptyFunnel();
    }
  }

  async getTTSProviderComparison(): Promise<TTSProviderData[]> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('tts_provider_dashboard')
        .select('*')
        .order('hour', { ascending: false })
        .limit(24);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('TTS provider comparison fetch error:', error);
      return [];
    }
  }

  private getEmptyFunnel(): VoiceFunnel {
    return {
      total_sessions: 0,
      step1_recording_started: 0,
      step2_recording_completed: 0,
      step3_transcription_success: 0,
      step4_response_generated: 0,
      step5_tts_generated: 0,
      step6_playback_completed: 0,
      recording_completion_rate: 0,
      transcription_success_rate: 0,
      response_generation_rate: 0,
      tts_generation_rate: 0,
      playback_completion_rate: 0,
      end_to_end_completion_rate: 0,
      recording_error_rate: 0,
      transcription_error_rate: 0,
      response_error_rate: 0,
      tts_error_rate: 0,
      playback_error_rate: 0
    };
  }

  private getEmptyPatterns(): UserPatterns {
    return {
      unique_users: 0,
      total_sessions: 0,
      avg_session_duration_seconds: 0,
      avg_interactions_per_session: 0,
      voice_preference_percent: 0,
      text_preference_percent: 0,
      overall_completion_rate: 0,
      avg_response_latency_ms: 0,
      engaged_sessions: 0,
      sessions_over_1min: 0
    };
  }

  private getMockDashboardData(): DashboardData {
    return {
      overview: [
        {
          hour: new Date().toISOString(),
          day: new Date().toISOString().split('T')[0],
          active_sessions: 12,
          total_interactions: 45,
          voice_interactions: 28,
          text_interactions: 17,
          total_errors: 3,
          interaction_success_rate: 93.3,
          voice_playback_success_rate: 89.3,
          avg_response_latency_ms: 1250,
          sesame_successes: 18,
          elevenlabs_successes: 8,
          sesame_errors: 2,
          elevenlabs_errors: 1
        }
      ],
      voiceFunnel: {
        total_sessions: 12,
        step1_recording_started: 28,
        step2_recording_completed: 26,
        step3_transcription_success: 25,
        step4_response_generated: 24,
        step5_tts_generated: 23,
        step6_playback_completed: 22,
        recording_completion_rate: 92.9,
        transcription_success_rate: 96.2,
        response_generation_rate: 96.0,
        tts_generation_rate: 95.8,
        playback_completion_rate: 95.7,
        end_to_end_completion_rate: 78.6,
        recording_error_rate: 7.1,
        transcription_error_rate: 3.8,
        response_error_rate: 4.0,
        tts_error_rate: 4.2,
        playback_error_rate: 4.3
      },
      ttsProviders: [],
      userPatterns: {
        unique_users: 8,
        total_sessions: 12,
        avg_session_duration_seconds: 285,
        avg_interactions_per_session: 3.8,
        voice_preference_percent: 62.2,
        text_preference_percent: 37.8,
        overall_completion_rate: 93.3,
        avg_response_latency_ms: 1250,
        engaged_sessions: 9,
        sessions_over_1min: 10
      },
      errors: [],
      recentActivity: [],
      performanceTrends: []
    };
  }
}

export const dashboardService = new DashboardService();