"use client";

import { useEffect, useState } from "react";
import { Users, Award, TrendingUp, Calendar, Target, Sparkles } from "lucide-react";

interface BetaAnalytics {
  total_participants: number;
  active_beta_users: number;
  graduated_users: number;
  active_24h: number;
  active_7d: number;
  starter_pack_completion_rate: number;
}

interface BadgeStats {
  badge_id: string;
  name: string;
  emoji: string;
  awarded_count: number;
  unique_recipients: number;
  avg_hours_to_earn: number;
}

interface RecentActivity {
  user_id: string;
  kind: string;
  details: any;
  created_at: string;
  status: string;
  cohort: string;
}

export default function BetaAdminPage() {
  const [analytics, setAnalytics] = useState<BetaAnalytics | null>(null);
  const [badgeStats, setBadgeStats] = useState<BadgeStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBetaData() {
    setLoading(true);
    try {
      const [analyticsRes, badgesRes, activityRes] = await Promise.all([
        fetch("/api/admin/beta/analytics"),
        fetch("/api/admin/beta/badges"),
        fetch("/api/admin/beta/activity")
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (badgesRes.ok) {
        const data = await badgesRes.json();
        setBadgeStats(data.badges || []);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Failed to fetch beta data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBetaData();
    const interval = setInterval(fetchBetaData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return <div className="p-6 text-sm text-zinc-400">Loading beta analytics…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          Beta Program Analytics
        </h1>
        <div className="text-sm text-zinc-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricTile 
          title="Total Participants" 
          value={analytics.total_participants}
          icon={<Users className="w-4 h-4" />}
          color="blue"
        />
        <MetricTile 
          title="Active Beta Users" 
          value={analytics.active_beta_users}
          icon={<Target className="w-4 h-4" />}
          color="emerald"
        />
        <MetricTile 
          title="Graduated Users" 
          value={analytics.graduated_users}
          icon={<Award className="w-4 h-4" />}
          color="violet"
        />
        <MetricTile 
          title="Active (24h)" 
          value={analytics.active_24h}
          icon={<TrendingUp className="w-4 h-4" />}
          color="cyan"
        />
        <MetricTile 
          title="Active (7d)" 
          value={analytics.active_7d}
          icon={<Calendar className="w-4 h-4" />}
          color="amber"
        />
        <MetricTile 
          title="Starter Pack %" 
          value={`${Math.round(analytics.starter_pack_completion_rate * 100)}%`}
          icon={<Sparkles className="w-4 h-4" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Badge Statistics */}
        <Card title="Badge Distribution">
          <div className="space-y-3">
            {badgeStats.map((badge) => (
              <div key={badge.badge_id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{badge.emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{badge.name}</div>
                    <div className="text-xs text-zinc-400">
                      {badge.avg_hours_to_earn > 0 ? `Avg ${Math.round(badge.avg_hours_to_earn)}h to earn` : 'Instant'}
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
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-2">
            {recentActivity.slice(0, 8).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-zinc-800/20">
                <div className="flex items-center gap-3">
                  <EventIcon kind={activity.kind} />
                  <div>
                    <div className="text-sm font-medium">
                      {formatEventKind(activity.kind)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {activity.cohort && `Cohort ${activity.cohort} • `}
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  activity.status === 'beta' 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'bg-violet-500/20 text-violet-300'
                }`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <Card title="Key Performance Indicators">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Engagement Rate"
            value={`${Math.round((analytics.active_7d / analytics.total_participants) * 100)}%`}
            description="7-day active users / total participants"
            trend={analytics.active_7d > analytics.active_24h * 3 ? 'up' : 'down'}
          />
          <KPICard
            title="Graduation Rate"
            value={`${Math.round((analytics.graduated_users / analytics.total_participants) * 100)}%`}
            description="Users who completed beta program"
            trend={analytics.graduated_users > 0 ? 'up' : 'neutral'}
          />
          <KPICard
            title="Onboarding Success"
            value={`${Math.round(analytics.starter_pack_completion_rate * 100)}%`}
            description="Users who completed starter pack"
            trend={analytics.starter_pack_completion_rate > 0.5 ? 'up' : 'down'}
          />
          <KPICard
            title="Badge Velocity"
            value={`${(badgeStats.reduce((acc, b) => acc + b.awarded_count, 0) / analytics.total_participants).toFixed(1)}`}
            description="Average badges per user"
            trend="neutral"
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

function EventIcon({ kind }: { kind: string }) {
  const icons = {
    oracle_turn: '💬',
    voice_play: '🎙️',
    weave_created: '🕸️',
    soul_save: '🔮',
    holoflower_explore: '🌌',
    shadow_safe: '🌑',
    admin_feedback: '📝',
    graduated: '🎓'
  };

  return (
    <span className="text-sm">
      {icons[kind as keyof typeof icons] || '•'}
    </span>
  );
}

function formatEventKind(kind: string): string {
  const labels = {
    oracle_turn: 'Oracle Conversation',
    voice_play: 'Voice Interaction',
    weave_created: 'Thread Weaved',
    soul_save: 'Soul Memory Saved',
    holoflower_explore: 'Holoflower Explored',
    shadow_safe: 'Shadow Work',
    admin_feedback: 'Feedback Submitted',
    graduated: 'Beta Graduated'
  };

  return labels[kind as keyof typeof labels] || kind;
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