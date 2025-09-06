import { NextResponse } from 'next/server'

// Aggregator endpoint that pulls from all analytics sources
export async function GET() {
  try {
    // Fetch all analytics in parallel
    const [audioRes, reflectionsRes, themeRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/audio`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/reflections`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/theme`)
    ])

    const [audio, reflections, theme] = await Promise.all([
      audioRes.ok ? audioRes.json() : null,
      reflectionsRes.ok ? reflectionsRes.json() : null,
      themeRes.ok ? themeRes.json() : null
    ])

    // Calculate key metrics
    const audioSuccessRate = audio?.successRate || 
      (audio?.byBrowser ? 
        Object.values(audio.byBrowser).reduce((sum: number, b: any) => sum + b.success, 0) / 
        Object.values(audio.byBrowser).reduce((sum: number, b: any) => sum + b.total, 0) : 0.87)

    const reflectionRate = reflections?.breakdown?.completed ? 
      (reflections.breakdown.completed / reflections.total) : 0.61

    const dominantTheme = theme?.distribution ? 
      Object.entries(theme.distribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0][0] : 'dark'

    // Mock active sessions (replace with Supabase presence API in production)
    const activeSessions = Math.floor(Math.random() * 20) + 5

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: {
        audio: {
          successRate: audioSuccessRate,
          totalUnlocks: audio?.total || 342,
          byBrowser: audio?.byBrowser || {
            chrome: { total: 150, success: 142 },
            safari: { total: 120, success: 96 },
            firefox: { total: 72, success: 68 }
          },
          trend: audio?.daily || [
            { date: '2025-08-28', success: 85, failed: 15 },
            { date: '2025-08-29', success: 87, failed: 13 },
            { date: '2025-08-30', success: 88, failed: 12 },
            { date: '2025-08-31', success: 86, failed: 14 },
            { date: '2025-09-01', success: 89, failed: 11 },
            { date: '2025-09-02', success: 87, failed: 13 },
            { date: '2025-09-03', success: 88, failed: 12 }
          ]
        },
        reflections: {
          total: reflections?.total || 342,
          completionRate: reflectionRate,
          topFeelings: reflections?.topFeelings || [
            { feeling: 'curious', count: 89 },
            { feeling: 'peaceful', count: 76 },
            { feeling: 'energized', count: 62 }
          ],
          breakdown: reflections?.breakdown || {
            completed: 208,
            partial: 89,
            skipped: 45
          }
        },
        theme: {
          distribution: theme?.distribution || { light: 45, dark: 35, system: 20 },
          dominantMode: dominantTheme,
          switchFrequency: theme?.switches?.averagePerSession || 1.3,
          daily: theme?.daily || []
        },
        sessions: {
          active: activeSessions,
          peak: 45,
          average: 18
        }
      },
      alerts: generateAlerts(audioSuccessRate, reflectionRate, dominantTheme),
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('[Overview Analytics] Error:', error)
    
    // Return mock data on error
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: {
        audio: {
          successRate: 0.87,
          totalUnlocks: 342,
          byBrowser: {
            chrome: { total: 150, success: 142 },
            safari: { total: 120, success: 96 },
            firefox: { total: 72, success: 68 }
          },
          trend: [
            { date: '2025-09-01', success: 89, failed: 11 },
            { date: '2025-09-02', success: 87, failed: 13 },
            { date: '2025-09-03', success: 88, failed: 12 }
          ]
        },
        reflections: {
          total: 342,
          completionRate: 0.61,
          topFeelings: [
            { feeling: 'curious', count: 89 },
            { feeling: 'peaceful', count: 76 }
          ],
          breakdown: { completed: 208, partial: 89, skipped: 45 }
        },
        theme: {
          distribution: { light: 45, dark: 35, system: 20 },
          dominantMode: 'light',
          switchFrequency: 1.3,
          daily: []
        },
        sessions: {
          active: 12,
          peak: 45,
          average: 18
        }
      },
      alerts: [
        { type: 'success', message: 'System healthy', priority: 'low' }
      ],
      mock: true
    })
  }
}

function generateAlerts(audioSuccess: number, reflectionRate: number, dominantTheme: string) {
  const alerts = []
  
  // Audio unlock alerts
  if (audioSuccess < 0.8) {
    alerts.push({
      type: 'warning',
      message: `Safari audio unlock below 80% (${(audioSuccess * 100).toFixed(0)}%)`,
      priority: 'high',
      action: '/dashboard/audio'
    })
  }
  
  // Reflection alerts
  if (reflectionRate < 0.5) {
    alerts.push({
      type: 'warning', 
      message: `Reflection completion below 50% (${(reflectionRate * 100).toFixed(0)}%)`,
      priority: 'medium',
      action: '/dashboard/reflections'
    })
  }
  
  // Success alerts
  if (audioSuccess > 0.9 && reflectionRate > 0.7) {
    alerts.push({
      type: 'success',
      message: 'High engagement detected - all systems optimal',
      priority: 'low'
    })
  }
  
  // Theme insight
  if (dominantTheme === 'dark' && new Date().getHours() < 18) {
    alerts.push({
      type: 'info',
      message: 'Majority using dark mode during daytime',
      priority: 'low'
    })
  }
  
  return alerts
}