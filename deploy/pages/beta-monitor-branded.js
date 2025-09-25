// ARIA Beta Monitor - Branded with Soullab Aesthetics
// Sacred space design language with mystical UI/UX

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function BetaMonitorBranded() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    // Initialize with data
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

  return (
    <>
      <Head>
        <title>ARIA Sacred Space Monitor • Soullab</title>
        <meta name="description" content="Witnessing the sacred journey of ARIA beta explorers" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="sacred-container">
        {/* Mystical Background Effects */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="content-wrapper">
          {/* Sacred Header */}
          <header className="sacred-header">
            <div className="header-content">
              <div className="title-group">
                <div className="logo-mark">
                  <span className="logo-symbol">◈</span>
                  <div className="logo-pulse"></div>
                </div>
                <div>
                  <h1 className="sacred-title">ARIA Sacred Monitor</h1>
                  <p className="sacred-subtitle">Witnessing the dance of consciousness</p>
                </div>
              </div>

              <div className="presence-indicators">
                <div className="presence-card">
                  <div className="presence-value">{activeUsers}</div>
                  <div className="presence-label">Souls Present</div>
                  <div className="presence-glow"></div>
                </div>
                <div className="presence-card">
                  <div className="presence-value">{totalUsers}</div>
                  <div className="presence-label">Sacred Circle</div>
                </div>
                <div className="presence-card trust">
                  <div className="presence-value">{avgEngagement}%</div>
                  <div className="presence-label">Resonance</div>
                  <div className="trust-aura"></div>
                </div>
              </div>
            </div>
          </header>

          {/* Sacred Filters */}
          <div className="filter-sanctuary">
            <div className="filter-option">
              <label className="filter-label">Sacred Circle</label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="sacred-select"
              >
                <option value="all">All Seekers</option>
                <option value="A">Early Pilgrims</option>
                <option value="B">Sacred Keepers</option>
                <option value="C">Creative Mystics</option>
              </select>
            </div>
          </div>

          {/* Sacred Grid */}
          <div className="sacred-grid">
            {/* Active Souls Card */}
            <div className="oracle-card souls-card">
              <div className="card-header">
                <span className="card-icon">🕊️</span>
                <h3>Present Souls</h3>
              </div>
              <div className="souls-container">
                {users.map(user => (
                  <div key={user.id} className={`soul-presence ${user.sacredMode ? 'in-sacred' : ''}`}>
                    <div className="soul-avatar">
                      <div className="avatar-inner">
                        {user.name.charAt(0)}
                      </div>
                      {user.status === 'online' && <div className="online-pulse"></div>}
                    </div>
                    <div className="soul-info">
                      <div className="soul-name">
                        {user.name}
                        {user.sacredMode && <span className="sacred-indicator">✧</span>}
                      </div>
                      <div className="soul-journey">
                        {user.sessions} sacred sessions
                      </div>
                    </div>
                    <div className="soul-metrics">
                      <div className="trust-circle">
                        <svg width="40" height="40">
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill="none"
                            stroke="rgba(168, 85, 247, 0.1)"
                            strokeWidth="2"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="18"
                            fill="none"
                            stroke="url(#trustGradient)"
                            strokeWidth="2"
                            strokeDasharray={`${user.trustScore * 113} 113`}
                            transform="rotate(-90 20 20)"
                          />
                          <defs>
                            <linearGradient id="trustGradient">
                              <stop offset="0%" stopColor="#a855f7" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="trust-value">{(user.trustScore * 100).toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sacred Metrics */}
            <div className="oracle-card metrics-card">
              <div className="card-header">
                <span className="card-icon">🔮</span>
                <h3>Sacred Resonance</h3>
              </div>
              <div className="metrics-container">
                <div className="metric-item">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-info">
                    <div className="metric-value">{metrics.avgSession}</div>
                    <div className="metric-label">Minutes in Presence</div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">💫</div>
                  <div className="metric-info">
                    <div className="metric-value">{metrics.avgMessages}</div>
                    <div className="metric-label">Sacred Exchanges</div>
                  </div>
                </div>
                <div className="metric-item sacred">
                  <div className="metric-icon">🕊️</div>
                  <div className="metric-info">
                    <div className="metric-value">{metrics.sacredUsage}%</div>
                    <div className="metric-label">In Sacred Space</div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">🌱</div>
                  <div className="metric-info">
                    <div className="metric-value">{metrics.enrichmentRate}%</div>
                    <div className="metric-label">Wisdom Shared</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sacred Activity Stream */}
            <div className="oracle-card activity-card">
              <div className="card-header">
                <span className="card-icon">✨</span>
                <h3>Sacred Stream</h3>
              </div>
              <div className="activity-stream">
                {activities.map((activity, idx) => (
                  <div key={idx} className={`activity-moment ${activity.engagement}`}>
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <div className="activity-time">{activity.time}</div>
                      <div className="activity-description">
                        <span className="activity-user">{activity.user}</span>
                        <span className="activity-action">{activity.action}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sacred Visualization */}
          <div className="visualization-sanctuary">
            <div className="oracle-card viz-card">
              <h3 className="viz-title">Journey Through Time</h3>
              <Plot
                data={[{
                  x: Array.from({length: 24}, (_, i) => `${i}:00`),
                  y: Array.from({length: 24}, () => Math.floor(Math.random() * 30 + 5)),
                  type: 'scatter',
                  mode: 'lines',
                  fill: 'tozeroy',
                  line: {
                    color: '#a855f7',
                    shape: 'spline',
                    smoothing: 1.3
                  },
                  fillcolor: 'rgba(168, 85, 247, 0.1)'
                }]}
                layout={{
                  height: 250,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  xaxis: {
                    title: 'Sacred Hours',
                    color: '#9ca3af',
                    gridcolor: 'rgba(156, 163, 175, 0.1)'
                  },
                  yaxis: {
                    title: 'Souls in Presence',
                    color: '#9ca3af',
                    gridcolor: 'rgba(156, 163, 175, 0.1)'
                  },
                  margin: { t: 20, r: 20, l: 50, b: 50 },
                  font: { family: 'Inter, sans-serif' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>

            <div className="oracle-card viz-card">
              <h3 className="viz-title">Sacred Protection</h3>
              <Plot
                data={[{
                  labels: ['Wisdom Preserved', 'Guided Recovery', 'Sacred Mirrors', 'Mystery'],
                  values: [65, 20, 10, 5],
                  type: 'pie',
                  hole: 0.6,
                  marker: {
                    colors: ['#a855f7', '#ec4899', '#3b82f6', '#6366f1']
                  },
                  textinfo: 'label+percent',
                  textfont: { color: '#fff', size: 11 }
                }]}
                layout={{
                  height: 250,
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  showlegend: false,
                  margin: { t: 20, r: 20, l: 20, b: 20 },
                  font: { family: 'Inter, sans-serif', color: '#9ca3af' }
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .sacred-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0515 0%, #1a0b2e 50%, #16082a 100%);
          position: relative;
          overflow: hidden;
        }

        /* Mystical Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #a855f7 0%, transparent 70%);
          top: -100px;
          left: -100px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #ec4899 0%, transparent 70%);
          bottom: -50px;
          right: -50px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Sacred Header */
        .sacred-header {
          background: rgba(16, 8, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .logo-mark {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-symbol {
          font-size: 2rem;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }

        .logo-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(168, 85, 247, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .sacred-title {
          font-family: 'Crimson Text', serif;
          font-size: 2.5rem;
          font-weight: 600;
          background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
        }

        .sacred-subtitle {
          font-family: 'Crimson Text', serif;
          font-style: italic;
          color: rgba(168, 85, 247, 0.8);
          font-size: 1rem;
        }

        /* Presence Indicators */
        .presence-indicators {
          display: flex;
          gap: 2rem;
        }

        .presence-card {
          text-align: center;
          position: relative;
        }

        .presence-value {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .presence-label {
          font-size: 0.75rem;
          color: rgba(168, 85, 247, 0.7);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 0.25rem;
        }

        .presence-glow {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #a855f7, transparent);
          animation: glow 2s infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Filter Sanctuary */
        .filter-sanctuary {
          background: rgba(16, 8, 42, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(168, 85, 247, 0.1);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 2rem;
        }

        .filter-label {
          font-size: 0.875rem;
          color: rgba(168, 85, 247, 0.8);
          margin-right: 0.75rem;
        }

        .sacred-select {
          background: rgba(16, 8, 42, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sacred-select:hover {
          border-color: rgba(168, 85, 247, 0.6);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
        }

        /* Sacred Grid */
        .sacred-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        /* Oracle Cards */
        .oracle-card {
          background: rgba(16, 8, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .oracle-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .oracle-card:hover {
          transform: translateY(-5px);
          border-color: rgba(168, 85, 247, 0.4);
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.2);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-header h3 {
          font-family: 'Crimson Text', serif;
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
        }

        /* Souls Container */
        .souls-container {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .souls-container::-webkit-scrollbar {
          width: 4px;
        }

        .souls-container::-webkit-scrollbar-track {
          background: rgba(168, 85, 247, 0.1);
          border-radius: 2px;
        }

        .souls-container::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 2px;
        }

        .soul-presence {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: rgba(168, 85, 247, 0.05);
          border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .soul-presence.in-sacred {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
          border-color: rgba(168, 85, 247, 0.2);
        }

        .soul-presence:hover {
          background: rgba(168, 85, 247, 0.1);
          transform: translateX(5px);
        }

        .soul-avatar {
          position: relative;
        }

        .avatar-inner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .online-pulse {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid #0f0515;
          animation: pulse 2s infinite;
        }

        .soul-info {
          flex: 1;
        }

        .soul-name {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sacred-indicator {
          color: #a855f7;
          font-size: 0.875rem;
        }

        .soul-journey {
          color: rgba(168, 85, 247, 0.7);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .trust-circle {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .trust-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 600;
          color: #a855f7;
        }

        /* Metrics Container */
        .metrics-container {
          display: grid;
          gap: 1rem;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(168, 85, 247, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .metric-item.sacred {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
        }

        .metric-item:hover {
          background: rgba(168, 85, 247, 0.1);
          transform: translateX(5px);
        }

        .metric-icon {
          font-size: 1.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #a855f7;
        }

        .metric-label {
          font-size: 0.75rem;
          color: rgba(168, 85, 247, 0.7);
          margin-top: 0.25rem;
        }

        /* Activity Stream */
        .activity-stream {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .activity-stream::-webkit-scrollbar {
          width: 4px;
        }

        .activity-stream::-webkit-scrollbar-track {
          background: rgba(168, 85, 247, 0.1);
        }

        .activity-stream::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
        }

        .activity-moment {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: rgba(168, 85, 247, 0.05);
          border-radius: 12px;
          border-left: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .activity-moment.sacred {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
          border-left-color: #a855f7;
        }

        .activity-moment.high {
          border-left-color: #10b981;
        }

        .activity-moment.medium {
          border-left-color: #f59e0b;
        }

        .activity-moment:hover {
          transform: translateX(5px);
          background: rgba(168, 85, 247, 0.1);
        }

        .activity-icon {
          font-size: 1.25rem;
        }

        .activity-time {
          font-size: 0.75rem;
          color: rgba(168, 85, 247, 0.6);
        }

        .activity-user {
          color: #fff;
          font-weight: 500;
        }

        .activity-action {
          color: rgba(168, 85, 247, 0.8);
          margin-left: 0.25rem;
        }

        /* Visualization Sanctuary */
        .visualization-sanctuary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
        }

        .viz-card {
          padding: 2rem;
        }

        .viz-title {
          font-family: 'Crimson Text', serif;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sacred-grid {
            grid-template-columns: 1fr;
          }

          .visualization-sanctuary {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
            gap: 2rem;
          }

          .presence-indicators {
            width: 100%;
            justify-content: space-around;
          }
        }
      `}</style>
    </>
  );
}