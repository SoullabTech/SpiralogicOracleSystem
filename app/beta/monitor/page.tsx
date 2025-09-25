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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize mock data
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

    setActivities([
      { time: '2m', user: 'Alice', action: 'Session started', type: 'session' },
      { time: '5m', user: 'Bob', action: 'Voice enabled', type: 'voice' },
      { time: '8m', user: 'Carol', action: 'Conversation ended', type: 'end' },
      { time: '12m', user: 'David', action: 'Feedback provided', type: 'feedback' },
      { time: '15m', user: 'Eve', action: 'Session paused', type: 'pause' }
    ]);

    setMetrics({
      avgSession: '23',
      avgMessages: '18',
      voiceUsage: '32',
      completionRate: '87',
      trustAvg: '0.77'
    });

    setThreats([
      { time: '1m', type: 'Low Confidence', action: 'Verified', severity: 'low' },
      { time: '3m', type: 'Ambiguous', action: 'Enriched', severity: 'medium' },
      { time: '5m', type: 'Contradiction', action: 'Resolved', severity: 'high' },
      { time: '12m', type: 'Cold Start', action: 'Cached', severity: 'low' }
    ]);

    setProtectionMetrics({
      verifiedClaims: 1247,
      blockedHallucinations: 26,
      enrichments: 89,
      cacheHits: 412,
      avgResponseTime: '120ms'
    });

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

  return (
    <div className="min-h-screen bg-[#1a1f3a]">
      <div className="safe-top" />

      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Header */}
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
          </div>

          {/* Key Metrics */}
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
            {['users', 'protection', 'system', 'conversation'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-[#F6AD55] text-gray-900'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {users.map(user => (
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'protection' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Protection Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Verification Rate</span>
                  <span className="text-sm text-green-400">{verificationRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Cache Hit Rate</span>
                  <span className="text-sm text-blue-400">{cacheHitRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Field Coverage</span>
                  <span className="text-sm text-amber-400">{fieldCoverage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">System Health</h3>
            <div className="text-center text-gray-400">System metrics coming soon...</div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Conversation Flow</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Silence Threshold</span>
                  <span className="text-sm text-[#F6AD55] font-medium">{conversationMetrics.avgSilenceThreshold}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Turn-Taking Accuracy</span>
                  <span className="text-sm text-green-400">{conversationMetrics.turnTakingAccuracy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Back-Channel Rate</span>
                  <span className="text-sm text-gray-200">{conversationMetrics.backChannelRate}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">User Engagement</h3>
              <div className="space-y-3">
                {engagementScores.slice(0, 3).map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-200">{user.user}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-full rounded-full bg-[#F6AD55]"
                          style={{ width: `${user.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{user.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
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
      `}</style>
    </div>
  );
}