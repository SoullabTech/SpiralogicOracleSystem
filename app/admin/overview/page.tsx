// Owner/Operator Console - Live Metrics Dashboard
"use client";

import { useState, useEffect } from 'react';

interface OverviewMetrics {
  last_24h?: {
    oracleTurns: number;
    activeUsers: number;
    bypassingAlerts: number;
    activeReflections: number;
    pendingGates: number;
    avgEmbodimentQuality: number | null;
  };
  last_7d?: {
    oracleTurns: number;
    activeUsers: number;
    bypassingAlerts: number;
    activeReflections: number;
    pendingGates: number;
    avgEmbodimentQuality: number | null;
  };
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics?metric=overview');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '—';
    return num.toLocaleString();
  };

  const formatQuality = (quality: number | null | undefined) => {
    if (!quality) return '—';
    return `${quality.toFixed(1)}/10`;
  };

  return (
    <div className="min-h-screen p-8 bg-bg-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-ink-100">
            🔒 Owner/Operator Console
          </h1>
          <div className="flex items-center space-x-2 text-sm text-ink-300">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-state-amber' : error ? 'bg-state-red' : 'bg-state-green'}`} />
            <span>{loading ? 'Updating...' : error ? 'Error' : 'Live'}</span>
            <button 
              onClick={fetchMetrics}
              className="ml-2 px-2 py-1 text-xs bg-edge-700 rounded hover:bg-edge-700/80 transition-colors duration-200 ease-out-soft"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-state-red/10 border border-state-red/30 rounded-lg">
            <p className="text-state-red">⚠️ {error}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Oracle Turns (24h)"
            value={formatNumber(metrics.last_24h?.oracleTurns)}
            subtitle={`${formatNumber(metrics.last_24h?.activeUsers)} users`}
            icon="🎯"
            loading={loading}
          />
          <MetricCard
            title="Bypassing Alerts"
            value={formatNumber(metrics.last_24h?.bypassingAlerts)}
            subtitle="Last 24 hours"
            icon="⚠️"
            loading={loading}
            alert={(metrics.last_24h?.bypassingAlerts ?? 0) > 5}
          />
          <MetricCard
            title="Active Reflections"
            value={formatNumber(metrics.last_24h?.activeReflections)}
            subtitle="Processing now"
            icon="🧘‍♀️"
            loading={loading}
          />
          <MetricCard
            title="Embodiment Quality"
            value={formatQuality(metrics.last_24h?.avgEmbodimentQuality)}
            subtitle="Average score"
            icon="✨"
            loading={loading}
          />
        </div>

        {/* Weekly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-bg-800 rounded-xl p-6 shadow-lift border border-edge-600">
            <h3 className="text-lg font-semibold text-ink-100 mb-4">
              📊 7-Day Trends
            </h3>
            <div className="space-y-4">
              <TrendRow
                label="Oracle Interactions"
                current={metrics.last_24h?.oracleTurns || 0}
                total={metrics.last_7d?.oracleTurns || 0}
                unit="turns"
              />
              <TrendRow
                label="Active Users"
                current={metrics.last_24h?.activeUsers || 0}
                total={metrics.last_7d?.activeUsers || 0}
                unit="users"
              />
              <TrendRow
                label="Safeguard Triggers"
                current={metrics.last_24h?.bypassingAlerts || 0}
                total={metrics.last_7d?.bypassingAlerts || 0}
                unit="alerts"
              />
            </div>
          </div>

          <div className="bg-bg-800 rounded-xl p-6 shadow-lift border border-edge-600">
            <h3 className="text-lg font-semibold text-ink-100 mb-4">
              🛡️ Safeguard Status
            </h3>
            <div className="space-y-4">
              <SafeguardStatus 
                label="Spiritual Bypassing Detection"
                status={metrics.last_24h?.bypassingAlerts === 0 ? 'healthy' : 'alert'}
                details={`${metrics.last_24h?.bypassingAlerts || 0} alerts today`}
              />
              <SafeguardStatus 
                label="Integration Gates"
                status="healthy"
                details={`${metrics.last_24h?.pendingGates || 0} pending unlocks`}
              />
              <SafeguardStatus 
                label="Reflection Processing"
                status="healthy"
                details={`${metrics.last_24h?.activeReflections || 0} active periods`}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-800 rounded-xl p-6 shadow-lift border border-edge-600">
          <h3 className="text-lg font-semibold text-ink-100 mb-4">
            ⚡ Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton 
              icon="📈"
              label="Detailed Metrics"
              description="View comprehensive analytics"
              href="/admin/metrics"
            />
            <ActionButton 
              icon="🎙️"
              label="Voice/TTS Panel"
              description="Manage voice settings"
              href="/admin/voice"
            />
            <ActionButton 
              icon="🏥"
              label="Health Check"
              description="Run system diagnostics"
              href="/admin/health"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  loading, 
  alert 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: string; 
  loading: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`bg-bg-800 rounded-lg p-6 shadow-soft border-2 ${
      alert ? 'border-state-red/30' : 'border-edge-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {alert && <span className="text-state-red text-sm">⚠️</span>}
      </div>
      <h3 className="text-sm font-medium text-ink-300 mb-1">
        {title}
      </h3>
      <p className={`text-2xl font-bold ${
        alert ? 'text-state-red' : 'text-ink-100'
      } mb-1`}>
        {loading ? '—' : value}
      </p>
      <p className="text-sm text-ink-300">
        {subtitle}
      </p>
    </div>
  );
}

function TrendRow({ 
  label, 
  current, 
  total, 
  unit 
}: { 
  label: string; 
  current: number; 
  total: number; 
  unit: string;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-ink-300">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-ink-100">
          {current.toLocaleString()} / {total.toLocaleString()} {unit}
        </span>
        <div className="text-xs text-ink-300">
          {percentage}% today
        </div>
      </div>
    </div>
  );
}

function SafeguardStatus({ 
  label, 
  status, 
  details 
}: { 
  label: string; 
  status: 'healthy' | 'alert' | 'warning'; 
  details: string;
}) {
  const statusColors = {
    healthy: 'text-state-green',
    warning: 'text-state-amber',
    alert: 'text-state-red'
  };
  
  const statusIcons = {
    healthy: '✅',
    warning: '⚠️',
    alert: '🚨'
  };
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-ink-300">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-medium ${statusColors[status]}`}>
          {statusIcons[status]} {status}
        </span>
        <div className="text-xs text-ink-300">
          {details}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ 
  icon, 
  label, 
  description, 
  href 
}: { 
  icon: string; 
  label: string; 
  description: string; 
  href: string;
}) {
  return (
    <a 
      href={href}
      className="flex items-start p-4 bg-edge-700 rounded-lg hover:bg-edge-700/80 transition-colors"
    >
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h4 className="font-medium text-ink-100">{label}</h4>
        <p className="text-sm text-ink-300">{description}</p>
      </div>
    </a>
  );
}