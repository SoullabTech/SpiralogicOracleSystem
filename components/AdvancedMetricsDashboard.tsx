"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Sankey, Layer
} from "recharts";
import { ritualEventService } from "@/lib/services/ritualEventService";

const COLORS = {
  Fire: '#ef4444',
  Water: '#3b82f6',
  Earth: '#84cc16',
  Air: '#fbbf24',
  Aether: '#a855f7',
  Maya: '#ec4899',
  Anthony: '#06b6d4'
};

export default function AdvancedMetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await ritualEventService.getAdvancedMetrics(timeframe);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch advanced metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading advanced metrics...</p>
        </div>
      </div>
    );
  }

  // Prepare data for visualizations
  const depthData = [
    { name: 'Surface', value: metrics.depthDistribution?.surface || 0, color: '#fee2e2' },
    { name: 'Deep', value: metrics.depthDistribution?.deep || 0, color: '#ddd6fe' },
    { name: 'Vulnerable', value: metrics.depthDistribution?.vulnerable || 0, color: '#c084fc' }
  ];

  const elementalData = Object.entries(metrics.elementalDistribution || {}).map(([element, count]) => ({
    element: element.charAt(0).toUpperCase() + element.slice(1),
    value: count as number
  }));

  const loyaltyData = [
    { name: 'Loyal to One', value: metrics.companionLoyalty?.loyal || 0 },
    { name: 'Switchers', value: metrics.companionLoyalty?.switchers || 0 }
  ];

  const modeDriftData = [
    { name: 'Stable Mode', value: metrics.modeDrift?.stable || 0 },
    { name: 'Mode Evolved', value: metrics.modeDrift?.evolved || 0 }
  ];

  // Prepare Sankey data for companion flow (mock data for now)
  const companionFlowData = {
    nodes: [
      { id: 'Start' },
      { id: 'Maya First' },
      { id: 'Anthony First' },
      { id: 'Stay Maya' },
      { id: 'Stay Anthony' },
      { id: 'Switch to Maya' },
      { id: 'Switch to Anthony' }
    ],
    links: [
      { source: 0, target: 1, value: 58 },
      { source: 0, target: 2, value: 42 },
      { source: 1, target: 3, value: 48 },
      { source: 1, target: 6, value: 10 },
      { source: 2, target: 4, value: 37 },
      { source: 2, target: 5, value: 5 }
    ]
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-600">🔮 Advanced Ritual Metrics</h1>
          <p className="text-gray-500">Deep insights into user trust and resonance patterns</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period as any)}
              className={`px-4 py-2 rounded-lg transition ${
                timeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* First Truth Depth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 First Truth Depth Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={depthData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {depthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Emotional Intensity</span>
              <span className="font-bold text-purple-600">{metrics.avgEmotionalIntensity}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Sacred Language Usage</span>
              <span className="font-bold text-purple-600">{metrics.sacredLanguageUsage}%</span>
            </div>
          </div>
        </div>

        {/* Elemental Resonance */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔥💧🌍💨✨ Elemental Resonance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={elementalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="element" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {elementalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.element as keyof typeof COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Return Latency Analysis */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">⏱️ Return Ritual Latency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.returnLatency || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hours" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-2">
          How quickly users return for their next ritual session
        </p>
      </div>

      {/* Companion Loyalty & Voice Mode Drift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companion Loyalty */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💜🧠 Companion Loyalty</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={loyaltyData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                <Cell fill="#ec4899" />
                <Cell fill="#06b6d4" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Voice Mode Drift */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎤 Voice Mode Evolution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={modeDriftData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trust Progression Indicator */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🌟 Community Trust Indicators</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-sm text-gray-600">Avg Trust Level</div>
            <div className="text-2xl font-bold text-purple-600">
              {((metrics.avgEmotionalIntensity || 0) * 0.8).toFixed(1)}/10
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🔮</div>
            <div className="text-sm text-gray-600">Sacred Language</div>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.sacredLanguageUsage}%
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🌈</div>
            <div className="text-sm text-gray-600">Vulnerable Shares</div>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.depthDistribution?.vulnerable || 0}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">♾️</div>
            <div className="text-sm text-gray-600">Return Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((metrics.completedUsers / metrics.totalUsers) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live • Auto-refreshing every 30s • Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}