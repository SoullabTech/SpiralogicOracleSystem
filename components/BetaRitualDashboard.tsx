// components/BetaRitualDashboard.tsx

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { ritualEventService } from "@/lib/services/ritualEventService";

// Mock colors
const COLORS = ["#9b5de5", "#00bbf9", "#00f5d4", "#f15bb5", "#fee440"];

export default function BetaRitualDashboard() {
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
      const data = await ritualEventService.getRitualMetrics(timeframe);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ritual metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-600">🌟 Beta Ritual Dashboard</h1>
          <p className="text-gray-500">Witnessing how users enter sacred space</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl text-blue-600">{metrics.totalUsers}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Skip Rate</h2>
          <p className="text-2xl text-red-500">{(metrics.skipRate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Completion Rate</h2>
          <p className="text-2xl text-green-600">{(metrics.completionRate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold">Avg Time</h2>
          <p className="text-2xl text-purple-600">{Math.floor(metrics.avgCompletionTime / 60)}m {metrics.avgCompletionTime % 60}s</p>
        </div>
      </div>

      {/* Voice Split */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold">Voice Split</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metrics.voiceSplit}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {metrics.voiceSplit.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mode Split */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold">Activation Mode Split</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metrics.modeSplit}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {metrics.modeSplit.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
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