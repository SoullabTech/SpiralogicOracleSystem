'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SoulprintPanel } from '@/components/SoulprintPanel';

export default function MaiaMonitorDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [userInsights, setUserInsights] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSoulprint, setShowSoulprint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/maia/monitor');
      const data = await response.json();
      setMetrics(data.systemMetrics);
      setUserInsights(data.topUsers || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch MAIA metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-amber-400">Loading MAIA Monitor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light text-amber-50 mb-2">MAIA Functionality Monitor</h1>
              <p className="text-amber-200/60">Real-time tracking of MAIA's core capabilities</p>
            </div>
            <button
              onClick={() => setShowSoulprint(!showSoulprint)}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400
                       rounded-lg hover:bg-purple-500/30 transition-all"
            >
              {showSoulprint ? 'Show Metrics' : '✨ View Soulprints'}
            </button>
          </div>
        </motion.div>

        {/* Soulprint View */}
        {showSoulprint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* User Selector */}
            <div className="mb-6 p-4 bg-black/40 rounded-lg border border-purple-500/20">
              <label className="text-sm text-purple-400 mb-2 block">Select User</label>
              <input
                type="text"
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg
                         text-white placeholder-white/40 focus:border-purple-500/50
                         focus:outline-none"
              />
              <p className="text-xs text-white/40 mt-2">
                Enter a user ID to view their soulprint, or leave blank to view system-wide data
              </p>
            </div>

            {selectedUserId && (
              <SoulprintPanel userId={selectedUserId} />
            )}
          </motion.div>
        )}

        {metrics && (
          <>
            {/* Critical Alerts */}
            {metrics.nameReaskRate > 0.01 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <div className="font-semibold">CRITICAL: Name Re-asking Detected</div>
                    <div className="text-sm">MAIA is asking for names from returning users ({(metrics.nameReaskRate * 100).toFixed(1)}% of sessions)</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Identity & Continuity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/20"
            >
              <h2 className="text-2xl font-light text-amber-50 mb-4">🎯 Identity & Continuity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Name Retention"
                  value={`${(metrics.nameRetentionRate * 100).toFixed(1)}%`}
                  status={metrics.nameRetentionRate > 0.7 ? 'good' : metrics.nameRetentionRate > 0.4 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Name Re-ask Rate"
                  value={`${(metrics.nameReaskRate * 100).toFixed(1)}%`}
                  status={metrics.nameReaskRate < 0.01 ? 'good' : metrics.nameReaskRate < 0.05 ? 'warning' : 'critical'}
                  inverted
                />
                <MetricCard
                  label="Session Linking"
                  value={`${(metrics.sessionLinkingRate * 100).toFixed(1)}%`}
                  status={metrics.sessionLinkingRate > 0.6 ? 'good' : metrics.sessionLinkingRate > 0.3 ? 'warning' : 'critical'}
                />
              </div>
            </motion.div>

            {/* Memory Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20"
            >
              <h2 className="text-2xl font-light text-blue-50 mb-4">🧠 Memory Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Memory Depth"
                  value={metrics.averageMemoryDepth.toFixed(2)}
                  subtitle="items per session"
                  status={metrics.averageMemoryDepth > 2 ? 'good' : metrics.averageMemoryDepth > 1 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Context Recall"
                  value={`${(metrics.contextRecallRate * 100).toFixed(1)}%`}
                  status={metrics.contextRecallRate > 0.6 ? 'good' : metrics.contextRecallRate > 0.3 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Narrative Consistency"
                  value={`${(metrics.narrativeConsistency * 100).toFixed(1)}%`}
                  status={metrics.narrativeConsistency > 0.5 ? 'good' : metrics.narrativeConsistency > 0.3 ? 'warning' : 'critical'}
                />
              </div>
            </motion.div>

            {/* Adaptation & Awareness */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-purple-500/20"
            >
              <h2 className="text-2xl font-light text-purple-50 mb-4">🎭 Adaptation & Awareness</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Elemental Adaptation"
                  value={`${(metrics.elementalAdaptationRate * 100).toFixed(1)}%`}
                  status={metrics.elementalAdaptationRate > 0.6 ? 'good' : metrics.elementalAdaptationRate > 0.3 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Archetype Detection"
                  value={`${(metrics.archetypeDetectionRate * 100).toFixed(1)}%`}
                  status={metrics.archetypeDetectionRate > 0.4 ? 'good' : metrics.archetypeDetectionRate > 0.2 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Tone Evolution"
                  value={`${(metrics.toneEvolutionScore * 100).toFixed(1)}%`}
                  status={metrics.toneEvolutionScore > 0.5 ? 'good' : metrics.toneEvolutionScore > 0.3 ? 'warning' : 'critical'}
                />
              </div>
            </motion.div>

            {/* Technical Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-green-500/20"
            >
              <h2 className="text-2xl font-light text-green-50 mb-4">⚙️ Technical Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Response Time"
                  value={`${metrics.averageResponseTime.toFixed(0)}ms`}
                  status={metrics.averageResponseTime < 2000 ? 'good' : metrics.averageResponseTime < 3000 ? 'warning' : 'critical'}
                  inverted
                />
                <MetricCard
                  label="Context Payload"
                  value={`${(metrics.contextPayloadCompleteness * 100).toFixed(1)}%`}
                  status={metrics.contextPayloadCompleteness > 0.9 ? 'good' : metrics.contextPayloadCompleteness > 0.7 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Memory Injection"
                  value={`${(metrics.memoryInjectionSuccessRate * 100).toFixed(1)}%`}
                  status={metrics.memoryInjectionSuccessRate > 0.9 ? 'good' : metrics.memoryInjectionSuccessRate > 0.7 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="API Health Score"
                  value={`${(metrics.apiHealthScore * 100).toFixed(1)}%`}
                  status={metrics.apiHealthScore > 0.8 ? 'good' : metrics.apiHealthScore > 0.6 ? 'warning' : 'critical'}
                />
              </div>
            </motion.div>

            {/* Field Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/20"
            >
              <h2 className="text-2xl font-light text-amber-50 mb-4">🌀 Field Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <MetricCard
                  label="Field Resonance"
                  value={metrics.fieldResonanceAverage.toFixed(2)}
                  status={metrics.fieldResonanceAverage > 0.6 ? 'good' : metrics.fieldResonanceAverage > 0.4 ? 'warning' : 'critical'}
                />
                <MetricCard
                  label="Sacred Threshold Triggered"
                  value={`${metrics.sacredThresholdTriggered} times`}
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-amber-200/60 mb-2">Emergence Sources</h3>
                <div className="space-y-1">
                  {Object.entries(metrics.emergenceSourceDistribution).map(([source, count]) => (
                    <div key={source} className="flex justify-between text-sm text-amber-200/80">
                      <span>{source}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  status,
  inverted = false
}: {
  label: string;
  value: string;
  subtitle?: string;
  status?: 'good' | 'warning' | 'critical';
  inverted?: boolean;
}) {
  const getStatusColor = () => {
    if (!status) return 'border-white/10';

    const actualStatus = inverted
      ? status === 'critical' ? 'good' : status === 'good' ? 'critical' : status
      : status;

    switch (actualStatus) {
      case 'good': return 'border-green-500/30 bg-green-500/5';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-white/10';
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;

    const actualStatus = inverted
      ? status === 'critical' ? 'good' : status === 'good' ? 'critical' : status
      : status;

    switch (actualStatus) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return null;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-xs text-white/60">{label}</div>
        {getStatusIcon() && <span className="text-sm">{getStatusIcon()}</span>}
      </div>
      <div className="text-2xl font-light text-white">{value}</div>
      {subtitle && <div className="text-xs text-white/40 mt-1">{subtitle}</div>}
    </div>
  );
}