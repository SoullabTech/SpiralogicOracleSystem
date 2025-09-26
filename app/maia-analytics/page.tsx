'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Mic, Zap, Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function MaiaAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/maia/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-amber-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-amber-50 mb-2">MAIA Analytics</h1>
            <p className="text-amber-200/60">Real-time performance & quality metrics</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <div className="flex gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-1">
              {(['1h', '24h', '7d', '30d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    timeRange === range
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              {autoRefresh ? '● Live' : 'Paused'}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="Avg Response Time"
            value={metrics?.avgResponseTime ? `${metrics.avgResponseTime.toFixed(0)}ms` : 'N/A'}
            change={metrics?.responseTimeChange}
            status={getResponseTimeStatus(metrics?.avgResponseTime)}
          />

          <MetricCard
            icon={<Brain className="w-5 h-5" />}
            label="Memory Hit Rate"
            value={metrics?.memoryHitRate ? `${(metrics.memoryHitRate * 100).toFixed(1)}%` : 'N/A'}
            change={metrics?.memoryHitRateChange}
            status={metrics?.memoryHitRate > 0.7 ? 'good' : metrics?.memoryHitRate > 0.4 ? 'warning' : 'critical'}
          />

          <MetricCard
            icon={<Mic className="w-5 h-5" />}
            label="Voice Quality"
            value={metrics?.voiceQuality ? `${(metrics.voiceQuality * 100).toFixed(0)}%` : 'N/A'}
            change={metrics?.voiceQualityChange}
            status={metrics?.voiceQuality > 0.9 ? 'good' : metrics?.voiceQuality > 0.7 ? 'warning' : 'critical'}
          />

          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Active Users"
            value={metrics?.activeUsers?.toString() || '0'}
            change={metrics?.activeUsersChange}
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Distribution */}
          <AnalyticsCard title="Response Time Distribution" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-3">
              <DistributionBar
                label="Fast (<2s)"
                value={metrics?.responseDistribution?.fast || 0}
                total={100}
                color="bg-green-500"
              />
              <DistributionBar
                label="Medium (2-3s)"
                value={metrics?.responseDistribution?.medium || 0}
                total={100}
                color="bg-yellow-500"
              />
              <DistributionBar
                label="Slow (>3s)"
                value={metrics?.responseDistribution?.slow || 0}
                total={100}
                color="bg-red-500"
              />
            </div>
          </AnalyticsCard>

          {/* Memory Performance */}
          <AnalyticsCard title="Memory Performance" icon={<Brain className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Hit Rate</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.memoryHitRate ? `${(metrics.memoryHitRate * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Avg Items Recalled</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.avgItemsRecalled?.toFixed(1) || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Recall Latency</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.recallLatency?.toFixed(0)}ms
                </span>
              </div>
            </div>
          </AnalyticsCard>

          {/* Elemental Distribution */}
          <AnalyticsCard title="Elemental Distribution" icon={<Activity className="w-5 h-5" />}>
            <div className="space-y-2">
              {Object.entries(metrics?.elementalDistribution || {}).map(([element, count]: [string, any]) => (
                <div key={element} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getElementEmoji(element)}</span>
                    <span className="text-sm text-white/80 capitalize">{element}</span>
                  </div>
                  <span className="text-sm text-amber-400">{count}</span>
                </div>
              ))}
            </div>
          </AnalyticsCard>

          {/* Voice Analytics */}
          <AnalyticsCard title="Voice Analytics" icon={<Mic className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Most Popular</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.mostPopularVoice || 'shimmer'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Synthesis Latency</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.synthesisLatency?.toFixed(0) || '0'}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Playback Issues</span>
                <span className={`text-lg font-medium ${
                  (metrics?.playbackIssues || 0) > 5 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {metrics?.playbackIssues || 0}
                </span>
              </div>
            </div>
          </AnalyticsCard>

          {/* Error Tracking */}
          <AnalyticsCard title="Error Tracking" icon={<AlertCircle className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Total Errors</span>
                <span className={`text-lg font-medium ${
                  (metrics?.totalErrors || 0) > 10 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {metrics?.totalErrors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Error Rate</span>
                <span className={`text-lg font-medium ${
                  (metrics?.errorRate || 0) > 0.05 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {metrics?.errorRate ? `${(metrics.errorRate * 100).toFixed(2)}%` : '0%'}
                </span>
              </div>
            </div>

            {metrics?.recentErrors && metrics.recentErrors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-white/40 mb-2">Recent Errors:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metrics.recentErrors.slice(0, 5).map((error: any, i: number) => (
                    <div key={i} className="text-xs text-red-400/80 truncate">
                      {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AnalyticsCard>

          {/* User Engagement */}
          <AnalyticsCard title="User Engagement" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Avg Session Length</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.avgSessionLength?.toFixed(1) || '0'}min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Messages/Session</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.messagesPerSession?.toFixed(1) || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Return Rate</span>
                <span className="text-lg font-medium text-amber-400">
                  {metrics?.returnRate ? `${(metrics.returnRate * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </AnalyticsCard>
        </div>

        {/* Performance Note */}
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Activity className="w-4 h-4" />
            <span>All metrics collected passively with zero performance impact on MAIA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  status
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  status?: 'good' | 'warning' | 'critical';
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'border-green-500/30 bg-green-500/5';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-white/10 bg-black/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-white/60">{icon}</div>
        {change !== undefined && (
          <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-light text-white mb-1">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </motion.div>
  );
}

function AnalyticsCard({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4 text-amber-400">
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function DistributionBar({
  label,
  value,
  total,
  color
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm text-white/60 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function getResponseTimeStatus(ms?: number): 'good' | 'warning' | 'critical' {
  if (!ms) return 'good';
  if (ms < 2000) return 'good';
  if (ms < 3000) return 'warning';
  return 'critical';
}

function getElementEmoji(element: string): string {
  const emojis: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '🌬️',
    aether: '✨'
  };
  return emojis[element] || '✨';
}