// Helper function to be called from the bridge
export async function recordBridgeMetrics(data: {
  bridge_total_ms: number;
  enrich_ms: number;
  userId: string;
  text: string;
  enrichment?: {
    sacredMoment?: boolean;
    shadowScore?: number;
    archetypes?: Array<{ name: string; strength: number }>;
    element?: string;
  };
  cross_link_present: boolean;
}) {
  // Record timing
  await fetch('/api/debug/bridge/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'bridge_timing',
      data: {
        bridge_total_ms: data.bridge_total_ms,
        enrich_ms: data.enrich_ms,
      },
    }),
  }).catch(() => {}); // Non-blocking

  // Record enrichment event if present
  if (data.enrichment) {
    await fetch('/api/debug/bridge/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'enrichment_event',
        data: {
          userId: data.userId,
          text: data.text,
          sacred: data.enrichment.sacredMoment,
          shadowScore: data.enrichment.shadowScore,
          archetypes: data.enrichment.archetypes,
          element: data.enrichment.element,
        },
      }),
    }).catch(() => {}); // Non-blocking
  }

  // Record health status
  await fetch('/api/debug/bridge/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'health_update',
      data: {
        cross_link_present: data.cross_link_present,
      },
    }),
  }).catch(() => {}); // Non-blocking
}