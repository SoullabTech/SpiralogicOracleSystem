'use client';

import React from 'react';
import AudioUnlockWidget from '@/components/dashboard/AudioUnlockWidget';
import AudioUnlockTrend from '@/components/dashboard/AudioUnlockTrend';
import AudioUnlockByBrowser from '@/components/dashboard/AudioUnlockByBrowser';
import { Volume2, Activity, Users, TrendingUp } from 'lucide-react';

export default function AudioAnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white p-8 transition-colors duration-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          Maia Voice Analytics
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Real-time insights into audio unlock performance and user engagement
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio Unlock Widget - Takes 1 column */}
        <div className="lg:col-span-1">
          <AudioUnlockWidget />
        </div>

        {/* Trend Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AudioUnlockTrend />
        </div>

        {/* Browser Breakdown - Full width */}
        <div className="lg:col-span-3">
          <AudioUnlockByBrowser />
        </div>

        {/* Quick Stats Row */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Voice Sessions */}
          <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-700/30">
            <div className="flex items-center justify-between mb-2">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-300">+12%</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">2,847</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Voice Sessions Today</div>
          </div>

          {/* Active Users */}
          <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-300">+8%</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">342</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Active Beta Users</div>
          </div>

          {/* Engagement Rate */}
          <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700/30">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-300">+15%</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">78%</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">Engagement Rate</div>
          </div>

          {/* Growth */}
          <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-700/30">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-300">+24%</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">156</div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">New Users This Week</div>
          </div>
        </div>

        {/* Browser Correlation Insights */}
        <div className="lg:col-span-3 p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-900 dark:to-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Key Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-gray-100 dark:border-transparent">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Best Performing Browser</div>
              <div className="text-xl font-bold text-green-400">Chrome (92%)</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">Highest audio unlock rate</div>
            </div>
            
            <div className="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-gray-100 dark:border-transparent">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Peak Usage Time</div>
              <div className="text-xl font-bold text-blue-400">2-4 PM PST</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">Most active session period</div>
            </div>
            
            <div className="p-4 bg-white/50 dark:bg-neutral-800/50 rounded-lg border border-gray-100 dark:border-transparent">
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Avg Session Length</div>
              <div className="text-xl font-bold text-amber-400">12 min</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">For users who unlock audio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-neutral-500 dark:text-neutral-500">
        Dashboard refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}