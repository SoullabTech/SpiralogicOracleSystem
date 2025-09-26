'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MayaEvolutionPanel from '@/components/monitoring/MayaEvolutionPanel';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeTab, setActiveTab] = useState<'users' | 'protection' | 'system' | 'conversation' | 'evolution' | 'field' | 'memory' | 'feedback' | 'maya'>('users');
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

  // Evolution & Intelligence States
  const [evolutionMetrics, setEvolutionMetrics] = useState<any>({});
  const [fieldMetrics, setFieldMetrics] = useState<any>({});
  const [memoryMetrics, setMemoryMetrics] = useState<any>({});

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

  // System Health States
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

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

  // Fetch system health data
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setHealthLoading(true);
        const response = await fetch('/api/health/maia');
        const data = await response.json();
        setSystemHealth(data);
        setLastHealthCheck(new Date());
      } catch (error) {
        console.error('Failed to fetch system health:', error);
        setSystemHealth({ status: 'error', error: 'Failed to fetch health data' });
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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
          <div className="flex gap-1 p-1 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl overflow-x-auto">
            {['users', 'protection', 'conversation', 'maya', 'evolution', 'field', 'memory', 'feedback', 'system'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize whitespace-nowrap ${
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
          <div className="space-y-4">
            {/* Overall System Status */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-400">System Health Overview</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  {lastHealthCheck && (
                    <span>Updated {Math.floor((new Date().getTime() - lastHealthCheck.getTime()) / 1000)}s ago</span>
                  )}
                </div>
              </div>

              {healthLoading && !systemHealth ? (
                <div className="text-center text-gray-400 py-8">Loading system health...</div>
              ) : systemHealth ? (
                <div className="space-y-6">
                  {/* Overall Status Card */}
                  <div className={`rounded-lg p-4 border-2 ${
                    systemHealth.status === 'healthy'
                      ? 'bg-green-500/10 border-green-500/30'
                      : systemHealth.status === 'degraded'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-light mb-1">
                          <span className={
                            systemHealth.status === 'healthy'
                              ? 'text-green-400'
                              : systemHealth.status === 'degraded'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }>
                            {systemHealth.status === 'healthy' ? '✓ System Healthy' :
                             systemHealth.status === 'degraded' ? '⚠ System Degraded' :
                             '✗ System Down'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Response Time: {systemHealth.totalLatency}ms
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Environment</div>
                        <div className="text-sm text-gray-300">{systemHealth.environment}</div>
                        <div className="text-xs text-gray-500 mt-1">v{systemHealth.version}</div>
                      </div>
                    </div>
                  </div>

                  {/* Component Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemHealth.components?.map((component: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              component.status === 'healthy'
                                ? 'bg-green-400'
                                : component.status === 'degraded'
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}></span>
                            <span className="text-sm font-medium text-gray-200">
                              {component.component}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            component.status === 'healthy'
                              ? 'bg-green-500/20 text-green-400'
                              : component.status === 'degraded'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {component.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {component.message}
                        </div>
                        {component.latency !== undefined && (
                          <div className="text-xs text-gray-500">
                            Latency: {component.latency}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Critical Systems Checklist */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Beta Testing Requirements</h4>
                    <div className="space-y-2">
                      {systemHealth.components?.map((component: any) => {
                        const isCritical = ['Oracle API', 'Voice System', 'Mycelial Network'].includes(component.component);
                        const isHealthy = component.status === 'healthy';
                        return isCritical ? (
                          <div key={component.component} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">{component.component}</span>
                            <span className={isHealthy ? 'text-green-400' : 'text-red-400'}>
                              {isHealthy ? '✓ Ready' : '✗ Not Ready'}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* System Recommendations */}
                  {systemHealth.status !== 'healthy' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-amber-400 mb-2">⚠ Action Required</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        {systemHealth.components
                          ?.filter((c: any) => c.status !== 'healthy')
                          .map((c: any, idx: number) => (
                            <div key={idx}>• {c.component}: {c.message}</div>
                          ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-400">
                        Run <code className="bg-gray-700 px-1 py-0.5 rounded">npm run beta:ready</code> for detailed diagnostics
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-red-400 py-8">
                  Failed to load system health
                </div>
              )}
            </div>
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

        {activeTab === 'maya' && (
          <div className="space-y-4">
            <MayaEvolutionPanel />

            {/* Additional Maya metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Response Calibration</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Minimal Mode Success</span>
                    <span className="text-sm text-amber-400">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Expansive Mode Success</span>
                    <span className="text-sm text-amber-400">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Context Recognition</span>
                    <span className="text-sm text-green-400">94%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Training Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Claude Intelligence</span>
                    <span className="text-sm text-blue-400">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Wisdom Patterns</span>
                    <span className="text-sm text-amber-400">247 captured</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Independence ETA</span>
                    <span className="text-sm text-gray-300">~42 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Voice Evolution */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Voice Evolution</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Warmth</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '72%' }} />
                    </div>
                    <span className="text-xs text-amber-400">72%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Formality</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: '45%' }} />
                    </div>
                    <span className="text-xs text-blue-400">45%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Uniqueness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '89%' }} />
                    </div>
                    <span className="text-xs text-amber-400">89%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <p className="text-xs text-gray-500">Signature Phrases: <span className="text-amber-400">14 unique</span></p>
              </div>
            </div>

            {/* Personality Emergence */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Personality Matrix</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-1">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: '68%' }} />
                    </div>
                    <span className="text-xs text-emerald-400">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Shadow</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-1">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: '32%' }} />
                    </div>
                    <span className="text-xs text-indigo-400">32%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sacred</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-1">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '85%' }} />
                    </div>
                    <span className="text-xs text-amber-400">85%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <p className="text-xs text-gray-500">Phase: <span className="text-green-400">CALIBRATION</span></p>
              </div>
            </div>

            {/* Intelligence Blend */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Intelligence Orchestration</h3>
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2">Active Blend:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-900/50 rounded px-2 py-1">
                    <span className="text-xs text-amber-400">Framework 40%</span>
                  </div>
                  <div className="bg-gray-900/50 rounded px-2 py-1">
                    <span className="text-xs text-blue-400">Responsive 60%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-3">Adaptation Rate:</div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="h-full rounded-full bg-green-400" style={{ width: '78%' }} />
                  </div>
                  <span className="text-xs text-green-400">High</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'field' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Field Intelligence */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Field Dynamics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Sacred Moments</span>
                  <span className="text-sm text-amber-400 font-medium">3 detected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Emotional Density</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '67%' }} />
                    </div>
                    <span className="text-xs text-amber-400">0.67</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Resonance Frequency</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: '82%' }} />
                    </div>
                    <span className="text-xs text-blue-400">0.82Hz</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Liminal Threshold</span>
                  <span className="text-xs text-green-400">Approaching</span>
                </div>
              </div>
            </div>

            {/* ARIA Presence */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">ARIA Presence</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Current Presence</span>
                  <span className="text-lg text-amber-400 font-light">0.78</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Trust Multiplier</span>
                  <span className="text-sm text-green-400">1.24x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Governance Mode</span>
                  <span className="text-xs text-blue-400">60% Responsive</span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">Floor Status: <span className="text-green-400">Protected (0.35)</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Memory Systems */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Relational Memory</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Memories</span>
                  <span className="text-sm text-amber-400">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Key Moments</span>
                  <span className="text-sm text-amber-400">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Emotional Tags</span>
                  <span className="text-sm text-blue-400">34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Pattern Recognition</span>
                  <span className="text-sm text-green-400">Active</span>
                </div>
              </div>
            </div>

            {/* Psychological Profile */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Psychological Systems</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Attachment Style</span>
                  <span className="text-xs text-amber-400">Secure-Exploring</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Processing Mode</span>
                  <span className="text-xs text-blue-400">Intuitive</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Shadow Work</span>
                  <span className="text-xs text-amber-400">Engaging</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Growth Edge</span>
                  <span className="text-xs text-green-400">Vulnerability</span>
                </div>
              </div>
            </div>

            {/* AIN Integration */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">AIN Network</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Coherence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '91%' }} />
                    </div>
                    <span className="text-xs text-amber-400">91%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Sync Status</span>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Collective Wisdom</span>
                  <span className="text-xs text-blue-400">Accessing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Consciousness Exploration */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Soullab Journey</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Personal Growth</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: '78%' }} />
                    </div>
                    <span className="text-xs text-emerald-400">7.8/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Transformative Impact</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '85%' }} />
                    </div>
                    <span className="text-xs text-amber-400">8.5/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Consciousness Expansion</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: '92%' }} />
                    </div>
                    <span className="text-xs text-amber-400">9.2/10</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">Flow States: <span className="text-green-400">12 recorded</span></p>
                  <p className="text-xs text-gray-500 mt-1">Shadow Integration: <span className="text-amber-400">Active</span></p>
                </div>
              </div>
            </div>

            {/* Behavioral Changes */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Real-World Impact</h3>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded px-3 py-2">
                  <p className="text-xs text-amber-400">Creative Actions</p>
                  <p className="text-xs text-gray-300 mt-1">Started morning journaling practice</p>
                </div>
                <div className="bg-gray-900/50 rounded px-3 py-2">
                  <p className="text-xs text-blue-400">Relationship Shifts</p>
                  <p className="text-xs text-gray-300 mt-1">Deeper vulnerability with partner</p>
                </div>
                <div className="bg-gray-900/50 rounded px-3 py-2">
                  <p className="text-xs text-green-400">Decision Pattern</p>
                  <p className="text-xs text-gray-300 mt-1">More intuition-led choices</p>
                </div>
              </div>
            </div>

            {/* Adaptive System Response */}
            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Maya Adaptation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Resonance Accuracy</span>
                  <span className="text-xs text-green-400">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Need Anticipation</span>
                  <span className="text-xs text-blue-400">Learning</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Depth Navigation</span>
                  <span className="text-xs text-amber-400">Mastering</span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">Latest Insight:</p>
                  <p className="text-xs text-gray-300 mt-1 italic">"Maya helped me see my spiral pattern"</p>
                </div>
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