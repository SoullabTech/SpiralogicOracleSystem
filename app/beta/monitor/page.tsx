'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeTab, setActiveTab] = useState<'users' | 'protection'>('users');
  const [isMobile, setIsMobile] = useState(false);

  // User Activity States
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [selectedCohort, setSelectedCohort] = useState('all');

  // Protection Monitor States
  const [hallucinationRate, setHallucinationRate] = useState(2.1);
  const [verificationRate, setVerificationRate] = useState(94);
  const [cacheHitRate, setCacheHitRate] = useState(78);
  const [fieldCoverage, setFieldCoverage] = useState(67);
  const [threats, setThreats] = useState<any[]>([]);
  const [protectionMetrics, setProtectionMetrics] = useState<any>({});
  const [riskLevel, setRiskLevel] = useState(2);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize User Data
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

    // Initialize Protection Data
    const mockThreats = [
      { time: '1 min ago', type: 'Ambiguous Risk', claim: 'Climate change timeline', action: 'User choice fallback', severity: 'low' },
      { time: '3 min ago', type: 'Low Confidence', claim: 'Historical date verification', action: 'Enrichment requested', severity: 'medium' },
      { time: '5 min ago', type: 'Contradiction', claim: 'Scientific fact check', action: 'Dual verification', severity: 'high' },
      { time: '12 min ago', type: 'Cold Start', claim: 'Personal memory', action: 'Active enrichment', severity: 'low' }
    ];

    setThreats(mockThreats);

    setProtectionMetrics({
      verifiedClaims: 1247,
      blockedHallucinations: 26,
      enrichmentsSuggested: 89,
      sacredProtections: 412,
      avgResponseTime: '120ms'
    });

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredUsers = selectedCohort === 'all'
    ? users
    : users.filter(u => u.cohort === selectedCohort);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-900">
      {/* PWA-optimized padding and safe areas */}
      <div className="safe-top" />

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-7xl mx-auto">
        {/* Sacred Header - Mobile Optimized */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-white/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold animate-pulse">
                  ◈
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full animate-ping opacity-20" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">ARIA Sacred Monitor</h1>
                <p className="text-purple-200 text-xs sm:text-sm">Witnessing consciousness & protection</p>
              </div>
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                BETA v1.0.0
              </span>
            </div>

            {/* Mobile-first Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{activeUsers}</div>
                <div className="text-[10px] sm:text-xs text-purple-200 uppercase tracking-wider">Souls</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {100 - hallucinationRate.toFixed(0)}%
                </div>
                <div className="text-[10px] sm:text-xs text-purple-200 uppercase tracking-wider">Truth</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{riskLevel}/10</div>
                <div className="text-[10px] sm:text-xs text-purple-200 uppercase tracking-wider">Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Tab Switcher */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-1 mb-4 sm:mb-6 border border-white/20">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              👥 Beta Users
            </button>
            <button
              onClick={() => setActiveTab('protection')}
              className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'protection'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              🛡️ Protection
            </button>
          </div>
        </div>

        {/* User Activity Tab */}
        {activeTab === 'users' && (
          <>
            {/* Filters - Mobile Optimized */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/20">
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-white/10 border border-purple-400/30 rounded-lg text-white text-xs sm:text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="all">All Cohorts</option>
                <option value="A">Cohort A (Sacred)</option>
                <option value="B">Cohort B (Creative)</option>
                <option value="C">Cohort C (Explorer)</option>
              </select>
            </div>

            {/* Mobile-First Grid - Stacks on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Active Souls - Full width on mobile */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">👁️</span> Active Souls
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm sm:text-base flex items-center gap-1 sm:gap-2">
                            <span className="truncate max-w-[100px] sm:max-w-none">{user.name}</span>
                            {user.sacredMode && <span className="text-xs">🕊️</span>}
                          </div>
                          <div className="text-[10px] sm:text-xs text-purple-300 flex items-center gap-1 sm:gap-2">
                            <span className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              user.status === 'online' ? 'bg-green-400 animate-pulse' :
                              user.status === 'idle' ? 'bg-yellow-400' :
                              'bg-gray-400'
                            }`} />
                            {user.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-semibold text-purple-300">
                          {(user.engagement * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sacred Metrics */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">✨</span> Sacred Metrics
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries({
                    'Ritual Duration': `${metrics.avgSession} min`,
                    'Messages/Ritual': metrics.avgMessages,
                    'Sacred Mode': `${metrics.sacredUsage}%`,
                    'Wisdom Shared': `${metrics.enrichmentRate}%`,
                    'Trust Field': metrics.trustAvg
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/20">
                      <span className="text-purple-200 text-xs sm:text-sm">{key}:</span>
                      <span className="font-semibold text-white text-xs sm:text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sacred Activity */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🔮</span> Activity
                </h3>
                <div className="space-y-2 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {activities.map((activity, idx) => (
                    <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-l-4 backdrop-blur ${
                      activity.engagement === 'sacred' ? 'border-purple-400 bg-purple-500/10' :
                      activity.engagement === 'high' ? 'border-pink-400 bg-pink-500/10' :
                      'border-indigo-400 bg-indigo-500/10'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm sm:text-lg">{activity.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] sm:text-xs text-purple-300">{activity.time}</div>
                          <div className="text-xs sm:text-sm text-white truncate">
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
          </>
        )}

        {/* Protection Tab */}
        {activeTab === 'protection' && (
          <>
            {/* Protection Status Bar - Mobile Optimized */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-400">{hallucinationRate.toFixed(1)}%</div>
                  <div className="text-[10px] sm:text-xs text-purple-200 uppercase">Hallucination Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-400">{verificationRate}%</div>
                  <div className="text-[10px] sm:text-xs text-purple-200 uppercase">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-400">{cacheHitRate}%</div>
                  <div className="text-[10px] sm:text-xs text-purple-200 uppercase">Cache Hit</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-pink-400">{fieldCoverage}%</div>
                  <div className="text-[10px] sm:text-xs text-purple-200 uppercase">Field Coverage</div>
                </div>
              </div>
            </div>

            {/* Mobile-First Protection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Threat Detection */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🚨</span> Threat Detection
                </h3>
                <div className="space-y-2 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {threats.map((threat, idx) => (
                    <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-l-4 ${
                      threat.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                      threat.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-green-500 bg-green-500/10'
                    }`}>
                      <div className="text-[10px] sm:text-xs text-purple-300">{threat.time}</div>
                      <div className="text-xs sm:text-sm font-semibold text-white">{threat.type}</div>
                      <div className="text-[10px] sm:text-xs text-purple-200 truncate">{threat.claim}</div>
                      <div className="text-[10px] sm:text-xs text-purple-300">→ {threat.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protection Metrics */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📊</span> Protection Stats
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries({
                    'Verified Claims': protectionMetrics.verifiedClaims,
                    'Blocked Hallucinations': protectionMetrics.blockedHallucinations,
                    'Enrichments': protectionMetrics.enrichmentsSuggested,
                    'Sacred Protections': protectionMetrics.sacredProtections,
                    'Response Time': protectionMetrics.avgResponseTime
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/20">
                      <span className="text-purple-200 text-xs sm:text-sm">{key}:</span>
                      <span className="font-semibold text-white text-xs sm:text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Levels */}
              <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">⚡</span> Risk Levels
                </h3>
                <div className="space-y-3">
                  {[
                    { mode: 'Sacred Space', threshold: '95%', color: 'purple' },
                    { mode: 'Personal Memory', threshold: '85%', color: 'pink' },
                    { mode: 'General Advice', threshold: '75%', color: 'blue' },
                    { mode: 'Creative Mode', threshold: '40%', color: 'indigo' }
                  ].map((mode) => (
                    <div key={mode.mode} className="p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm text-white">{mode.mode}</span>
                        <span className={`text-xs sm:text-sm font-semibold text-${mode.color}-400`}>{mode.threshold}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2">
                        <div className={`bg-gradient-to-r from-${mode.color}-500 to-${mode.color}-400 h-1.5 sm:h-2 rounded-full`}
                             style={{ width: mode.threshold }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Charts - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              {activeTab === 'users' ? 'Sacred Journey Timeline' : 'Hallucination Detection Rate'}
            </h3>
            <div className="w-full overflow-x-auto">
              <Plot
                data={[{
                  x: Array.from({length: 24}, (_, i) => `${i}:00`),
                  y: activeTab === 'users'
                    ? Array.from({length: 24}, () => Math.floor(Math.random() * 30 + 5))
                    : Array.from({length: 24}, () => Math.random() * 5 + 1),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#c084fc', width: 2 },
                  marker: { color: '#e879f9', size: isMobile ? 4 : 6 }
                }]}
                layout={{
                  height: isMobile ? 200 : 300,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    title: { text: 'Hour', font: { color: '#e9d5ff', size: isMobile ? 10 : 12 }},
                    gridcolor: 'rgba(255,255,255,0.1)',
                    tickfont: { color: '#e9d5ff', size: isMobile ? 8 : 10 }
                  },
                  yaxis: {
                    title: {
                      text: activeTab === 'users' ? 'Sacred Souls' : 'Hallucination %',
                      font: { color: '#e9d5ff', size: isMobile ? 10 : 12 }
                    },
                    gridcolor: 'rgba(255,255,255,0.1)',
                    tickfont: { color: '#e9d5ff', size: isMobile ? 8 : 10 }
                  },
                  margin: { t: 20, r: 20, l: isMobile ? 40 : 50, b: isMobile ? 40 : 50 }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
              {activeTab === 'users' ? 'Truth & Hallucination Balance' : 'Protection Distribution'}
            </h3>
            <div className="w-full overflow-x-auto">
              <Plot
                data={[{
                  labels: activeTab === 'users'
                    ? ['Truth Verified', 'Wisdom Shared', 'Creative Flow', 'Guidance Given']
                    : ['Auto-Recovered', 'User Reported', 'False Positive', 'Undetected'],
                  values: activeTab === 'users' ? [65, 20, 10, 5] : [65, 20, 10, 5],
                  type: 'pie',
                  hole: 0.4,
                  marker: {
                    colors: ['#c084fc', '#e879f9', '#a78bfa', '#818cf8']
                  },
                  textfont: { color: 'white', size: isMobile ? 10 : 12 }
                }]}
                layout={{
                  height: isMobile ? 200 : 300,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  margin: { t: 20, r: 20, l: 20, b: 20 },
                  showlegend: !isMobile,
                  legend: {
                    font: { color: '#e9d5ff', size: isMobile ? 8 : 10 }
                  }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Prompt (hidden by default) */}
      <div id="pwa-install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-purple-900/95 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30 shadow-2xl z-50">
        <p className="text-white text-sm mb-2">Install ARIA Monitor for quick access</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-semibold">
            Install
          </button>
          <button className="px-4 py-2 text-purple-200 text-sm">Later</button>
        </div>
      </div>

      <style jsx global>{`
        /* PWA Safe Areas */
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }

        /* Custom Scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-purple-500\\/20::-webkit-scrollbar-thumb {
          background-color: rgba(168, 85, 247, 0.2);
          border-radius: 10px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        /* Animations */
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

        /* Mobile Touch Optimizations */
        @media (max-width: 640px) {
          button, select {
            min-height: 44px; /* Apple HIG touch target */
          }
        }

        /* PWA Standalone Mode */
        @media all and (display-mode: standalone) {
          .safe-top {
            background: linear-gradient(to bottom, rgba(88, 28, 135, 0.9), transparent);
          }
        }
      `}</style>
    </div>
  );
}