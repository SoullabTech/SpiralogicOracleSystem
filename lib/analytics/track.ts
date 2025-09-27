export async function track(event: string, data: any = {}) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        ...data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', event, error);
  }
}

export const trackEvent = {
  newSession: (userId: string, sessionId: string) =>
    track('new_session', { userId, sessionId }),

  voiceStart: (userId: string) =>
    track('voice_start', { userId }),

  voiceResult: (userId: string, transcript: string, duration: number) =>
    track('voice_result', { userId, transcript, duration }),

  messageReceived: (userId: string, messageLength: number) =>
    track('reply_received', { userId, messageLength }),

  ttsSpoken: (userId: string, textLength: number, duration: number) =>
    track('tts_spoken', { userId, textLength, duration }),

  error: (userId: string, errorType: string, errorMessage: string) =>
    track('error', { userId, errorType, errorMessage }),

  apiCall: (endpoint: string, duration: number, success: boolean) =>
    track('api_call', { endpoint, duration, success }),

  chatInterfaceOpened: (userId: string) =>
    track('chat_interface_opened', { userId }),

  voiceRecognitionStarted: (userId: string) =>
    track('voice_recognition_started', { userId }),

  voiceRecognitionStopped: (userId: string, reason: string) =>
    track('voice_recognition_stopped', { userId, reason })
};