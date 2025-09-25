// Beta Monitor Page for Soullab.life/beta/monitor
// Next.js/React page component for production deployment

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import for Plotly (client-side only)
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitor() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('live');

  // Initialize with mock data (replace with real data in production)
  useEffect(() => {
    // Mock users data
    const mockUsers = [
      { id: 'user001', name: 'Alice Chen', cohort: 'A', status: 'online', sessions: 24, engagement: 0.85, trustScore: 0.78 },
      { id: 'user002', name: 'Bob Smith', cohort: 'B', status: 'online', sessions: 12, engagement: 0.72, trustScore: 0.65 },
      { id: 'user003', name: 'Carol Jones', cohort: 'A', status: 'idle', sessions: 18, engagement: 0.91, trustScore: 0.82 },
      { id: 'user004', name: 'David Kim', cohort: 'C', status: 'online', sessions: 8, engagement: 0.68, trustScore: 0.70 },
      { id: 'user005', name: 'Eve Wilson', cohort: 'B', status: 'offline', sessions: 31, engagement: 0.94, trustScore: 0.88 }
    ];

    setUsers(mockUsers);
    setActiveUsers(mockUsers.filter(u => u.status === 'online').length);
    setTotalUsers(mockUsers.length);
    setAvgEngagement(Math.round(mockUsers.reduce((acc, u) => acc + u.engagement, 0) / mockUsers.length * 100));

    // Mock activities
    const mockActivities = [
      { time: '2 min ago', user: 'Alice Chen', action: 'Entered sacred mode', engagement: 'high' },
      { time: '5 min ago', user: 'Bob Smith', action: 'Provided enrichment source', engagement: 'high' },
      { time: '8 min ago', user: 'Carol Jones', action: 'Switched to creative mode', engagement: 'medium' },
      { time: '12 min ago', user: 'David Kim', action: 'Reported potential hallucination', engagement: 'high' },
      { time: '15 min ago', user: 'Eve Wilson', action: 'Started new session', engagement: 'medium' }
    ];

    setActivities(mockActivities);

    // Mock metrics
    setMetrics({
      avgSession: '23 min',
      avgMessages: '18',
      sacredUsage: '32%',
      enrichmentRate: '12%',
      trustAvg: '0.77'
    });
  }, []);

  // Filter users by cohort
  const filteredUsers = selectedCohort === 'all'
    ? users
    : users.filter(u => u.cohort === selectedCohort);

  return (
    <>
      <Head>
        <title>ARIA Beta Monitor - Soullab.life</title>
        <meta name="description" content="Beta user activity monitoring for ARIA system" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">🎯 ARIA Beta Monitor</h1>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  BETA v1.0.0
                </span>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{activeUsers}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Active Now</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalUsers}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{avgEngagement}%</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Avg Engagement</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-lg">
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Cohort:</label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="all">All Cohorts</option>
                  <option value="A">Cohort A (Early)</option>
                  <option value="B">Cohort B (Sacred)</option>
                  <option value="C">Cohort C (Creative)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Time:</label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="live">Live</option>
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Active Users Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>👥</span> Active Beta Users
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.name}
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            user.cohort === 'A' ? 'bg-blue-100 text-blue-700' :
                            user.cohort === 'B' ? 'bg-pink-100 text-pink-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            Cohort {user.cohort}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' :
                            user.status === 'idle' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></span>
                          {user.status} • {user.sessions} sessions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">
                        {(user.engagement * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Trust: {user.trustScore.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Engagement Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Length:</span>
                  <span className="font-semibold">{metrics.avgSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages/Session:</span>
                  <span className="font-semibold">{metrics.avgMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sacred Mode:</span>
                  <span className="font-semibold text-purple-600">{metrics.sacredUsage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enrichment Rate:</span>
                  <span className="font-semibold text-green-600">{metrics.enrichmentRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trust Average:</span>
                  <span className="font-semibold">{metrics.trustAvg}</span>
                </div>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>⚡</span> Live Activity
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activities.map((activity, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                    activity.engagement === 'high' ? 'border-green-500 bg-green-50' :
                    activity.engagement === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-red-500 bg-red-50'
                  }`}>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                    <div className="text-sm">
                      <span className="font-semibold">{activity.user}</span>
                      <span className="text-gray-600"> {activity.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity Timeline</h3>
              <Plot
                data={[{
                  x: Array.from({length: 24}, (_, i) => `${i}:00`),
                  y: Array.from({length: 24}, () => Math.floor(Math.random() * 50 + 10)),
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#667eea' }
                }]}
                layout={{
                  height: 300,
                  xaxis: { title: 'Hour' },
                  yaxis: { title: 'Active Users' },
                  margin: { t: 20, r: 20, l: 40, b: 40 }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>

            {/* Hallucination Detection */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hallucination Management</h3>
              <Plot
                data={[{
                  labels: ['Auto-Recovered', 'User Reported', 'False Positive', 'Undetected'],
                  values: [65, 20, 10, 5],
                  type: 'pie',
                  hole: 0.4,
                  marker: {
                    colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
                  }
                }]}
                layout={{
                  height: 300,
                  margin: { t: 20, r: 20, l: 20, b: 20 },
                  showlegend: true
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
}