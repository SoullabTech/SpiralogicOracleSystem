type VoiceEvent =
  | 'voice_attempt_started'
  | 'voice_transcript_received'
  | 'voice_response_played'
  | 'text_fallback_used';

interface VoiceEventData {
  event: VoiceEvent;
  timestamp: number;
  sessionId: string;
  metadata?: {
    transcriptLength?: number;
    errorType?: string;
    responseType?: 'web-speech' | 'elevenlabs';
  };
}

class VoiceAnalytics {
  private sessionId: string;

  constructor() {
    this.sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(event: VoiceEvent, metadata?: VoiceEventData['metadata']) {
    const eventData: VoiceEventData = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata
    };

    // Console logging for immediate validation
    console.log('🔊 Voice Analytics:', eventData);

    // TODO: Replace with actual backend logging
    // this.sendToBackend(eventData);
  }

  private sendToBackend(data: VoiceEventData) {
    // Future implementation for actual analytics backend
    // fetch('/api/analytics/voice', {
    //   method: 'POST',
    //   body: JSON.stringify(data)
    // });
  }
}

export const voiceAnalytics = new VoiceAnalytics();

// Export helper functions for components
export const logVoiceTranscriptReceived = (transcriptLength: number) => {
  voiceAnalytics.track('voice_transcript_received', { transcriptLength });
};

export const logVoiceAttemptStarted = () => {
  voiceAnalytics.track('voice_attempt_started');
};

// Debug exports
export const debugEvents: VoiceEventData[] = [];
export const getSessionSummary = () => ({
  sessionId: voiceAnalytics['sessionId'],
  events: debugEvents.length
});