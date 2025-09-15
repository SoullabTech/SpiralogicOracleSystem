// Voice Analytics - Lightweight event tracking
// Simple, non-intrusive event logger with batching

let eventQueue = [];
const BATCH_INTERVAL = 10000; // Send every 10 seconds
const ENDPOINT = "/api/voice-analytics"; // Replace with your endpoint

// Generate unique session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const sessionId = generateSessionId();

// Add event to queue
export const logVoiceEvent = (eventName, data = {}) => {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    sessionId,
    ...data,
  };

  eventQueue.push(payload);
  console.log("[VoiceAnalytics] Queued:", payload);

  // For now, also log to console for immediate visibility
  console.log(`🔊 Voice Event: ${eventName}`, data);
};

// Send queued events
const flushQueue = async () => {
  if (eventQueue.length === 0) return;

  const batch = [...eventQueue];
  eventQueue = [];

  try {
    // For now, just log the batch - replace with actual endpoint call later
    console.log("[VoiceAnalytics] Would send batch:", batch);

    // Uncomment when ready to send to backend:
    // await fetch(ENDPOINT, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(batch),
    // });

  } catch (err) {
    console.error("[VoiceAnalytics] Failed to send batch:", err);
    // Re-queue on failure
    eventQueue = batch.concat(eventQueue);
  }
};

// Auto-flush periodically
if (typeof window !== 'undefined') {
  setInterval(flushQueue, BATCH_INTERVAL);

  // Flush on page unload (best effort)
  window.addEventListener("beforeunload", () => {
    // Use sendBeacon for more reliable delivery on unload
    if (eventQueue.length > 0 && navigator.sendBeacon) {
      try {
        const batch = JSON.stringify(eventQueue);
        navigator.sendBeacon(ENDPOINT, batch);
        console.log("[VoiceAnalytics] Sent via beacon on unload");
      } catch (err) {
        console.warn("[VoiceAnalytics] Beacon failed:", err);
      }
    }
  });
}

// Convenience functions for the four core events
export const logVoiceAttemptStarted = (metadata = {}) => {
  logVoiceEvent('voice_attempt_started', {
    device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
    ...metadata
  });
};

export const logVoiceTranscriptReceived = (transcript, metadata = {}) => {
  logVoiceEvent('voice_transcript_received', {
    transcriptLength: transcript.length,
    wordCount: transcript.split(' ').length,
    containsPunctuation: /[.!?]/.test(transcript),
    ...metadata
  });
};

export const logVoiceResponsePlayed = (responseType = 'web_speech', metadata = {}) => {
  logVoiceEvent('voice_response_played', {
    responseType, // 'elevenlabs', 'web_speech', 'fallback'
    ...metadata
  });
};

export const logTextFallbackUsed = (reason = 'user_choice', metadata = {}) => {
  logVoiceEvent('text_fallback_used', {
    fallbackReason: reason, // 'user_choice', 'voice_error', 'recognition_failed'
    ...metadata
  });
};

// Session summary for debugging
export const getSessionSummary = () => {
  const events = eventQueue;
  const voiceAttempts = events.filter(e => e.event === 'voice_attempt_started').length;
  const successfulTranscripts = events.filter(e => e.event === 'voice_transcript_received').length;
  const responsesPlayed = events.filter(e => e.event === 'voice_response_played').length;
  const fallbacks = events.filter(e => e.event === 'text_fallback_used').length;

  return {
    sessionId,
    voiceAttempts,
    successfulTranscripts,
    responsesPlayed,
    fallbacks,
    technicalSuccessRate: voiceAttempts > 0 ? responsesPlayed / voiceAttempts : 0,
    transcriptionSuccessRate: voiceAttempts > 0 ? successfulTranscripts / voiceAttempts : 0,
    fallbackRate: voiceAttempts > 0 ? fallbacks / voiceAttempts : 0
  };
};

// Debug: Get all events in current session (useful in browser console)
export const debugEvents = () => {
  console.log('🔍 Current session events:', eventQueue);
  return eventQueue;
};

// Debug: Enhanced analysis with timing insights
export const debugAnalysis = () => {
  const summary = getSessionSummary();

  // Calculate timing metrics
  const attempts = eventQueue.filter(e => e.event === 'voice_attempt_started');
  const transcripts = eventQueue.filter(e => e.event === 'voice_transcript_received');

  const timingData = attempts.map(attempt => {
    const matchingTranscript = transcripts.find(t =>
      new Date(t.timestamp) > new Date(attempt.timestamp) &&
      new Date(t.timestamp) - new Date(attempt.timestamp) < 10000 // within 10s
    );

    if (matchingTranscript) {
      return {
        attemptTime: new Date(attempt.timestamp),
        transcriptTime: new Date(matchingTranscript.timestamp),
        latencyMs: new Date(matchingTranscript.timestamp) - new Date(attempt.timestamp),
        transcriptLength: matchingTranscript.transcriptLength || 0,
        wordCount: matchingTranscript.wordCount || 0
      };
    }
    return null;
  }).filter(Boolean);

  // Calculate averages
  const avgLatency = timingData.length > 0
    ? timingData.reduce((sum, t) => sum + t.latencyMs, 0) / timingData.length
    : 0;

  const avgTranscriptLength = timingData.length > 0
    ? timingData.reduce((sum, t) => sum + t.transcriptLength, 0) / timingData.length
    : 0;

  const avgWordCount = timingData.length > 0
    ? timingData.reduce((sum, t) => sum + t.wordCount, 0) / timingData.length
    : 0;

  console.log('\n🔍 VOICE DEBUG ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Basic Metrics:`);
  console.log(`   Attempts: ${summary.voiceAttempts}`);
  console.log(`   Successful: ${summary.successfulTranscripts} (${(summary.transcriptionSuccessRate * 100).toFixed(1)}%)`);
  console.log(`   Responses: ${summary.responsesPlayed}`);
  console.log(`   Fallbacks: ${summary.fallbacks}`);

  if (timingData.length > 0) {
    console.log(`\n⚡ Performance:`);
    console.log(`   Avg Time-to-Transcript: ${avgLatency.toFixed(0)}ms`);
    console.log(`   Avg Transcript Length: ${avgTranscriptLength.toFixed(1)} chars`);
    console.log(`   Avg Word Count: ${avgWordCount.toFixed(1)} words`);

    // Latency warnings
    if (avgLatency > 3000) {
      console.log(`   ⚠️  HIGH LATENCY: ${avgLatency.toFixed(0)}ms avg (>3s may feel sluggish)`);
    } else if (avgLatency > 1500) {
      console.log(`   ⚠️  MODERATE LATENCY: ${avgLatency.toFixed(0)}ms avg (>1.5s noticeable)`);
    } else {
      console.log(`   ✅ GOOD LATENCY: ${avgLatency.toFixed(0)}ms avg (<1.5s feels responsive)`);
    }

    // Show individual attempts for debugging
    console.log(`\n📋 Individual Attempts:`);
    timingData.forEach((timing, i) => {
      const status = timing.latencyMs < 1500 ? '✅' : timing.latencyMs < 3000 ? '⚠️' : '❌';
      console.log(`   ${status} #${i + 1}: ${timing.latencyMs}ms → "${timing.transcriptLength}chars, ${timing.wordCount}words"`);
    });
  }

  console.log(`\n🆔 Session: ${sessionId.slice(-8)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Also run full analysis if available
  if (eventQueue.length > 0) {
    import('./voiceMetricsProcessor.js').then(({ quickAnalysis }) => {
      quickAnalysis(eventQueue);
    });
  }

  return {
    ...summary,
    timing: {
      avgLatencyMs: avgLatency,
      avgTranscriptLength,
      avgWordCount,
      totalMeasurements: timingData.length
    }
  };
};