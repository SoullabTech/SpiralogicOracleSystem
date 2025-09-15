// Production Voice Telemetry - Privacy-Safe Event Collector
// Collects only structural metadata, no transcript content

let queue = [];
let sessionId = '';

// Generate session ID safely
if (typeof window !== 'undefined' && window.crypto) {
  sessionId = crypto.randomUUID();
} else {
  // Fallback for older browsers
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function logVoiceEvent(event, data = {}) {
  // Only log in production - dev already has comprehensive analytics
  if (process.env.NODE_ENV !== 'production') return;

  const payload = {
    event,
    sessionId,
    ts: Date.now(),
    ...data,
  };

  // Queue locally
  queue.push(payload);

  // Batch send every 5 events or when queue gets large
  if (queue.length >= 5) flushQueue();
}

export function flushQueue() {
  if (queue.length === 0) return;

  const batch = [...queue];
  queue = [];

  fetch('/api/voice-telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  }).catch((err) => {
    console.warn('Telemetry send failed:', err);
    // Re-queue on failure (but limit to prevent memory issues)
    if (queue.length < 50) {
      queue = [...batch, ...queue];
    }
  });
}

// Auto-flush periodically and on page unload
if (typeof window !== 'undefined') {
  // Flush every 10 seconds as safety net
  setInterval(flushQueue, 10000);

  // Flush on page unload (best effort)
  window.addEventListener('beforeunload', flushQueue);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });
}

// Convenience functions for the four core production events
export const logProductionVoiceAttempt = (metadata = {}) => {
  logVoiceEvent('voice_attempt_started', {
    deviceType: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'unknown', // Truncated for privacy
    ...metadata
  });
};

export const logProductionTranscriptReceived = (latencyMs, transcriptLength, metadata = {}) => {
  logVoiceEvent('voice_transcript_received', {
    latencyMs,
    transcriptLength, // Length only, not content
    wordCount: Math.ceil(transcriptLength / 5), // Rough estimate
    ...metadata
  });
};

export const logProductionResponsePlayed = (responseType = 'web_speech', metadata = {}) => {
  logVoiceEvent('voice_response_played', {
    responseType,
    ...metadata
  });
};

export const logProductionFallback = (reason = 'user_choice', metadata = {}) => {
  logVoiceEvent('text_fallback_used', {
    fallbackReason: reason,
    ...metadata
  });
};

// Get session summary for debugging
export const getProductionSessionSummary = () => {
  return {
    sessionId,
    queuedEvents: queue.length,
    lastEventTime: queue.length > 0 ? queue[queue.length - 1].ts : null
  };
};