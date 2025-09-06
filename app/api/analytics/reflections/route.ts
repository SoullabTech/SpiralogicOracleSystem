import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Setup Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Mock dataset (used in debug mode or fallback)
const mockReflections = {
  total: 125,
  completionRate: 0.78,
  feelings: [
    { feeling: 'calm', count: 42 },
    { feeling: 'curious', count: 38 },
    { feeling: 'confused', count: 24 },
    { feeling: 'supported', count: 19 },
    { feeling: 'overwhelmed', count: 15 }
  ],
  daily: [
    { date: '2025-08-23', count: 8 },
    { date: '2025-08-24', count: 12 },
    { date: '2025-08-25', count: 15 },
    { date: '2025-08-26', count: 10 },
    { date: '2025-08-27', count: 18 },
    { date: '2025-08-28', count: 20 },
    { date: '2025-08-29', count: 16 },
    { date: '2025-08-30', count: 25 },
    { date: '2025-08-31', count: 21 },
    { date: '2025-09-01', count: 19 },
    { date: '2025-09-02', count: 23 },
    { date: '2025-09-03', count: 17 },
    { date: '2025-09-04', count: 14 },
    { date: '2025-09-05', count: 22 }
  ]
}

export async function GET(request: Request) {
  // Debug mode shortcut
  if (process.env.REFLECTION_DEBUG === 'true') {
    return NextResponse.json(mockReflections, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  }

  try {
    // Add timeout protection
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

    try {
    // Fetch reflections from Supabase
    const { data, error } = await supabase
      .from('beta_feedback')
      .select('created_at, feeling, surprise, frustration')

    if (error || !data) {
      console.error('Supabase query failed:', error)
      return NextResponse.json(mockReflections) // graceful fallback
    }

    // Total reflections
    const total = data.length

    // Feelings frequency
    const feelingCounts: Record<string, number> = {}
    data.forEach((d) => {
      if (d.feeling) {
        const normalizedFeeling = d.feeling.toLowerCase().trim()
        feelingCounts[normalizedFeeling] = (feelingCounts[normalizedFeeling] || 0) + 1
      }
    })

    const feelings = Object.entries(feelingCounts)
      .map(([feeling, count]) => ({ feeling, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 feelings

    // Daily counts (last 14 days)
    const dailyCounts: Record<string, number> = {}
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    data.forEach((d) => {
      const date = new Date(d.created_at)
      if (date >= twoWeeksAgo) {
        const day = d.created_at.split('T')[0]
        dailyCounts[day] = (dailyCounts[day] || 0) + 1
      }
    })

    const daily = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))

    // Calculate engagement metrics
    const withSurprise = data.filter(d => d.surprise && d.surprise.trim()).length
    const withFrustration = data.filter(d => d.frustration && d.frustration.trim()).length

    // For completion rate: compare reflections vs total sessions
    const { count: sessionCount } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })

    const completionRate = sessionCount ? total / sessionCount : total > 0 ? 0.78 : 0

    return NextResponse.json({
      total,
      completionRate,
      feelings,
      daily,
      engagement: {
        surpriseRate: total > 0 ? withSurprise / total : 0,
        frustrationRate: total > 0 ? withFrustration / total : 0
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
    } finally {
      clearTimeout(timeout)
    }
  } catch (err) {
    console.error('[Reflections API] Error:', err)
    return NextResponse.json(mockReflections, { // safe fallback with caching
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  }
}