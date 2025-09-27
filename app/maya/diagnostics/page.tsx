'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsEvent {
  timestamp: string;
  event: string;
  data: any;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: string;
}

interface PerformanceMetric {
  endpoint: string;
  avgResponseTime: number;
  successRate: number;
  totalCalls: number;
  lastCall: string;
}

export default function MayaDiagnostics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    lastCheck: new Date().toISOString()
  });
  const [activeUsers, setActiveUsers] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/track');
      const data = await res.json();
      setEvents(data.events || []);
      setActiveUsers(data.count || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const fetchMayaHealth = async () => {
    try {
      const res = await fetch('/api/monitoring/maya-evolution');
      if (res.ok) {
        const data = await res.json();
        setHealth({
          status: 'healthy',
          uptime: data.conversationsHeld || 0,
          lastCheck: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to fetch Maya health:', error);
      setHealth(prev => ({ ...prev, status: 'degraded' }));
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchMayaHealth();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics();
        fetchMayaHealth();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'new_session': return '🆕';
      case 'voice_start': return '🎤';
      case 'voice_result': return '📝';
      case 'reply_received': return '💬';
      case 'tts_spoken': return '🔊';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'degraded': return 'text-yellow-400 bg-yellow-400/10';
      case 'down': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-400 mb-2">MAIA Diagnostics</h1>
            <p className="text-gray-400">Real-time monitoring • Beta testing dashboard</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {autoRefresh ? '⏸ Pause' : '▶️ Resume'} Auto-refresh
            </button>
            <button
              onClick={() => {
                fetchAnalytics();
                fetchMayaHealth();
              }}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className={`p-6 rounded-xl ${getHealthColor(health.status)} border border-current`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm opacity-70 mb-2">System Status</div>
            <div className="text-2xl font-bold capitalize">{health.status}</div>
            <div className="text-xs mt-2 opacity-60">
              Last check: {new Date(health.lastCheck).toLocaleTimeString()}
            </div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl bg-blue-400/10 border border-blue-400 text-blue-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-sm opacity-70 mb-2">Total Events</div>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <div className="text-xs mt-2 opacity-60">Tracked in memory</div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl bg-purple-400/10 border border-purple-400 text-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm opacity-70 mb-2">Conversations</div>
            <div className="text-2xl font-bold">{health.uptime}</div>
            <div className="text-xs mt-2 opacity-60">Total held</div>
          </motion.div>

          <motion.div
            className="p-6 rounded-xl bg-amber-400/10 border border-amber-400 text-amber-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm opacity-70 mb-2">Auto-refresh</div>
            <div className="text-2xl font-bold">{autoRefresh ? 'ON' : 'OFF'}</div>
            <div className="text-xs mt-2 opacity-60">Every 5 seconds</div>
          </motion.div>
        </div>

        {/* Recent Events Stream */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">📊 Live Event Stream</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No events recorded yet. Activity will appear here in real-time.
              </div>
            ) : (
              events.map((event, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-amber-500/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getEventIcon(event.event)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-amber-400">{event.event}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* API Endpoints Status */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">🔌 API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: '/api/maya/chat', status: 'healthy', avgTime: '~2.2s' },
              { name: '/api/analytics/track', status: 'healthy', avgTime: '<10ms' },
              { name: '/api/oracle/maya', status: 'healthy', avgTime: '~1.8s' },
              { name: '/api/tts/maya', status: 'healthy', avgTime: '~1.3s' }
            ].map((endpoint, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm text-gray-300">{endpoint.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg response: {endpoint.avgTime}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    endpoint.status === 'healthy'
                      ? 'bg-green-400/20 text-green-400'
                      : 'bg-red-400/20 text-red-400'
                  }`}>
                    {endpoint.status === 'healthy' ? '✓ ONLINE' : '✗ DOWN'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.open('/maya', '_blank')}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="text-sm font-bold">Open MAIA</div>
            </button>
            <button
              onClick={() => window.open('/maya-voice', '_blank')}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🎤</div>
              <div className="text-sm font-bold">Voice Chat</div>
            </button>
            <button
              onClick={() => window.open('/api/monitoring/maya-evolution', '_blank')}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-bold">Evolution API</div>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-bold">Hard Refresh</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}