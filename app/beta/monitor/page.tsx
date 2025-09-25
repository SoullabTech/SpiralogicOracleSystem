'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [selectedCohort, setSelectedCohort] = useState('all');

  useEffect(() => {
    const mockUsers = [
      { id: 'user001', name: 'Alice Chen', cohort: 'A', status: 'online', sessions: 24, engagement: 0.85, trustScore: 0.78, sacredMode: true },
      { id: 'user002', name: 'Bob Smith', cohort: 'B', status: 'online', sessions: 12, engagement: 0.72, trustScore: 0.65, sacredMode: false },
      { id: 'user003', name: 'Carol Jones', cohort: 'A', status: 'idle', sessions: 18, engagement: 0.91, trustScore: 0.82, sacredMode: true },
      { id: 'user004', name: 'David Kim', cohort: 'C', status: 'online', sessions: 8, engagement: 0.68, trustScore: 0.70, sacredMode: false },
      { id: 'user005', name: 'Eve Wilson', cohort: 'B', status: 'offline', sessions: 31, engagement: 0.94, trustScore: 0.88, sacredMode: true }
    ];

    setUsers(mockUsers);
    setActiveUsers(mockUsers.filter(u => u.status === 'online').length);
    setTotalUsers(mockUsers.length);
    setAvgEngagement(Math.round(mockUsers.reduce((acc, u) => acc + u.engagement, 0) / mockUsers.length * 100));

    const mockActivities = [
      { time: '2 min ago', user: 'Alice Chen', action: 'Entered sacred space', engagement: 'sacred', icon: '🕊️' },
      { time: '5 min ago', user: 'Bob Smith', action: 'Shared wisdom source', engagement: 'high', icon: '📿' },
      { time: '8 min ago', user: 'Carol Jones', action: 'Creative exploration', engagement: 'medium', icon: '✨' },
      { time: '12 min ago', user: 'David Kim', action: 'Seeking guidance', engagement: 'high', icon: '🙏' },
      { time: '15 min ago', user: 'Eve Wilson', action: 'Deep reflection mode', engagement: 'sacred', icon: '🔮' }
    ];

    setActivities(mockActivities);

    setMetrics({
      avgSession: '23',
      avgMessages: '18',
      sacredUsage: '32',
      enrichmentRate: '12',
      trustAvg: '0.77'
    });
  }, []);

  const filteredUsers = selectedCohort === 'all'
    ? users
    : users.filter(u => u.cohort === selectedCohort);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-900 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Sacred Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/20 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse">
                  ◈
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ARIA Sacred Monitor</h1>
                <p className="text-purple-200 text-sm">Witnessing the dance of consciousness</p>
              </div>
              <span className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                BETA v1.0.0
              </span>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white drop-shadow-lg">{activeUsers}</div>
                <div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Souls Present</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white drop-shadow-lg">{totalUsers}</div>
                <div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Sacred Circle</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {avgEngagement}%
                </div>
                <div className="text-xs text-purple-200 uppercase tracking-wider mt-1">Sacred Resonance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-purple-200">Cohort:</label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="px-3 py-1.5 bg-white/10 border border-purple-400/30 rounded-lg text-white text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">All Cohorts</option>
                <option value="A">Cohort A (Sacred)</option>
                <option value="B">Cohort B (Creative)</option>
                <option value="C">Cohort C (Explorer)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Active Souls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">👁️</span> Active Souls
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {user.name}
                        {user.sacredMode && <span className="text-xs">🕊️</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.cohort === 'A' ? 'bg-purple-500/30 text-purple-200' :
                          user.cohort === 'B' ? 'bg-pink-500/30 text-pink-200' :
                          'bg-indigo-500/30 text-indigo-200'
                        }`}>
                          {user.cohort}
                        </span>
                      </div>
                      <div className="text-xs text-purple-300 flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-400 animate-pulse' :
                          user.status === 'idle' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
                        {user.status} • {user.sessions} rituals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-300">
                      {(user.engagement * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-purple-400">Trust: {user.trustScore.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sacred Metrics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> Sacred Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/20">
                <span className="text-purple-200">Ritual Duration:</span>
                <span className="font-semibold text-white">{metrics.avgSession} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-400/20">
                <span className="text-purple-200">Messages/Ritual:</span>
                <span className="font-semibold text-white">{metrics.avgMessages}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-400/20">
                <span className="text-purple-200">Sacred Mode:</span>
                <span className="font-semibold text-pink-300">{metrics.sacredUsage}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/20">
                <span className="text-purple-200">Wisdom Shared:</span>
                <span className="font-semibold text-green-300">{metrics.enrichmentRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg border border-purple-400/20">
                <span className="text-purple-200">Trust Field:</span>
                <span className="font-semibold text-white">{metrics.trustAvg}</span>
              </div>
            </div>
          </div>

          {/* Sacred Activity */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔮</span> Sacred Activity
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activities.map((activity, idx) => (
                <div key={idx} className={`p-3 rounded-xl border-l-4 backdrop-blur ${
                  activity.engagement === 'sacred' ? 'border-purple-400 bg-purple-500/10' :
                  activity.engagement === 'high' ? 'border-pink-400 bg-pink-500/10' :
                  'border-indigo-400 bg-indigo-500/10'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-purple-300">{activity.time}</div>
                      <div className="text-sm text-white">
                        <span className="font-semibold text-purple-200">{activity.user}</span>
                        <span className="text-purple-100"> {activity.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Sacred Journey Timeline</h3>
            <Plot
              data={[{
                x: Array.from({length: 24}, (_, i) => `${i}:00`),
                y: Array.from({length: 24}, () => Math.floor(Math.random() * 30 + 5)),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#c084fc', width: 2 },
                marker: { color: '#e879f9', size: 6 }
              }]}
              layout={{
                height: 300,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: {
                  title: { text: 'Hour', font: { color: '#e9d5ff' }},
                  gridcolor: 'rgba(255,255,255,0.1)',
                  tickfont: { color: '#e9d5ff' }
                },
                yaxis: {
                  title: { text: 'Sacred Souls', font: { color: '#e9d5ff' }},
                  gridcolor: 'rgba(255,255,255,0.1)',
                  tickfont: { color: '#e9d5ff' }
                },
                margin: { t: 20, r: 20, l: 50, b: 50 }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Truth & Hallucination Balance</h3>
            <Plot
              data={[{
                labels: ['Truth Verified', 'Wisdom Shared', 'Creative Flow', 'Guidance Given'],
                values: [65, 20, 10, 5],
                type: 'pie',
                hole: 0.4,
                marker: {
                  colors: ['#c084fc', '#e879f9', '#a78bfa', '#818cf8']
                },
                textfont: { color: 'white' }
              }]}
              layout={{
                height: 300,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 20, r: 20, l: 20, b: 20 },
                showlegend: true,
                legend: {
                  font: { color: '#e9d5ff' }
                }
              }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes animation-delay-2000 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes animation-delay-4000 {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        .animation-delay-2000 {
          animation: animation-delay-2000 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation: animation-delay-4000 6s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}