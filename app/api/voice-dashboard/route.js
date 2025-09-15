// Voice Analytics Dashboard API
// Provides aggregated metrics for voice system performance

// In-memory storage for demo (replace with actual database in production)
let sessionData = new Map();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return dashboard data
    const sessions = Array.from(sessionData.values());

    if (sessions.length === 0) {
      return res.status(200).json({
        summary: {
          totalSessions: 0,
          totalAttempts: 0,
          avgSuccessRate: 0,
          avgLatency: 0,
          fallbackRate: 0
        },
        sessions: []
      });
    }

    // Calculate aggregate metrics
    const totalAttempts = sessions.reduce((sum, s) => sum + (s.attempts || 0), 0);
    const totalSuccessful = sessions.reduce((sum, s) => sum + (s.successful || 0), 0);
    const totalLatency = sessions.reduce((sum, s) => sum + (s.totalLatency || 0), 0);
    const totalFallbacks = sessions.reduce((sum, s) => sum + (s.fallbacks || 0), 0);

    const summary = {
      totalSessions: sessions.length,
      totalAttempts,
      avgSuccessRate: totalAttempts > 0 ? ((totalSuccessful / totalAttempts) * 100).toFixed(1) : 0,
      avgLatency: totalSuccessful > 0 ? Math.round(totalLatency / totalSuccessful) : 0,
      fallbackRate: totalAttempts > 0 ? ((totalFallbacks / totalAttempts) * 100).toFixed(1) : 0
    };

    return res.status(200).json({
      summary,
      sessions: sessions.slice(-10) // Return last 10 sessions
    });

  } else if (req.method === 'POST') {
    // Update session data from telemetry events
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Expected events array' });
    }

    // Group events by session
    const sessionEvents = new Map();
    events.forEach(event => {
      if (!sessionEvents.has(event.sessionId)) {
        sessionEvents.set(event.sessionId, []);
      }
      sessionEvents.get(event.sessionId).push(event);
    });

    // Process each session
    sessionEvents.forEach((events, sessionId) => {
      if (!sessionData.has(sessionId)) {
        sessionData.set(sessionId, {
          sessionId: sessionId.slice(-8), // Store only last 8 chars for privacy
          attempts: 0,
          successful: 0,
          totalLatency: 0,
          fallbacks: 0,
          startTime: Math.min(...events.map(e => e.ts)),
          lastActivity: Math.max(...events.map(e => e.ts))
        });
      }

      const session = sessionData.get(sessionId);

      events.forEach(event => {
        switch (event.event) {
          case 'voice_attempt_started':
            session.attempts++;
            break;
          case 'voice_transcript_received':
            session.successful++;
            if (event.latencyMs) {
              session.totalLatency += event.latencyMs;
            }
            break;
          case 'text_fallback_used':
            session.fallbacks++;
            break;
        }

        session.lastActivity = Math.max(session.lastActivity, event.ts);
      });
    });

    return res.status(200).json({ ok: true, processed: events.length });

  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}