'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeTab, setActiveTab] = useState<'users' | 'protection' | 'system' | 'conversation'>('users');
  const [isMobile, setIsMobile] = useState(false);

  // User Activity States
  const [activeUsers, setActiveUsers] = useState(3);
  const [totalUsers, setTotalUsers] = useState(5);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [sessionActive, setSessionActive] = useState(true);

  // Protection Monitor States
  const [hallucinationRate, setHallucinationRate] = useState(2.1);
  const [verificationRate, setVerificationRate] = useState(94);
  const [cacheHitRate, setCacheHitRate] = useState(78);
  const [fieldCoverage, setFieldCoverage] = useState(67);
  const [threats, setThreats] = useState<any[]>([]);
  const [protectionMetrics, setProtectionMetrics] = useState<any>({});
  const [riskLevel, setRiskLevel] = useState(2);

  // Conversation Magic States
  const [conversationMetrics, setConversationMetrics] = useState<any>({});
  const [emotionalTones, setEmotionalTones] = useState<any[]>([]);
  const [engagementScores, setEngagementScores] = useState<any[]>([]);
  const [interruptionData, setInterruptionData] = useState<any[]>([]);
  const [backChannelEvents, setBackChannelEvents] = useState<any[]>([]);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize User Data
    const mockUsers = [
      { id: 'user001', name: 'Alice C', status: 'online', sessions: 24, engagement: 0.85, trustScore: 0.78 },
      { id: 'user002', name: 'Bob S', status: 'online', sessions: 12, engagement: 0.72, trustScore: 0.65 },
      { id: 'user003', name: 'Carol J', status: 'idle', sessions: 18, engagement: 0.91, trustScore: 0.82 },
      { id: 'user004', name: 'David K', status: 'offline', sessions: 8, engagement: 0.68, trustScore: 0.70 },
      { id: 'user005', name: 'Eve W', status: 'offline', sessions: 31, engagement: 0.94, trustScore: 0.88 }
    ];

    setUsers(mockUsers);
    setActiveUsers(mockUsers.filter(u => u.status === 'online').length);
    setTotalUsers(mockUsers.length);
    setAvgEngagement(Math.round(mockUsers.reduce((acc, u) => acc + u.engagement, 0) / mockUsers.length * 100));

    const mockActivities = [
      { time: '2m', user: 'Alice', action: 'Session started', type: 'session' },
      { time: '5m', user: 'Bob', action: 'Voice enabled', type: 'voice' },
      { time: '8m', user: 'Carol', action: 'Conversation ended', type: 'end' },
      { time: '12m', user: 'David', action: 'Feedback provided', type: 'feedback' },
      { time: '15m', user: 'Eve', action: 'Session paused', type: 'pause' }
    ];

    setActivities(mockActivities);

    setMetrics({
      avgSession: '23',
      avgMessages: '18',
      voiceUsage: '32',
      completionRate: '87',
      trustAvg: '0.77'
    });

    // Initialize Protection Data
    const mockThreats = [
      { time: '1m', type: 'Low Confidence', action: 'Verified', severity: 'low' },
      { time: '3m', type: 'Ambiguous', action: 'Enriched', severity: 'medium' },
      { time: '5m', type: 'Contradiction', action: 'Resolved', severity: 'high' },
      { time: '12m', type: 'Cold Start', action: 'Cached', severity: 'low' }
    ];

    setThreats(mockThreats);

    setProtectionMetrics({
      verifiedClaims: 1247,
      blockedHallucinations: 26,
      enrichments: 89,
      cacheHits: 412,
      avgResponseTime: '120ms'
    });

    // Initialize Conversation Magic Data
    setConversationMetrics({
      avgSilenceThreshold: '1.8s',
      avgUtteranceLength: '12 words',
      avgEngagement: 72,
      totalInterruptions: 8,
      backChannelRate: '23%',
      emotionalAdaptations: 14,
      turnTakingAccuracy: '89%',
      rhythmAdaptation: 'Learning'
    });

    setEmotionalTones([
      { time: '2m', user: 'Alice', tone: 'excited', response: 'matched' },
      { time: '5m', user: 'Bob', tone: 'contemplative', response: 'slowed' },
      { time: '8m', user: 'Carol', tone: 'stressed', response: 'calmed' },
      { time: '12m', user: 'David', tone: 'joyful', response: 'elevated' }
    ]);

    setEngagementScores([
      { user: 'Alice', score: 85, trend: 'up' },
      { user: 'Bob', score: 72, trend: 'stable' },
      { user: 'Carol', score: 91, trend: 'up' },
      { user: 'David', score: 68, trend: 'down' },
      { user: 'Eve', score: 94, trend: 'up' }
    ]);

    setInterruptionData([
      { time: '3m', user: 'Alice', type: 'natural', handled: 'graceful' },
      { time: '7m', user: 'Bob', type: 'urgent', handled: 'immediate' },
      { time: '15m', user: 'Carol', type: 'clarification', handled: 'paused' }
    ]);

    setBackChannelEvents([
      { time: '1m', user: 'Alice', phrase: 'mm-hmm', context: 'listening' },
      { time: '4m', user: 'Bob', phrase: 'go on', context: 'encouraging' },
      { time: '6m', user: 'Carol', phrase: 'yeah', context: 'agreeing' },
      { time: '9m', user: 'David', phrase: 'interesting', context: 'engaged' }
    ]);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredUsers = selectedCohort === 'all'
    ? users
    : users.filter(u => u.cohort === selectedCohort);

  return (
    <div className="min-h-screen bg-[#1a1f3a]">
      {/* PWA Safe Area - AIN Amber Design System */}
      <div className="safe-top" />

      {/* Spiralogic Geometry Background - Part of 'AIN Amber' Design System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Minimal Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-light text-gray-200">ARIA Monitor</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                sessionActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                Session {sessionActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <button className="p-2 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z"/>
              </svg>
            </button>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-light text-gray-100">{activeUsers}/{totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Active Users</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-light text-gray-100">{100 - hallucinationRate.toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-light text-gray-100">{riskLevel}/10</div>
              <div className="text-xs text-gray-500 mt-1">Risk Level</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-[#F6AD55] text-gray-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('protection')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'protection'
                  ? 'bg-[#F6AD55] text-gray-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Protection
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'system'
                  ? 'bg-[#F6AD55] text-gray-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              System
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'conversation'
                  ? 'bg-[#F6AD55] text-gray-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Conversation
            </button>
          </div>
        </div>

        {/* User Activity Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Active Users List */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-green-400' :
                        user.status === 'idle' ? 'bg-yellow-400' :
                        'bg-gray-600'
                      }`} />
                      <div>
                        <div className="text-sm text-gray-200">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.sessions} sessions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{(user.engagement * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Session Metrics</h3>
              <div className="space-y-4">
                {Object.entries({
                  'Avg Duration': `${metrics.avgSession} min`,
                  'Messages': metrics.avgMessages,
                  'Voice Usage': `${metrics.voiceUsage}%`,
                  'Completion': `${metrics.completionRate}%`,
                  'Trust Score': metrics.trustAvg
                }).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{key}</span>
                    <span className="text-sm text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F6AD55] mt-1.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">{activity.time} ago</div>
                      <div className="text-sm text-gray-200">
                        <span className="text-gray-400">{activity.user}</span>
                        <span className="text-gray-300 ml-1">{activity.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Protection Tab */}
        {activeTab === 'protection' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Protection Status */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Protection Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-light text-gray-100">{hallucinationRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Hallucination Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">{verificationRate}%</div>
                  <div className="text-xs text-gray-500">Verified</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">{cacheHitRate}%</div>
                  <div className="text-xs text-gray-500">Cache Hit</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">{fieldCoverage}%</div>
                  <div className="text-xs text-gray-500">Coverage</div>
                </div>
              </div>
            </div>

            {/* Threat Log */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Threat Detection</h3>
              <div className="space-y-3">
                {threats.map((threat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        threat.severity === 'high' ? 'bg-red-400' :
                        threat.severity === 'medium' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`} />
                      <div>
                        <div className="text-sm text-gray-200">{threat.type}</div>
                        <div className="text-xs text-gray-500">{threat.time} ago</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{threat.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protection Stats */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Protection Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(protectionMetrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-lg font-light text-gray-100">{value}</div>
                    <div className="text-xs text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Health */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">System Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">CPU Usage</span>
                    <span className="text-xs text-gray-400">23%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-[#F6AD55] h-1.5 rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Memory</span>
                    <span className="text-xs text-gray-400">47%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-[#F6AD55] h-1.5 rounded-full" style={{ width: '47%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Network</span>
                    <span className="text-xs text-gray-400">12%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-[#F6AD55] h-1.5 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Response Times</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Average</span>
                  <span className="text-sm text-gray-200">120ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">P50</span>
                  <span className="text-sm text-gray-200">95ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">P95</span>
                  <span className="text-sm text-gray-200">245ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">P99</span>
                  <span className="text-sm text-gray-200">380ms</span>
                </div>
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-400 mb-4">System Uptime</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-light text-gray-100">99.9%</div>
                  <div className="text-xs text-gray-500">This Month</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">14d</div>
                  <div className="text-xs text-gray-500">Current Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">0</div>
                  <div className="text-xs text-gray-500">Incidents</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-100">1.2ms</div>
                  <div className="text-xs text-gray-500">Avg Latency</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              {activeTab === 'users' ? 'Activity Timeline' : activeTab === 'protection' ? 'Risk Timeline' : 'Performance'}
            </h3>
            <div className="w-full h-48 flex items-center justify-center text-gray-600">
              <Plot
                data={[{
                  x: Array.from({length: 12}, (_, i) => i),
                  y: Array.from({length: 12}, () => Math.random() * 50 + 20),
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#F6AD55', width: 1.5, shape: 'spline' },
                  fill: 'tozeroy',
                  fillcolor: 'rgba(246, 173, 85, 0.1)'
                }]}
                layout={{
                  height: 180,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  margin: { t: 0, r: 0, l: 0, b: 0 },
                  xaxis: {
                    visible: false,
                    showgrid: false,
                    zeroline: false
                  },
                  yaxis: {
                    visible: false,
                    showgrid: false,
                    zeroline: false
                  },
                  showlegend: false
                }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              {activeTab === 'users' ? 'Session Distribution' : activeTab === 'protection' ? 'Protection Analysis' : 'Resource Usage'}
            </h3>
            <div className="w-full h-48 flex items-center justify-center text-gray-600">
              <Plot
                data={[{
                  values: [30, 25, 20, 25],
                  labels: activeTab === 'users' ? ['Voice', 'Chat', 'Mixed', 'Other'] :
                          activeTab === 'protection' ? ['Verified', 'Cached', 'Enriched', 'Blocked'] :
                          ['CPU', 'Memory', 'Network', 'Storage'],
                  type: 'pie',
                  hole: 0.6,
                  marker: {
                    colors: ['#F6AD55', '#94a3b8', '#64748b', '#475569']
                  },
                  textinfo: 'none',
                  hoverinfo: 'label+percent'
                }]}
                layout={{
                  height: 180,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  margin: { t: 0, r: 0, l: 0, b: 0 },
                  showlegend: false
                }}
                config={{ displayModeBar: false, responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden fixed bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 shadow-2xl z-50">
        <p className="text-gray-300 text-sm mb-3">Install ARIA Monitor</p>
        <div className="flex gap-2">
          <button className="flex-1 bg-[#F6AD55] text-gray-900 py-2 px-4 rounded-lg text-sm font-medium">
            Install
          </button>
          <button className="px-4 py-2 text-gray-500 text-sm">Later</button>
        </div>
      </div>

      <style jsx global>{`
        /* PWA Safe Areas */
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }

        /* Custom Minimal Scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.3);
        }

        {/* Conversation Magic Tab */}
        {activeTab === 'conversation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Conversation Flow Metrics */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Conversation Flow</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Silence Threshold</span>
                  <span className="text-sm text-[#F6AD55] font-medium">{conversationMetrics.avgSilenceThreshold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Utterance Length</span>
                  <span className="text-sm text-gray-200">{conversationMetrics.avgUtteranceLength}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Turn-Taking Accuracy</span>
                  <span className="text-sm text-green-400">{conversationMetrics.turnTakingAccuracy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Rhythm Adaptation</span>
                  <span className="text-sm text-blue-400">{conversationMetrics.rhythmAdaptation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Back-Channel Rate</span>
                  <span className="text-sm text-gray-200">{conversationMetrics.backChannelRate}</span>
                </div>
              </div>
            </div>

            {/* Engagement Scores */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">User Engagement</h3>
              <div className="space-y-3">
                {engagementScores.map((user: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-200">{user.user}</div>
                      {user.trend === 'up' && (
                        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 13.5L10 9l4.5 4.5L16 12v5h-5l-1.5-1.5L10 15l-4.5-4.5z"/>
                        </svg>
                      )}
                      {user.trend === 'down' && (
                        <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M14.5 6.5L10 11 5.5 6.5 4 8v-5h5l-1.5 1.5L10 5l4.5 4.5z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${user.score}%`,
                            backgroundColor: user.score > 80 ? '#F6AD55' : user.score > 60 ? '#E89923' : '#D97706'
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{user.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Average Engagement</span>
                  <span className="text-lg font-light text-[#F6AD55]">{conversationMetrics.avgEngagement}%</span>
                </div>
              </div>
            </div>

            {/* Emotional Tone Tracking */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Emotional Adaptation</h3>
              <div className="space-y-3">
                {emotionalTones.map((event: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{event.time}</span>
                      <span className="text-gray-200">{event.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {event.tone}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        {event.response}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Adaptations</span>
                  <span className="text-sm text-gray-200">{conversationMetrics.emotionalAdaptations}</span>
                </div>
              </div>
            </div>

            {/* Interruption & Back-Channel Events */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Natural Interactions</h3>

              {/* Interruptions */}
              <div className="mb-4">
                <h4 className="text-xs text-gray-500 mb-2">Interruption Handling</h4>
                <div className="space-y-2">
                  {interruptionData.map((event: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{event.time}</span>
                        <span className="text-gray-200">{event.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{event.type}</span>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                          {event.handled}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back-Channels */}
              <div className="pt-4 border-t border-gray-700/50">
                <h4 className="text-xs text-gray-500 mb-2">Back-Channel Recognition</h4>
                <div className="space-y-2">
                  {backChannelEvents.map((event: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{event.time}</span>
                        <span className="text-gray-200">{event.user}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          "{event.phrase}"
                        </span>
                        <span className="text-gray-400">({event.context})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Total Interruptions</div>
                  <div className="text-lg font-light text-gray-200">{conversationMetrics.totalInterruptions}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Back-Channel Rate</div>
                  <div className="text-lg font-light text-[#F6AD55]">{conversationMetrics.backChannelRate}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safe Area Styles */}
      <style jsx>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
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
            background: linear-gradient(to bottom, rgba(26, 31, 58, 0.95), transparent);
          }
        }
      `}</style>
    </div>
  );
}