'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Volume2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { soullabColors, chartColorSequence } from '@/lib/theme/soullabColors';

interface AudioUnlockMetrics {
  totalAttempts: number;
  successRate: number;
  trendData: Array<{
    date: string;
    success: number;
    failure: number;
  }>;
  browserData: Array<{
    browser: string;
    success: number;
    failure: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export default function AudioUnlockDashboard() {
  const [metrics, setMetrics] = useState<AudioUnlockMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchMetrics() {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate = new Date('2024-01-01');
      }

      // Fetch audio unlock events
      const { data, error } = await supabase
        .from('event_logs')
        .select('*')
        .eq('event_name', 'audio_unlock')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process metrics
      const totalAttempts = data?.length || 0;
      const successCount = data?.filter(e => e.metadata?.success).length || 0;
      const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0;

      // Daily trend
      const dailyData = data?.reduce((acc, event) => {
        const date = new Date(event.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { success: 0, failure: 0 };
        }
        if (event.metadata?.success) {
          acc[date].success++;
        } else {
          acc[date].failure++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const trendData = Object.entries(dailyData)
        .map(([date, counts]) => ({ date, ...counts }))
        .slice(-7);

      // Browser breakdown
      const browserCounts = data?.reduce((acc, event) => {
        const browser = event.metadata?.browser || 'Unknown';
        if (!acc[browser]) {
          acc[browser] = { success: 0, failure: 0 };
        }
        if (event.metadata?.success) {
          acc[browser].success++;
        } else {
          acc[browser].failure++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const browserData = Object.entries(browserCounts)
        .map(([browser, counts]) => ({ browser, ...counts }))
        .sort((a, b) => (b.success + b.failure) - (a.success + a.failure))
        .slice(0, 5);

      // Device breakdown
      const deviceCounts = data?.reduce((acc, event) => {
        const device = event.metadata?.deviceType || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setMetrics({
        totalAttempts,
        successRate,
        trendData,
        browserData,
        deviceBreakdown: {
          mobile: deviceCounts.mobile || 0,
          desktop: deviceCounts.desktop || 0,
          tablet: deviceCounts.tablet || 0
        }
      });
    } catch (error) {
      console.error('Error fetching audio unlock metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48 mb-4" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    );
  }

  if (!metrics) return null;

  // Custom tooltip with Soullab styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  // Device pie chart data
  const deviceData = [
    { name: 'Mobile', value: metrics.deviceBreakdown.mobile, color: soullabColors.blue },
    { name: 'Desktop', value: metrics.deviceBreakdown.desktop, color: soullabColors.green },
    { name: 'Tablet', value: metrics.deviceBreakdown.tablet, color: soullabColors.yellow }
  ].filter(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Audio Unlock Analytics
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Voice activation success tracking
          </p>
        </div>
        
        {/* Time range selector */}
        <div className="flex gap-1" style={{ backgroundColor: soullabColors.opacity.gray10 }} className="rounded-lg p-1">
          {(['7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm transition ${
                timeRange === range
                  ? 'bg-white dark:bg-neutral-700 shadow'
                  : ''
              }`}
              style={{
                color: timeRange === range ? soullabColors.blue : soullabColors.gray
              }}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: soullabColors.opacity.blue10 }}>
          <div className="flex items-center justify-between mb-2">
            <Volume2 className="w-5 h-5" style={{ color: soullabColors.blue }} />
            <span className="text-xs" style={{ color: soullabColors.blue }}>Total</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.totalAttempts}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Unlock attempts
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: soullabColors.opacity.green10 }}>
          <div className="flex items-center justify-between mb-2">
            <Check className="w-5 h-5" style={{ color: soullabColors.green }} />
            <span className="text-xs" style={{ color: soullabColors.green }}>Rate</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Success rate
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: soullabColors.opacity.yellow10 }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: soullabColors.yellow }} />
            <span className="text-xs" style={{ color: soullabColors.yellow }}>Trend</span>
          </div>
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            {metrics.trendData.length > 1 
              ? metrics.trendData[metrics.trendData.length - 1].success > metrics.trendData[0].success ? '↑' : '↓'
              : '—'}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            7-day trend
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily trend */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: soullabColors.gray }}>
            Daily Success/Failure Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.opacity.gray10} />
              <XAxis 
                dataKey="date" 
                stroke={soullabColors.gray}
                tick={{ fontSize: 10 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="success"
                stroke={soullabColors.green}
                strokeWidth={2}
                dot={{ fill: soullabColors.green, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="failure"
                stroke={soullabColors.red}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: soullabColors.red, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Browser breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: soullabColors.gray }}>
            Browser Compatibility
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.browserData}>
              <CartesianGrid strokeDasharray="3 3" stroke={soullabColors.opacity.gray10} />
              <XAxis dataKey="browser" stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <YAxis stroke={soullabColors.gray} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="success" fill={soullabColors.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="failure" fill={soullabColors.red} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: soullabColors.gray }}>
            Device Distribution
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success rate by time */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: soullabColors.gray }}>
            Key Insights
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: soullabColors.green }} />
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Success rate: <span className="font-medium">{metrics.successRate.toFixed(1)}%</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {metrics.successRate > 80 ? 'Excellent performance' : 'Room for improvement'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: soullabColors.blue }} />
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Most common: <span className="font-medium">{metrics.browserData[0]?.browser || 'N/A'}</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Primary browser for audio
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: soullabColors.yellow }} />
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Mobile: <span className="font-medium">
                    {((metrics.deviceBreakdown.mobile / metrics.totalAttempts) * 100).toFixed(0)}%
                  </span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  Of total attempts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}