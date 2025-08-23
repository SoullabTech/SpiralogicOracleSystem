// Bridge performance and enrichment summary API
import { NextRequest, NextResponse } from 'next/server';

interface BridgeMetrics {
  latency: {
    bridge_total_ms: { p50: number; p95: number };
    enrich_ms: { p50: number; p95: number };
  };
  signals: {
    sacred_detected: number;
    shadow_high: number; // shadow_score > 0.6
    archetype_detected: number;
    total_enrichments: number;
  };
  health: {
    cross_links_present: number;
    cross_links_missing: number;
    last_24h_turns: number;
  };
}

interface EnrichmentEvent {
  timestamp: string;
  userId: string;
  summary: string; // redacted
  element?: string;
  facets: string[];
  sacred: boolean;
  shadowScore: number;
  archetypes: Array<{ name: string; strength: number }>;
}

// In-memory store for development (replace with proper metrics store in production)
let bridgeMetrics: number[] = [];
let enrichmentMetrics: number[] = [];
let enrichmentEvents: EnrichmentEvent[] = [];
let signalCounts = {
  sacred: 0,
  shadowHigh: 0,
  archetype: 0,
  total: 0,
};
let healthStats = {
  crossLinksPresent: 0,
  crossLinksMissing: 0,
  totalTurns: 0,
};

// Helper to calculate percentiles
function calculatePercentile(arr: number[], percentile: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)] || 0;
}

export async function GET(request: NextRequest) {
  try {
    const summary: BridgeMetrics = {
      latency: {
        bridge_total_ms: {
          p50: calculatePercentile(bridgeMetrics, 50),
          p95: calculatePercentile(bridgeMetrics, 95),
        },
        enrich_ms: {
          p50: calculatePercentile(enrichmentMetrics, 50),
          p95: calculatePercentile(enrichmentMetrics, 95),
        },
      },
      signals: {
        sacred_detected: signalCounts.sacred,
        shadow_high: signalCounts.shadowHigh,
        archetype_detected: signalCounts.archetype,
        total_enrichments: signalCounts.total,
      },
      health: {
        cross_links_present: healthStats.crossLinksPresent,
        cross_links_missing: healthStats.crossLinksMissing,
        last_24h_turns: healthStats.totalTurns,
      },
    };

    return NextResponse.json({
      summary,
      recent_events: enrichmentEvents.slice(-20), // Last 20 events
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bridge summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bridge summary' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'bridge_timing':
        bridgeMetrics.push(data.bridge_total_ms);
        enrichmentMetrics.push(data.enrich_ms || 0);
        
        // Keep only last 100 measurements
        if (bridgeMetrics.length > 100) {
          bridgeMetrics = bridgeMetrics.slice(-100);
          enrichmentMetrics = enrichmentMetrics.slice(-100);
        }
        break;

      case 'enrichment_event':
        // Add enrichment event
        enrichmentEvents.push({
          timestamp: new Date().toISOString(),
          userId: data.userId.substring(0, 8) + '...', // Redacted
          summary: data.text.substring(0, 50) + '...', // Redacted summary
          element: data.element,
          facets: data.facets || [],
          sacred: data.sacred || false,
          shadowScore: data.shadowScore || 0,
          archetypes: data.archetypes || [],
        });

        // Update signal counts
        signalCounts.total++;
        if (data.sacred) signalCounts.sacred++;
        if (data.shadowScore > 0.6) signalCounts.shadowHigh++;
        if (data.archetypes && data.archetypes.length > 0) signalCounts.archetype++;

        // Keep only last 50 events
        if (enrichmentEvents.length > 50) {
          enrichmentEvents = enrichmentEvents.slice(-50);
        }
        break;

      case 'health_update':
        if (data.cross_link_present) {
          healthStats.crossLinksPresent++;
        } else {
          healthStats.crossLinksMissing++;
        }
        healthStats.totalTurns++;
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown metric type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bridge metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to record metrics' },
      { status: 500 }
    );
  }
}

