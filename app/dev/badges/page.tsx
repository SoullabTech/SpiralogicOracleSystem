"use client";

import { useEffect, useState } from "react";
import { Play, Award, RefreshCw, Zap, Mic, Settings, Brain, Scissors, Shield } from "lucide-react";

interface EventResult {
  success: boolean;
  event?: any;
  badges?: any[];
  error?: string;
  timestamp: number;
}

interface UserStatus {
  participant: any;
  badges: any[];
  progress: any[];
}

export default function DevBadgePlaygroundPage() {
  const [results, setResults] = useState<EventResult[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function emitEvent(type: string, meta: any = {}) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/beta/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, meta })
      });

      const data = await res.json();
      
      const result: EventResult = {
        success: res.ok,
        timestamp: Date.now(),
        ...data
      };

      if (!res.ok) {
        result.error = data.error || 'Event failed';
      }

      setResults(prev => [result, ...prev.slice(0, 9)]);
      
      // Refresh status after event
      await refreshStatus();
      
    } catch (error) {
      console.error('Failed to emit event:', error);
      setResults(prev => [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    try {
      const res = await fetch('/api/beta/status');
      if (res.ok) {
        const data = await res.json();
        setUserStatus(data);
      }
    } catch (error) {
      console.warn('Failed to refresh status:', error);
    }
  }

  const eventButtons = [
    {
      type: 'oracle_turn',
      label: 'Oracle Turn',
      icon: <Brain className="w-4 h-4" />,
      color: 'violet',
      meta: { responseLength: 150, sacredDetected: Math.random() > 0.7 }
    },
    {
      type: 'voice_preview',
      label: 'Voice Preview',
      icon: <Mic className="w-4 h-4" />,
      color: 'blue',
      meta: { duration: 3000, provider: 'elevenlabs' }
    },
    {
      type: 'holoflower_set',
      label: 'Holoflower Set',
      icon: <Settings className="w-4 h-4" />,
      color: 'amber',
      meta: { element: ['air', 'earth', 'fire', 'water'][Math.floor(Math.random() * 4)] }
    },
    {
      type: 'soul_memory_saved',
      label: 'Soul Memory Saved',
      icon: <Award className="w-4 h-4" />,
      color: 'emerald',
      meta: { sacredMoment: Math.random() > 0.6, category: 'reflection' }
    },
    {
      type: 'thread_weave',
      label: 'Thread Weave',
      icon: <Scissors className="w-4 h-4" />,
      color: 'cyan',
      meta: { threadCount: Math.floor(Math.random() * 5) + 2, synthesisStrength: Math.random() }
    }
  ];

  const shadowButtons = [
    {
      type: 'shadow_work',
      label: 'Shadow Work (0.5)',
      icon: <Shield className="w-4 h-4" />,
      color: 'rose',
      meta: { shadowScore: 0.5, category: 'conversation' }
    },
    {
      type: 'shadow_work',
      label: 'Shadow Work (0.7)',
      icon: <Shield className="w-4 h-4" />,
      color: 'rose',
      meta: { shadowScore: 0.7, category: 'conversation' }
    },
    {
      type: 'shadow_work',
      label: 'Shadow Work (0.9)',
      icon: <Shield className="w-4 h-4" />,
      color: 'rose',
      meta: { shadowScore: 0.9, category: 'conversation' }
    }
  ];

  useEffect(() => {
    refreshStatus();
  }, []);

  const colorClasses = {
    violet: 'bg-violet-500/20 border-violet-500/30 hover:bg-violet-500/30 text-violet-300',
    blue: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 text-blue-300',
    amber: 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30 text-amber-300',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/30 text-cyan-300',
    rose: 'bg-rose-500/20 border-rose-500/30 hover:bg-rose-500/30 text-rose-300'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Badge Playground
        </h1>
        <div className="text-xs text-zinc-500">
          Development utility - Admin access required
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Event Emitters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Emit Events</h2>
            <button
              onClick={refreshStatus}
              className="inline-flex items-center gap-2 text-sm px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Status
            </button>
          </div>

          {/* Standard Events */}
          <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
            <h3 className="text-sm font-semibold mb-3">Standard Events</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {eventButtons.map((button) => (
                <button
                  key={`${button.type}-${button.label}`}
                  onClick={() => emitEvent(button.type, button.meta)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition disabled:opacity-50 ${
                    colorClasses[button.color as keyof typeof colorClasses]
                  }`}
                >
                  {button.icon}
                  <span className="text-sm font-medium">{button.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shadow Work Events */}
          <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
            <h3 className="text-sm font-semibold mb-3">Shadow Work Events</h3>
            <div className="grid grid-cols-1 gap-2">
              {shadowButtons.map((button, index) => (
                <button
                  key={`${button.type}-${index}`}
                  onClick={() => emitEvent(button.type, button.meta)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition disabled:opacity-50 ${
                    colorClasses[button.color as keyof typeof colorClasses]
                  }`}
                >
                  {button.icon}
                  <span className="text-sm font-medium">{button.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* User Status */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Current Status</h2>
          
          {userStatus ? (
            <div className="space-y-4">
              {/* Participant Info */}
              <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
                <h3 className="text-sm font-semibold mb-2">Participant</h3>
                <div className="text-sm text-zinc-300">
                  <div>Status: <span className="text-emerald-400">{userStatus.participant?.status || 'active'}</span></div>
                  <div>Cohort: <span className="text-violet-400">{userStatus.participant?.cohort || 'A'}</span></div>
                  <div>Joined: {userStatus.participant?.joined_at ? new Date(userStatus.participant.joined_at).toLocaleDateString() : 'Unknown'}</div>
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
                <h3 className="text-sm font-semibold mb-2">Earned Badges ({userStatus.badges.length})</h3>
                {userStatus.badges.length > 0 ? (
                  <div className="space-y-2">
                    {userStatus.badges.map((badge) => (
                      <div key={badge.badge_id} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{badge.beta_badges_catalog?.emoji || '🏆'}</span>
                        <span className="font-medium">{badge.beta_badges_catalog?.name || badge.badge_id}</span>
                        <span className="text-zinc-400 text-xs">
                          {new Date(badge.awarded_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">No badges earned yet</div>
                )}
              </div>

              {/* Progress */}
              <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
                <h3 className="text-sm font-semibold mb-2">Progress ({userStatus.progress.length})</h3>
                {userStatus.progress.length > 0 ? (
                  <div className="space-y-2">
                    {userStatus.progress.slice(0, 5).map((prog, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{prog.name}</span>
                          <span className="text-zinc-400">{prog.progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-1 bg-violet-500 rounded-full transition-all"
                            style={{ width: `${prog.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 text-sm">No progress to show</div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 p-4 bg-black/30">
              <div className="text-center text-zinc-500">Loading status...</div>
            </div>
          )}
        </section>
      </div>

      {/* Event Results */}
      {results.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Events</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`rounded-lg border p-3 text-sm ${
                  result.success 
                    ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-900/20 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {result.success ? '✓' : '✗'} {result.event?.type || 'Event'}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {result.error && (
                  <div className="text-xs opacity-80">Error: {result.error}</div>
                )}
                {result.badges && result.badges.length > 0 && (
                  <div className="text-xs opacity-80">
                    Badges awarded: {result.badges.map(b => b.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}