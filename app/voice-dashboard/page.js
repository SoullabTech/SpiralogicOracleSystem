'use client';

// Voice System Dashboard
// Development-only page for monitoring voice analytics

import { useState, useEffect } from 'react';

export default function VoiceDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only allow access in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '/';
      return;
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/voice-dashboard');
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return <div>Access denied in production</div>;
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        Loading voice analytics...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        Failed to load dashboard data
      </div>
    );
  }

  const { summary, sessions } = dashboardData;

  const getSuccessColor = (rate) => {
    if (rate >= 90) return '#22c55e'; // green
    if (rate >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getLatencyColor = (ms) => {
    if (ms <= 1500) return '#22c55e'; // green
    if (ms <= 3000) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Monaco, Consolas, monospace',
      background: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#22c55e', marginBottom: '30px' }}>
        🔍 Voice System Dashboard
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Total Sessions</h3>
          <div style={{ fontSize: '24px', color: '#22c55e' }}>
            {summary.totalSessions}
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Success Rate</h3>
          <div style={{
            fontSize: '24px',
            color: getSuccessColor(parseFloat(summary.avgSuccessRate))
          }}>
            {summary.avgSuccessRate}%
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Avg Latency</h3>
          <div style={{
            fontSize: '24px',
            color: getLatencyColor(summary.avgLatency)
          }}>
            {summary.avgLatency}ms
          </div>
        </div>

        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888' }}>Fallback Rate</h3>
          <div style={{
            fontSize: '24px',
            color: parseFloat(summary.fallbackRate) > 30 ? '#ef4444' : '#22c55e'
          }}>
            {summary.fallbackRate}%
          </div>
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#888' }}>Recent Sessions</h3>

        {sessions.length === 0 ? (
          <div style={{ color: '#666' }}>No sessions recorded yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Session</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Attempts</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Successful</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Success Rate</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Avg Latency</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Fallbacks</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, i) => {
                  const successRate = session.attempts > 0 ? (session.successful / session.attempts * 100) : 0;
                  const avgLatency = session.successful > 0 ? Math.round(session.totalLatency / session.successful) : 0;
                  const duration = Math.round((session.lastActivity - session.startTime) / 1000);

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '10px', color: '#fff' }}>{session.sessionId}</td>
                      <td style={{ padding: '10px', color: '#fff' }}>{session.attempts}</td>
                      <td style={{ padding: '10px', color: '#fff' }}>{session.successful}</td>
                      <td style={{
                        padding: '10px',
                        color: getSuccessColor(successRate)
                      }}>
                        {successRate.toFixed(1)}%
                      </td>
                      <td style={{
                        padding: '10px',
                        color: getLatencyColor(avgLatency)
                      }}>
                        {avgLatency}ms
                      </td>
                      <td style={{
                        padding: '10px',
                        color: session.fallbacks > 0 ? '#f59e0b' : '#22c55e'
                      }}>
                        {session.fallbacks}
                      </td>
                      <td style={{ padding: '10px', color: '#888' }}>{duration}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Note:</strong> This dashboard is only available in development mode.
        Data refreshes every 5 seconds. All metrics are privacy-safe (no transcript content stored).
      </div>
    </div>
  );
}