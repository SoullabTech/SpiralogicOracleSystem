'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeTab, setActiveTab] = useState<'users' | 'protection' | 'elements'>('users');
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

  // Elemental States (for future expansion)
  const [elementalBalance, setElementalBalance] = useState({
    fire: 24,
    water: 31,
    earth: 28,
    air: 17
  });

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize User Data
    const mockUsers = [
      { id: 'user001', name: 'Alice Chen', cohort: 'A', status: 'online', sessions: 24, engagement: 0.85, trustScore: 0.78, element: 'fire' },
      { id: 'user002', name: 'Bob Smith', cohort: 'B', status: 'online', sessions: 12, engagement: 0.72, trustScore: 0.65, element: 'water' },
      { id: 'user003', name: 'Carol Jones', cohort: 'A', status: 'idle', sessions: 18, engagement: 0.91, trustScore: 0.82, element: 'earth' },
      { id: 'user004', name: 'David Kim', cohort: 'C', status: 'online', sessions: 8, engagement: 0.68, trustScore: 0.70, element: 'air' },
      { id: 'user005', name: 'Eve Wilson', cohort: 'B', status: 'offline', sessions: 31, engagement: 0.94, trustScore: 0.88, element: 'fire' }
    ];

    setUsers(mockUsers);
    setActiveUsers(mockUsers.filter(u => u.status === 'online').length);
    setTotalUsers(mockUsers.length);
    setAvgEngagement(Math.round(mockUsers.reduce((acc, u) => acc + u.engagement, 0) / mockUsers.length * 100));

    const mockActivities = [
      { time: '2 min ago', user: 'Alice Chen', action: 'Fire ritual completed', engagement: 'fire', icon: '🔥' },
      { time: '5 min ago', user: 'Bob Smith', action: 'Water reflection shared', engagement: 'water', icon: '💧' },
      { time: '8 min ago', user: 'Carol Jones', action: 'Earth grounding practice', engagement: 'earth', icon: '🌍' },
      { time: '12 min ago', user: 'David Kim', action: 'Air meditation begun', engagement: 'air', icon: '🌬️' },
      { time: '15 min ago', user: 'Eve Wilson', action: 'Aether connection established', engagement: 'aether', icon: '✨' }
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

  const getElementColor = (element: string) => {
    const colors = {
      fire: 'from-orange-500 to-red-500',
      water: 'from-cyan-500 to-blue-500',
      earth: 'from-green-600 to-emerald-500',
      air: 'from-gray-400 to-slate-300',
      aether: 'from-purple-500 to-indigo-500'
    };
    return colors[element as keyof typeof colors] || colors.fire;
  };

  const getElementBg = (element: string) => {
    const colors = {
      fire: 'bg-orange-500/10 border-orange-500/30',
      water: 'bg-cyan-500/10 border-cyan-500/30',
      earth: 'bg-green-500/10 border-green-500/30',
      air: 'bg-gray-300/10 border-gray-400/30',
      aether: 'bg-purple-500/10 border-purple-500/30'
    };
    return colors[element as keyof typeof colors] || colors.fire;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiralogic-dark via-spiralogic-dark-secondary to-spiralogic-dark">
      {/* PWA-optimized padding and safe areas */}
      <div className="safe-top" />

      {/* Subtle elemental particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-40 h-40 bg-fire-base rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-water-base rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-earth-base rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 max-w-7xl mx-auto">
        {/* Header with Elemental Design */}
        <div className="bg-gradient-to-r from-sacred-brown/10 to-sacred-sage/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-gold-amber/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold-divine to-gold-amber rounded-full flex items-center justify-center text-spiralogic-dark text-xl sm:text-2xl font-bold">
                  ◈
                </div>
                <div className="absolute inset-0 bg-gold-divine rounded-full animate-pulse opacity-20" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gold-divine">ARIA Oracle Monitor</h1>
                <p className="text-gold-ethereal text-xs sm:text-sm">Elemental Balance & Protection</p>
              </div>
              <span className="bg-gradient-to-r from-fire-base to-earth-base text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                BETA v1.0.0
              </span>
            </div>

            {/* Elemental Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gold-divine drop-shadow-lg">{activeUsers}</div>
                <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase tracking-wider">Active</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-earth-base to-water-base bg-clip-text text-transparent">
                  {100 - hallucinationRate.toFixed(0)}%
                </div>
                <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase tracking-wider">Truth</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-4xl font-bold text-fire-base drop-shadow-lg">{riskLevel}/10</div>
                <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase tracking-wider">Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher with Elemental Design */}
        <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-1 mb-4 sm:mb-6 border border-gold-amber/20">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-earth-base to-sacred-sage text-white shadow-lg'
                  : 'text-gold-ethereal hover:text-white hover:bg-sacred-brown/20'
              }`}
            >
              👥 Beta Users
            </button>
            <button
              onClick={() => setActiveTab('protection')}
              className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'protection'
                  ? 'bg-gradient-to-r from-fire-base to-sacred-sienna text-white shadow-lg'
                  : 'text-gold-ethereal hover:text-white hover:bg-sacred-brown/20'
              }`}
            >
              🛡️ Protection
            </button>
            <button
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-2 px-3 sm:py-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'elements'
                  ? 'bg-gradient-to-r from-water-base to-air-base text-white shadow-lg'
                  : 'text-gold-ethereal hover:text-white hover:bg-sacred-brown/20'
              }`}
            >
              🌀 Elements
            </button>
          </div>
        </div>

        {/* User Activity Tab */}
        {activeTab === 'users' && (
          <>
            {/* Filters */}
            <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gold-amber/20">
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-spiralogic-dark/50 border border-gold-amber/30 rounded-lg text-gold-ethereal text-xs sm:text-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-gold-divine"
              >
                <option value="all">All Cohorts</option>
                <option value="A">Cohort A (Fire)</option>
                <option value="B">Cohort B (Water)</option>
                <option value="C">Cohort C (Earth)</option>
              </select>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Active Users */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🔥</span> Active Souls
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-2 sm:p-3 bg-spiralogic-dark/30 rounded-lg sm:rounded-xl border border-gold-amber/10 hover:bg-spiralogic-dark/50 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${getElementColor(user.element)} flex items-center justify-center text-white font-bold text-xs sm:text-sm`}>
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gold-ethereal text-sm sm:text-base flex items-center gap-1 sm:gap-2">
                            <span className="truncate max-w-[100px] sm:max-w-none">{user.name}</span>
                          </div>
                          <div className="text-[10px] sm:text-xs text-gold-amber/70 flex items-center gap-1 sm:gap-2">
                            <span className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              user.status === 'online' ? 'bg-earth-base animate-pulse' :
                              user.status === 'idle' ? 'bg-gold-amber' :
                              'bg-gray-400'
                            }`} />
                            {user.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-semibold text-earth-base">
                          {(user.engagement * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Elemental Metrics */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">💧</span> Sacred Metrics
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries({
                    'Session Duration': `${metrics.avgSession} min`,
                    'Messages/Session': metrics.avgMessages,
                    'Sacred Usage': `${metrics.sacredUsage}%`,
                    'Enrichment Rate': `${metrics.enrichmentRate}%`,
                    'Trust Field': metrics.trustAvg
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-earth-base/10 to-water-base/10 rounded-lg border border-sacred-sage/20">
                      <span className="text-gold-ethereal text-xs sm:text-sm">{key}:</span>
                      <span className="font-semibold text-gold-divine text-xs sm:text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🌍</span> Activity
                </h3>
                <div className="space-y-2 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {activities.map((activity, idx) => (
                    <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-l-4 ${getElementBg(activity.engagement)} backdrop-blur`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm sm:text-lg">{activity.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] sm:text-xs text-gold-amber/70">{activity.time}</div>
                          <div className="text-xs sm:text-sm text-gold-ethereal truncate">
                            <span className="font-semibold text-gold-divine">{activity.user}</span>
                            <span> {activity.action}</span>
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
            {/* Protection Status */}
            <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gold-amber/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-earth-base">{hallucinationRate.toFixed(1)}%</div>
                  <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase">Hallucination</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-water-base">{verificationRate}%</div>
                  <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-air-base">{cacheHitRate}%</div>
                  <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase">Cache Hit</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-fire-base">{fieldCoverage}%</div>
                  <div className="text-[10px] sm:text-xs text-gold-ethereal uppercase">Coverage</div>
                </div>
              </div>
            </div>

            {/* Protection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Threat Detection */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">⚡</span> Threats
                </h3>
                <div className="space-y-2 max-h-48 sm:max-h-64 lg:max-h-80 overflow-y-auto">
                  {threats.map((threat, idx) => (
                    <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-l-4 ${
                      threat.severity === 'high' ? 'border-fire-base bg-fire-base/10' :
                      threat.severity === 'medium' ? 'border-gold-amber bg-gold-amber/10' :
                      'border-earth-base bg-earth-base/10'
                    }`}>
                      <div className="text-[10px] sm:text-xs text-gold-amber/70">{threat.time}</div>
                      <div className="text-xs sm:text-sm font-semibold text-gold-divine">{threat.type}</div>
                      <div className="text-[10px] sm:text-xs text-gold-ethereal truncate">{threat.claim}</div>
                      <div className="text-[10px] sm:text-xs text-sacred-sage">→ {threat.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protection Stats */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🛡️</span> Stats
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(protectionMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-water-base/10 to-earth-base/10 rounded-lg border border-sacred-sage/20">
                      <span className="text-gold-ethereal text-xs sm:text-sm">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-semibold text-gold-divine text-xs sm:text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thresholds */}
              <div className="lg:col-span-1 bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
                <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🌬️</span> Thresholds
                </h3>
                <div className="space-y-3">
                  {[
                    { mode: 'Sacred Space', threshold: '95%', element: 'aether' },
                    { mode: 'Personal', threshold: '85%', element: 'fire' },
                    { mode: 'Advisory', threshold: '75%', element: 'water' },
                    { mode: 'Creative', threshold: '40%', element: 'earth' }
                  ].map((mode) => (
                    <div key={mode.mode} className="p-2 sm:p-3 bg-spiralogic-dark/30 rounded-lg border border-gold-amber/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm text-gold-ethereal">{mode.mode}</span>
                        <span className="text-xs sm:text-sm font-semibold text-gold-divine">{mode.threshold}</span>
                      </div>
                      <div className="w-full bg-spiralogic-dark/50 rounded-full h-1.5 sm:h-2">
                        <div className={`bg-gradient-to-r ${getElementColor(mode.element)} h-1.5 sm:h-2 rounded-full`}
                             style={{ width: mode.threshold }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Elemental Balance */}
            <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
              <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4">Elemental Balance</h3>
              <div className="space-y-4">
                {Object.entries(elementalBalance).map(([element, value]) => (
                  <div key={element}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gold-ethereal capitalize">{element}</span>
                      <span className="text-sm font-semibold text-gold-divine">{value}%</span>
                    </div>
                    <div className="w-full bg-spiralogic-dark/50 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${getElementColor(element)} h-2 rounded-full transition-all duration-500`}
                           style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
              <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4">More Monitors Coming</h3>
              <div className="space-y-3">
                <div className="p-3 bg-spiralogic-dark/30 rounded-lg border border-gold-amber/10">
                  <div className="text-sm font-medium text-gold-divine">Performance Metrics</div>
                  <div className="text-xs text-gold-ethereal">Response times, throughput, system health</div>
                </div>
                <div className="p-3 bg-spiralogic-dark/30 rounded-lg border border-gold-amber/10">
                  <div className="text-sm font-medium text-gold-divine">Revenue Analytics</div>
                  <div className="text-xs text-gold-ethereal">Subscription tracking, conversion rates</div>
                </div>
                <div className="p-3 bg-spiralogic-dark/30 rounded-lg border border-gold-amber/10">
                  <div className="text-sm font-medium text-gold-divine">Oracle Sessions</div>
                  <div className="text-xs text-gold-ethereal">Deep conversation analytics</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
            <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4">
              {activeTab === 'users' ? 'Oracle Sessions' : 'Protection Timeline'}
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
                  line: { color: '#7A9A65', width: 2 },
                  marker: { color: '#B69A78', size: isMobile ? 4 : 6 }
                }]}
                layout={{
                  height: isMobile ? 200 : 300,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    title: { text: 'Hour', font: { color: '#FEB95A', size: isMobile ? 10 : 12 }},
                    gridcolor: 'rgba(255,215,0,0.1)',
                    tickfont: { color: '#FEB95A', size: isMobile ? 8 : 10 }
                  },
                  yaxis: {
                    title: {
                      text: activeTab === 'users' ? 'Active Souls' : 'Risk Level',
                      font: { color: '#FEB95A', size: isMobile ? 10 : 12 }
                    },
                    gridcolor: 'rgba(255,215,0,0.1)',
                    tickfont: { color: '#FEB95A', size: isMobile ? 8 : 10 }
                  },
                  margin: { t: 20, r: 20, l: isMobile ? 40 : 50, b: isMobile ? 40 : 50 }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>

          <div className="bg-sacred-brown/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gold-amber/20">
            <h3 className="text-base sm:text-lg font-semibold text-gold-divine mb-3 sm:mb-4">
              {activeTab === 'users' ? 'Elemental Distribution' : 'Protection Analysis'}
            </h3>
            <div className="w-full overflow-x-auto">
              <Plot
                data={[{
                  labels: activeTab === 'users'
                    ? ['Fire', 'Water', 'Earth', 'Air']
                    : ['Verified', 'Enriched', 'Cached', 'Blocked'],
                  values: activeTab === 'users' ? [24, 31, 28, 17] : [65, 20, 10, 5],
                  type: 'pie',
                  hole: 0.4,
                  marker: {
                    colors: ['#C85450', '#6B9BD1', '#7A9A65', '#D4B896']
                  },
                  textfont: { color: '#FEB95A', size: isMobile ? 10 : 12 }
                }]}
                layout={{
                  height: isMobile ? 200 : 300,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  margin: { t: 20, r: 20, l: 20, b: 20 },
                  showlegend: !isMobile,
                  legend: {
                    font: { color: '#FEB95A', size: isMobile ? 8 : 10 }
                  }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-spiralogic-dark/95 backdrop-blur-lg rounded-2xl p-4 border border-gold-amber/30 shadow-2xl z-50">
        <p className="text-gold-ethereal text-sm mb-2">Install ARIA Monitor for quick access</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-gradient-to-r from-earth-base to-sacred-sage text-white py-2 px-4 rounded-lg text-sm font-semibold">
            Install
          </button>
          <button className="px-4 py-2 text-gold-amber text-sm">Later</button>
        </div>
      </div>

      <style jsx global>{`
        /* PWA Safe Areas */
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(182, 154, 120, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }

        /* Animations */
        @keyframes animation-delay-2000 {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes animation-delay-4000 {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.15); }
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
            min-height: 44px;
          }
        }

        /* PWA Standalone Mode */
        @media all and (display-mode: standalone) {
          .safe-top {
            background: linear-gradient(to bottom, rgba(10, 14, 39, 0.9), transparent);
          }
        }
      `}</style>
    </div>
  );
}