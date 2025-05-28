'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SacredHoloflower } from '@/components/sacred/SacredHoloflower'
import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import { Sparkles, Moon, Sun, Calendar, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId')
    setUserId(storedUserId)
  }, [])

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const response = await api.get(`${endpoints.getProfile}/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  // Fetch current transits
  const { data: transits } = useQuery({
    queryKey: ['transits'],
    queryFn: async () => {
      const response = await api.get(endpoints.currentTransits)
      return response.data
    },
  })

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="sacred-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-sacred mb-2">
            Welcome back, <span className="text-sacred-gradient">{profile?.name || 'Sacred Soul'}</span>
          </h1>
          <p className="text-gray-400">Your consciousness evolution dashboard</p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Sacred Holoflower */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 sacred-card p-8"
          >
            <h2 className="text-2xl font-sacred mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sacred-gold" />
              Your Sacred Holoflower
            </h2>
            <div className="h-[500px]">
              <SacredHoloflower userId={userId || undefined} />
            </div>
          </motion.div>

          {/* Cosmic Timing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Current Transits */}
            <div className="sacred-card">
              <h3 className="text-xl font-sacred mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-sacred-violet" />
                Current Transits
              </h3>
              <div className="space-y-3">
                {transits?.slice(0, 3).map((transit: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-sacred-gold mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">{transit.planet} in {transit.sign}</p>
                      <p className="text-xs text-gray-400">{transit.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/astrology">
                <button className="mt-4 text-sm text-sacred-gold hover:underline">
                  View Full Chart →
                </button>
              </Link>
            </div>

            {/* Today's Energy */}
            <div className="sacred-card">
              <h3 className="text-xl font-sacred mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-sacred-gold" />
                Today's Energy
              </h3>
              <div className="text-center py-4">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-element-fire to-element-water flex items-center justify-center">
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <p className="text-sm text-gray-300">
                  High transformation potential today. Perfect for deep introspection.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <Link href="/oracle/session">
            <div className="sacred-card hover:border-sacred-gold/50 transition-all cursor-pointer">
              <MessageCircle className="w-8 h-8 text-sacred-violet mb-3" />
              <h3 className="text-lg font-semibold mb-1">Oracle Session</h3>
              <p className="text-sm text-gray-400">Connect with your personal guide</p>
            </div>
          </Link>

          <Link href="/journal">
            <div className="sacred-card hover:border-sacred-gold/50 transition-all cursor-pointer">
              <Calendar className="w-8 h-8 text-sacred-emerald mb-3" />
              <h3 className="text-lg font-semibold mb-1">Sacred Journal</h3>
              <p className="text-sm text-gray-400">Record your transformation journey</p>
            </div>
          </Link>

          <Link href="/elemental">
            <div className="sacred-card hover:border-sacred-gold/50 transition-all cursor-pointer">
              <Sparkles className="w-8 h-8 text-sacred-gold mb-3" />
              <h3 className="text-lg font-semibold mb-1">Elemental Balance</h3>
              <p className="text-sm text-gray-400">Harmonize your inner elements</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}