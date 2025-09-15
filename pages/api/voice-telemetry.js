// Voice Telemetry API Endpoint
// Collects privacy-safe voice interaction metrics

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid payload - expected array' });
    }

    // Validate events structure
    const validEvents = events.filter(event =>
      event.event &&
      event.sessionId &&
      event.ts &&
      typeof event.ts === 'number'
    );

    if (validEvents.length === 0) {
      return res.status(400).json({ error: 'No valid events in batch' });
    }

    // Log to console for now (safe, anonymous)
    // In production, pipe to your analytics database
    console.log(`[VoiceTelemetry] Received ${validEvents.length} events from session ${validEvents[0].sessionId.slice(-8)}`);

    // Log each event with timestamp for debugging
    validEvents.forEach(event => {
      const timestamp = new Date(event.ts).toISOString();
      console.log(`  ${timestamp} - ${event.event}:`, {
        ...event,
        sessionId: event.sessionId.slice(-8), // Only log last 8 chars for privacy
        ts: undefined // Remove timestamp from detailed log to avoid duplication
      });
    });

    // TODO: Replace console.log with actual data storage
    // Examples:
    // - await insertIntoDatabase(validEvents);
    // - await sendToAnalyticsService(validEvents);
    // - await appendToLogFile(validEvents);

    // Basic analytics aggregation (for immediate insights)
    const eventCounts = validEvents.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});

    console.log(`  Session summary:`, eventCounts);

    return res.status(200).json({
      ok: true,
      processed: validEvents.length,
      summary: eventCounts
    });

  } catch (error) {
    console.error('[VoiceTelemetry] Error processing events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}