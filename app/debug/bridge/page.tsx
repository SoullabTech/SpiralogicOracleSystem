'use client';

import { useState, useEffect } from 'react';

interface BridgeMetrics {
  latency: {
    bridge_total_ms: { p50: number; p95: number };
    enrich_ms: { p50: number; p95: number };
  };
  signals: {
    sacred_detected: number;
    shadow_high: number;
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
  summary: string;
  element?: string;
  facets: string[];
  sacred: boolean;
  shadowScore: number;
  archetypes: Array<{ name: string; strength: number }>;
}

interface BridgeSummary {
  summary: BridgeMetrics;
  recent_events: EnrichmentEvent[];
  timestamp: string;
}

export default function BridgeDebugDashboard() {
  const [data, setData] = useState<BridgeSummary | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/debug/bridge/summary');
      if (response.ok) {
        const bridgeData = await response.json();
        setData(bridgeData);
        setLastUpdate(new Date());
        setIsLive(true);
        setError(null);
        setTimeout(() => setIsLive(false), 1000); // Flash effect
      } else {
        setError(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch bridge data:', error);
      setError('Network error');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">🔗 Bridge Pulse</h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">🔗 Bridge Pulse</h1>
          <div className="text-gray-400">Loading bridge data...</div>
        </div>
      </div>
    );
  }

  const healthPercentage = data.summary.health.cross_links_present / 
    Math.max(1, data.summary.health.cross_links_present + data.summary.health.cross_links_missing) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🔗 Bridge Pulse</h1>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              isLive ? 'bg-green-400 animate-pulse' : 'bg-green-600'
            }`} />
            <span className="text-sm text-gray-400">
              {lastUpdate?.toLocaleTimeString() || 'Never'}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Latency Tile */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">⚡ Latency</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bridge Total</span>
                  <span className="font-mono">p50/p95</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>{data.summary.latency.bridge_total_ms.p50}ms</span>
                  <span className="text-gray-400">/</span>
                  <span className={data.summary.latency.bridge_total_ms.p95 > 350 ? 'text-red-400' : 'text-green-400'}>
                    {data.summary.latency.bridge_total_ms.p95}ms
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Enrichment</span>
                  <span className="font-mono">p50/p95</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>{data.summary.latency.enrich_ms.p50}ms</span>
                  <span className="text-gray-400">/</span>
                  <span className={data.summary.latency.enrich_ms.p95 > 350 ? 'text-red-400' : 'text-green-400'}>
                    {data.summary.latency.enrich_ms.p95}ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signals Tile */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">🎭 Signals (24h)</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sacred Moments</span>
                <span className="text-amber-400 font-semibold">{data.summary.signals.sacred_detected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shadow High</span>
                <span className="text-red-400 font-semibold">{data.summary.signals.shadow_high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Archetypes</span>
                <span className="text-blue-400 font-semibold">{data.summary.signals.archetype_detected}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white font-semibold">{data.summary.signals.total_enrichments}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Tile */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">💚 Dual-Write Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Cross-Links</span>
                  <span className="text-gray-400">{healthPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${healthPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Present</span>
                <span className="text-green-400 font-semibold">{data.summary.health.cross_links_present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Missing</span>
                <span className="text-red-400 font-semibold">{data.summary.health.cross_links_missing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Turns</span>
                <span className="text-white font-semibold">{data.summary.health.last_24h_turns}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Stream */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-cyan-400">📡 Recent Enrichments</h3>
          </div>
          <div className="p-6">
            {data.recent_events.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No enrichment events yet. Send some turns to see the spine breathe!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.recent_events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-750 rounded-md">
                    <div className="flex-shrink-0 text-xs text-gray-400 w-16">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm text-gray-300 mb-1">
                        {event.summary}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.element && (
                          <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
                            {event.element}
                          </span>
                        )}
                        {event.sacred && (
                          <span className="px-2 py-1 bg-amber-600 text-amber-100 text-xs rounded">
                            sacred
                          </span>
                        )}
                        {event.shadowScore > 0.6 && (
                          <span className="px-2 py-1 bg-red-600 text-red-100 text-xs rounded">
                            shadow
                          </span>
                        )}
                        {event.archetypes.map((arch, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-600 text-purple-100 text-xs rounded">
                            {arch.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Bridge breathing since {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}