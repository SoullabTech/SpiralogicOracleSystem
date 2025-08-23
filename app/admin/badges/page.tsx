"use client";

import { useEffect, useState } from "react";
import { Award, Calendar, Clock, TrendingUp, Users, Sparkles, RotateCcw } from "lucide-react";

interface CeremonyStats {
  total_ceremonies: number;
  completion_rate: number;
  median_duration_minutes: number;
  recent_completions_24h: number;
}

interface BadgeAward {
  badge_id: string;
  name: string;
  emoji: string;
  awarded_count: number;
  unique_recipients: number;
  avg_hours_to_earn: number;
}

interface RecentCeremony {
  id: string;
  user_id: string;
  constellation_code: string;
  constellation_name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
}

export default function AdminBadgesPage() {
  const [stats, setStats] = useState<CeremonyStats | null>(null);
  const [badgeAwards, setBadgeAwards] = useState<BadgeAward[]>([]);
  const [recentCeremonies, setRecentCeremonies] = useState<RecentCeremony[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchBadgeData() {
    setLoading(true);
    try {
      const [statsRes, awardsRes, ceremoniesRes] = await Promise.all([
        fetch("/api/admin/badges/stats"),
        fetch("/api/admin/badges/awards"),
        fetch("/api/admin/badges/ceremonies")
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (awardsRes.ok) {
        const data = await awardsRes.json();
        setBadgeAwards(data.awards || []);
      }

      if (ceremoniesRes.ok) {
        const data = await ceremoniesRes.json();
        setRecentCeremonies(data.ceremonies || []);
      }
    } catch (error) {
      console.error('Failed to fetch badge data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    await fetchBadgeData();
    setRefreshing(false);
  }

  async function forceCompleteTest() {
    // Dev function to force complete a test ceremony
    try {
      const res = await fetch('/api/admin/badges/dev-complete', { method: 'POST' });
      if (res.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to force complete:', error);
    }
  }

  useEffect(() => {
    fetchBadgeData();
    const interval = setInterval(fetchBadgeData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <div className="p-6 text-sm text-zinc-400">Loading badge analytics…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Badge & Ceremony Analytics
        </h1>
        <div className="flex items-center gap-3">
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={forceCompleteTest}
              className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-600 transition"
            >
              Dev: Force Complete
            </button>
          )}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-sm px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="text-sm text-zinc-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Ceremony Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricTile 
            title="Total Ceremonies" 
            value={stats.total_ceremonies}
            icon={<Sparkles className="w-4 h-4" />}
            color="violet"
          />
          <MetricTile 
            title="Completion Rate" 
            value={`${Math.round(stats.completion_rate * 100)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="emerald"
          />
          <MetricTile 
            title="Median Duration" 
            value={`${Math.round(stats.median_duration_minutes)}m`}
            icon={<Clock className="w-4 h-4" />}
            color="blue"
          />
          <MetricTile 
            title="Recent (24h)" 
            value={stats.recent_completions_24h}
            icon={<Calendar className="w-4 h-4" />}
            color="amber"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Badge Awards */}
        <Card title="Badge Distribution">
          <div className="space-y-3">
            {badgeAwards.length > 0 ? badgeAwards.map((badge) => (
              <div key={badge.badge_id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{badge.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-zinc-400">
                      {badge.avg_hours_to_earn > 0 
                        ? `Avg ${Math.round(badge.avg_hours_to_earn)}h to earn` 
                        : 'Instant'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{badge.awarded_count}</div>
                  <div className="text-xs text-zinc-400">
                    {badge.unique_recipients} users
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-zinc-500 py-8">
                No badge awards yet
              </div>
            )}
          </div>
        </Card>

        {/* Recent Ceremonies */}
        <Card title="Recent Ceremonies">
          <div className="space-y-2">
            {recentCeremonies.length > 0 ? recentCeremonies.slice(0, 8).map((ceremony) => (
              <div key={ceremony.id} className="flex items-center justify-between p-2 rounded bg-zinc-800/20">
                <div className="flex items-center gap-3">
                  <ConstellationIcon code={ceremony.constellation_code} />
                  <div>
                    <div className="text-sm font-medium">
                      {ceremony.constellation_name || ceremony.constellation_code}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {formatTimeAgo(ceremony.started_at)}
                      {ceremony.duration_minutes && ` • ${Math.round(ceremony.duration_minutes)}m`}
                    </div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  ceremony.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : ceremony.status === 'started'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-500/20 text-zinc-300'
                }`}>
                  {ceremony.status}
                </div>
              </div>
            )) : (
              <div className="text-center text-zinc-500 py-8">
                No ceremonies yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card title="Performance Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Ceremony Success Rate"
            value={stats ? `${Math.round(stats.completion_rate * 100)}%` : '0%'}
            description="Ceremonies completed vs started"
            trend={stats && stats.completion_rate > 0.8 ? 'up' : stats && stats.completion_rate > 0.5 ? 'neutral' : 'down'}
          />
          <KPICard
            title="Average Duration"
            value={stats ? `${Math.round(stats.median_duration_minutes)}min` : '0min'}
            description="Median time to complete ceremony"
            trend="neutral"
          />
          <KPICard
            title="Daily Activity"
            value={stats ? `${stats.recent_completions_24h}` : '0'}
            description="Ceremonies completed in last 24h"
            trend={stats && stats.recent_completions_24h > 0 ? 'up' : 'neutral'}
          />
        </div>
      </Card>
    </div>
  );
}

function MetricTile({ title, value, icon, color }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };

  return (
    <div className="rounded-xl border border-zinc-800 p-4 bg-black/30">
      <div className="flex items-center gap-2 mb-2">
        <span className={colorClasses[color as keyof typeof colorClasses]}>{icon}</span>
        <div className="text-xs text-zinc-400">{title}</div>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 p-5 bg-black/30">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function KPICard({ title, value, description, trend }: {
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-zinc-400'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div className="rounded-lg border border-zinc-700 p-4 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{title}</div>
        <span className={`text-xs ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </span>
      </div>
      <div className="text-xl font-semibold mb-1">{value}</div>
      <div className="text-xs text-zinc-400">{description}</div>
    </div>
  );
}

function ConstellationIcon({ code }: { code: string }) {
  const icons = {
    'WAYFINDER': '🧭',
    'WEAVER': '🕸️',
    'PIONEER': '🌟'
  };

  return (
    <span className="text-sm">
      {icons[code as keyof typeof icons] || '⭐'}
    </span>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}