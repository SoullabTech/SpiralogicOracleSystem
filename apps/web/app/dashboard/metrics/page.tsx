import React from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          System Metrics
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Performance and usage analytics for Soullab systems
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Users */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Users</p>
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">127</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+12% from last week</span>
          </div>
        </div>

        {/* Session Duration */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg Session</p>
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">8.4m</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+3% from last week</span>
          </div>
        </div>

        {/* Voice Interactions */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Voice Queries</p>
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">1,247</p>
            </div>
            <BarChart3 className="w-8 h-8 text-amber-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 dark:text-green-400">+24% from last week</span>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Response Time</p>
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">1.2s</p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
            <span className="text-red-600 dark:text-red-400">-8% from last week</span>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                    rounded-lg p-8 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Advanced Analytics Coming Soon
          </h3>
          <p className="text-blue-700 dark:text-blue-300 max-w-md mx-auto">
            Detailed usage patterns, conversation insights, and performance trends are being developed.
          </p>
        </div>
      </div>
    </div>
  );
}