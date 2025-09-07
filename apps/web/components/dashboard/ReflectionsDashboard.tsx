'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { soullabColors, chartColorSequence } from '@/lib/theme/soullabColors'

interface ReflectionData {
  total: number
  completionRate: number
  feelings: Array<{ feeling: string; count: number }>
  daily: Array<{ date: string; count: number }>
  engagement?: {
    surpriseRate: number
    frustrationRate: number
  }
}

export default function ReflectionsDashboard() {
  const [data, setData] = useState<ReflectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReflectionData()
  }, [])

  const fetchReflectionData = async () => {
    try {
      const response = await fetch('/api/analytics/reflections')
      if (!response.ok) throw new Error('Failed to fetch reflection data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching reflections:', err)
      setError('Failed to load reflection data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 rounded-full"
          style={{ borderColor: soullabColors.opacity.gray10, borderTopColor: soullabColors.gray }}
        />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'No data available'}</p>
          <button
            onClick={fetchReflectionData}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: soullabColors.blue }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Use Soullab color sequence for feelings
  const feelingColors = chartColorSequence

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen p-6" style={{ background: soullabColors.gradients.light }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-serif mb-2" style={{ color: soullabColors.black }}>
            Reflections Dashboard
          </h1>
          <p className="text-gray-600">
            Beta user feedback and engagement insights
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Reflections */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reflections</p>
                <p className="text-2xl font-bold text-gray-900">{data.total}</p>
              </div>
              <div className="text-3xl">📝</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(data.completionRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">✨</div>
            </div>
          </div>

          {/* Surprise Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Surprise Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((data.engagement?.surpriseRate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">🌟</div>
            </div>
          </div>

          {/* Frustration Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Frustration Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((data.engagement?.frustrationRate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-3xl">🔧</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Feelings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: soullabColors.opacity.gray10 }}
          >
            <h2 className="text-lg font-serif text-gray-900 mb-4">
              Top Feelings
            </h2>
            <div className="space-y-3">
              {data.feelings.slice(0, 5).map((item, index) => (
                <div key={item.feeling} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: feelingColors[index] }}
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{item.feeling}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / data.total) * 100}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: feelingColors[index] }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feeling Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {data.feelings.slice(5, 10).map((item) => (
                <span
                  key={item.feeling}
                  className="px-3 py-1 rounded-full text-sm capitalize"
                  style={{ backgroundColor: soullabColors.opacity.yellow10, color: soullabColors.brown }}
                >
                  {item.feeling} ({item.count})
                </span>
              ))}
            </div>
          </motion.div>

          {/* Daily Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border" style={{ borderColor: soullabColors.opacity.gray10 }}
          >
            <h2 className="text-lg font-serif text-gray-900 mb-4">
              Daily Reflections (14 days)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={soullabColors.blue}
                  strokeWidth={2}
                  dot={{ fill: soullabColors.blue, r: 4 }}
                  activeDot={{ r: 6, fill: soullabColors.yellow }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Engagement Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-lg font-serif text-gray-900 mb-4">
            Engagement Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feeling Only */}
            <div className="text-center">
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ backgroundColor: soullabColors.opacity.gray10 }}>
                  <span className="text-2xl font-bold" style={{ color: soullabColors.gray }}>
                    {Math.round(
                      (1 - (data.engagement?.surpriseRate || 0) - (data.engagement?.frustrationRate || 0)) * 100
                    )}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Feeling Only</p>
              <p className="text-xs text-gray-500 mt-1">Quick, single-word responses</p>
            </div>

            {/* With Surprise */}
            <div className="text-center">
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ backgroundColor: soullabColors.opacity.yellow10 }}>
                  <span className="text-2xl font-bold" style={{ color: soullabColors.yellow }}>
                    {Math.round((data.engagement?.surpriseRate || 0) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Shared Surprises</p>
              <p className="text-xs text-gray-500 mt-1">Unexpected discoveries</p>
            </div>

            {/* With Frustration */}
            <div className="text-center">
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full">
                  <span className="text-2xl font-bold text-pink-700">
                    {Math.round((data.engagement?.frustrationRate || 0) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Shared Frustrations</p>
              <p className="text-xs text-gray-500 mt-1">Areas for improvement</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleString()}</p>
          <button
            onClick={fetchReflectionData}
            className="mt-2 font-medium transition-colors"
            style={{ color: soullabColors.blue }}
          >
            Refresh Data
          </button>
        </motion.div>
      </div>
    </div>
  )
}