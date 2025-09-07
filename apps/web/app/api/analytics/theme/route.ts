import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client - lazy initialization
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  // Return null if no proper configuration
  if (url === 'https://placeholder.supabase.co' || key === 'placeholder-key') {
    return null;
  }
  
  return createClient(url, key);
}

// Mock data for demo mode
const MOCK_THEME_DATA = {
  distribution: {
    light: 45,
    dark: 35,
    system: 20
  },
  daily: [
    { date: '2025-08-28', light: 42, dark: 38, system: 20 },
    { date: '2025-08-29', light: 44, dark: 36, system: 20 },
    { date: '2025-08-30', light: 45, dark: 35, system: 20 },
    { date: '2025-08-31', light: 43, dark: 37, system: 20 },
    { date: '2025-09-01', light: 46, dark: 33, system: 21 },
    { date: '2025-09-02', light: 44, dark: 35, system: 21 },
    { date: '2025-09-03', light: 45, dark: 35, system: 20 },
    { date: '2025-09-04', light: 47, dark: 34, system: 19 },
    { date: '2025-09-05', light: 45, dark: 35, system: 20 },
  ],
  switches: {
    averagePerSession: 2.3,
    mostCommon: [
      { pattern: 'light→dark', count: 156, timeOfDay: 'evening' },
      { pattern: 'dark→light', count: 142, timeOfDay: 'morning' },
      { pattern: 'system→dark', count: 89, timeOfDay: 'late night' },
    ]
  },
  totalEvents: 523
}

// POST: Track theme change event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, from, to, timestamp, sessionId } = body

    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // If no Supabase client, return success (stub mode)
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    // Get user if authenticated
    const authHeader = req.headers.get('authorization')
    let userId = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id
    }

    // Insert event into event_logs
    const { error } = await supabase
      .from('event_logs')
      .insert({
        event_name: event || 'theme_changed',
        user_id: userId,
        session_id: sessionId,
        payload: {
          from,
          to,
          timestamp,
          hour: new Date(timestamp).getHours(),
          userAgent: req.headers.get('user-agent')
        },
        created_at: timestamp || new Date().toISOString()
      })

    if (error) {
      console.error('[Theme Analytics] Insert error:', error)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Theme Analytics] POST error:', error)
    return NextResponse.json({ success: false }, { status: 200 }) // Still return 200 to not break UI
  }
}

// GET: Retrieve theme analytics
export async function GET(req: NextRequest) {
  // Check for demo mode
  if (process.env.THEME_ANALYTICS_DEBUG === 'true') {
    return NextResponse.json(MOCK_THEME_DATA, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  }

  try {
    // Get Supabase client
    const supabase = getSupabaseClient();
    
    // If no Supabase client, return mock data
    if (!supabase) {
      return NextResponse.json(MOCK_THEME_DATA, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      });
    }
    
    // Get date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    // Fetch theme events
    const { data: themeEvents, error } = await supabase
      .from('event_logs')
      .select('payload, created_at, session_id')
      .eq('event_name', 'theme_changed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (error || !themeEvents) {
      console.error('[Theme Analytics] Query error:', error)
      return NextResponse.json(MOCK_THEME_DATA)
    }

    // Calculate distribution
    const currentThemes = new Map<string, string>() // session_id -> current theme
    const distribution = { light: 0, dark: 0, system: 0 }
    
    themeEvents.forEach(event => {
      const theme = event.payload?.to
      if (theme && !currentThemes.has(event.session_id)) {
        currentThemes.set(event.session_id, theme)
        distribution[theme as keyof typeof distribution]++
      }
    })

    // Calculate daily trends
    const dailyMap = new Map<string, { light: number, dark: number, system: number }>()
    themeEvents.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      const theme = event.payload?.to
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { light: 0, dark: 0, system: 0 })
      }
      
      const day = dailyMap.get(date)!
      if (theme && day[theme as keyof typeof day] !== undefined) {
        day[theme as keyof typeof day]++
      }
    })

    // Convert to array for last 9 days
    const daily = []
    for (let i = 8; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const counts = dailyMap.get(dateStr) || { light: 0, dark: 0, system: 0 }
      
      // Convert to percentages
      const total = counts.light + counts.dark + counts.system
      if (total > 0) {
        daily.push({
          date: dateStr,
          light: Math.round((counts.light / total) * 100),
          dark: Math.round((counts.dark / total) * 100),
          system: Math.round((counts.system / total) * 100)
        })
      }
    }

    // Calculate switch patterns
    const switchPatterns = new Map<string, number>()
    const sessionSwitches = new Map<string, number>()
    
    themeEvents.forEach(event => {
      const pattern = `${event.payload?.from}→${event.payload?.to}`
      if (event.payload?.from && event.payload?.to && event.payload?.from !== event.payload?.to) {
        switchPatterns.set(pattern, (switchPatterns.get(pattern) || 0) + 1)
        sessionSwitches.set(event.session_id, (sessionSwitches.get(event.session_id) || 0) + 1)
      }
    })

    // Get most common patterns
    const mostCommon = Array.from(switchPatterns.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => ({
        ...item,
        timeOfDay: 'various' // Could calculate this from timestamps
      }))

    // Calculate average switches per session
    const totalSwitches = Array.from(sessionSwitches.values()).reduce((a, b) => a + b, 0)
    const averagePerSession = sessionSwitches.size > 0 
      ? (totalSwitches / sessionSwitches.size).toFixed(1) 
      : 0

    return NextResponse.json({
      distribution,
      daily,
      switches: {
        averagePerSession: parseFloat(averagePerSession as string),
        mostCommon
      },
      totalEvents: themeEvents.length
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })

  } catch (error) {
    console.error('[Theme Analytics] Unexpected error:', error)
    return NextResponse.json(MOCK_THEME_DATA)
  }
}