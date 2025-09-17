// components/BetaRitualDashboard.tsx

"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { ritualEventService } from "@/lib/services/ritualEventService";

// Colors
const COLORS = ["#9b5de5", "#00bbf9", "#00f5d4", "#f15bb5", "#fee440"];
const ELEMENT_COLORS = {
  fire: "#ff6b6b",
  water: "#4dabf7",
  earth: "#51cf66",
  air: "#ffd43b",
  aether: "#c084fc"
};

export default function BetaRitualDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [advancedMetrics, setAdvancedMetrics] = useState<any>(null);
  const [nudgeMetrics, setNudgeMetrics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [basicData, advancedData, nudgeData] = await Promise.all([
        ritualEventService.getRitualMetrics(timeframe),
        ritualEventService.getAdvancedMetrics(timeframe),
        ritualEventService.getNudgeMetrics()
      ]);
      setMetrics(basicData);
      setAdvancedMetrics(advancedData);
      setNudgeMetrics(nudgeData);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics || !advancedMetrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading ritual metrics...</p>
        </div>
      </div>
    );
  }

  // Prepare data for advanced visualizations
  const depthData = advancedMetrics.depthDistribution ? Object.entries(advancedMetrics.depthDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    color: key === 'vulnerable' ? '#9b5de5' : key === 'deep' ? '#00bbf9' : '#fee440'
  })) : [];

  const elementData = advancedMetrics.elementalDistribution ? Object.entries(advancedMetrics.elementalDistribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    color: ELEMENT_COLORS[key as keyof typeof ELEMENT_COLORS] || '#999'
  })) : [];

  const trustRadar = [
    { metric: 'Emotion', value: (advancedMetrics.avgEmotionalIntensity || 0) * 10 },
    { metric: 'Sacred Language', value: parseFloat(advancedMetrics.sacredLanguageUsage || 0) },
    { metric: 'Depth', value: advancedMetrics.depthDistribution ? Math.round(((advancedMetrics.depthDistribution.deep || 0) + (advancedMetrics.depthDistribution.vulnerable || 0) * 2) / Object.values(advancedMetrics.depthDistribution).reduce((a: any, b: any) => a + b, 1) * 100) : 0 },
    { metric: 'Return Speed', value: 75 },
    { metric: 'Loyalty', value: advancedMetrics.companionLoyalty ? Math.round(advancedMetrics.companionLoyalty.loyal / (advancedMetrics.companionLoyalty.loyal + advancedMetrics.companionLoyalty.switchers) * 100) : 0 }
  ];

  const modeDriftData = [
    { name: 'Initial', pushToTalk: 78, wakeWord: 22 },
    { name: 'Week 1', pushToTalk: 65, wakeWord: 35 },
    { name: 'Week 2', pushToTalk: 52, wakeWord: 48 },
    { name: 'Current', pushToTalk: metrics.modeSplit?.[0]?.value || 70, wakeWord: metrics.modeSplit?.[1]?.value || 30 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">✨ Beta Ritual Analytics</h1>
          <p className="text-purple-200">How seekers enter sacred space</p>
        </div>

        <div className="flex gap-4">
          {/* Tab Selector */}
          <div className="flex gap-2 bg-white/10 rounded-lg p-1 backdrop-blur">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'basic'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Core Metrics
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'advanced'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Deep Insights
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2 bg-white/10 rounded-lg p-1 backdrop-blur">
            {['today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period as any)}
                className={`px-4 py-2 rounded-lg transition ${
                  timeframe === period
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'basic' ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Seekers" value={metrics.totalUsers} icon="🌟" trend="up" />
            <MetricCard title="Completion Rate" value={`${(metrics.completionRate * 100).toFixed(1)}%`} icon="✨" color="text-green-400" />
            <MetricCard title="Skip Rate" value={`${(metrics.skipRate * 100).toFixed(1)}%`} icon="⏭️" color="text-red-400" />
            <MetricCard title="Avg Journey Time" value={`${Math.floor(metrics.avgCompletionTime / 60)}m ${metrics.avgCompletionTime % 60}s`} icon="⏱️" />
          </div>

          {/* Nudge Preferences */}
          {nudgeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                title="Nudges Enabled"
                value={`${nudgeMetrics.nudgeOnCount}`}
                icon="🔔"
                subtitle="Users who keep gentle nudges on"
                color="text-purple-400"
              />
              <MetricCard
                title="Nudges Disabled"
                value={`${nudgeMetrics.nudgeOffCount}`}
                icon="🔕"
                subtitle="Users who prefer silence"
                color="text-gray-400"
              />
              <MetricCard
                title="Toggle Rate"
                value={`${(nudgeMetrics.nudgeToggleFrequency * 100).toFixed(1)}%`}
                icon="🔄"
                subtitle="Users who changed nudge setting"
                color="text-blue-400"
              />
            </div>
          )}

          {/* Voice & Mode Splits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {nudgeMetrics && (
              <ChartCard title="Nudge Preferences" subtitle="Gentle presence vs silence">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Nudges On 🔔", value: nudgeMetrics.nudgeOnCount, color: "#8b5cf6" },
                        { name: "Nudges Off 🔕", value: nudgeMetrics.nudgeOffCount, color: "#6b7280" }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Nudges On 🔔", value: nudgeMetrics.nudgeOnCount, color: "#8b5cf6" },
                        { name: "Nudges Off 🔕", value: nudgeMetrics.nudgeOffCount, color: "#6b7280" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
            <ChartCard title="Voice Companion Choice" subtitle="Heart vs Mind resonance">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.voiceSplit}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {metrics.voiceSplit.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Activation Mode" subtitle="Voice intimacy preference">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.modeSplit}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {metrics.modeSplit.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      ) : (
        <>
          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Emotional Intensity" value={`${advancedMetrics.avgEmotionalIntensity}/10`} icon="💜" subtitle="Depth of feeling shared" />
            <MetricCard title="Sacred Language" value={`${advancedMetrics.sacredLanguageUsage}%`} icon="🕊️" subtitle="Using spiritual vocabulary" />
            <MetricCard title="Companion Loyalty" value={`${Math.round(advancedMetrics.companionLoyalty ? advancedMetrics.companionLoyalty.loyal / (advancedMetrics.companionLoyalty.loyal + advancedMetrics.companionLoyalty.switchers) * 100 : 0)}%`} icon="🤝" subtitle="Staying with first choice" />
          </div>

          {/* First Truth Depth & Elemental Resonance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ChartCard title="First Truth Depth" subtitle="How vulnerable are seekers?">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={depthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="value" fill="#8b5cf6">
                    {depthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Elemental Resonance" subtitle="Primary energetic signatures">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={elementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {elementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Voice Mode Drift & Trust Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Voice Mode Evolution" subtitle="Trust building over time">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={modeDriftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="pushToTalk" stroke="#00bbf9" strokeWidth={2} name="Push-to-Talk" />
                  <Line type="monotone" dataKey="wakeWord" stroke="#f15bb5" strokeWidth={2} name="Wake Word" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Trust Signals" subtitle="Multi-dimensional engagement depth">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={trustRadar}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar name="Trust Depth" dataKey="value" stroke="#9b5de5" fill="#9b5de5" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {activeTab === 'basic' && (
        /* Return Latency Histogram */
        <ChartCard title="Return Ritual Latency" subtitle="How quickly seekers come back">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={(() => {
                const buckets = [
                  { name: "0-6h", users: 0 },
                  { name: "6-24h", users: 0 },
                  { name: "1-3d", users: 0 },
                  { name: "3-7d", users: 0 },
                  { name: "7d+", users: 0 }
                ];

                if (metrics.returnLatencyData) {
                  metrics.returnLatencyData.forEach((latencyHours: number) => {
                    if (latencyHours <= 6) buckets[0].users++;
                    else if (latencyHours <= 24) buckets[1].users++;
                    else if (latencyHours <= 72) buckets[2].users++;
                    else if (latencyHours <= 168) buckets[3].users++;
                    else buckets[4].users++;
                  });
                }

                return buckets;
              })()}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="users" fill="#00f5d4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Live Status */}
      <div className="text-center text-purple-200 mt-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live • Auto-refreshing every 30s • Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, color = "text-purple-300", trend, subtitle }: any) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <div className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↗️' : '↘️'}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-white">{title}</div>
      {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
    </div>
  );
}

// Chart Card Component
function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-purple-200">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}