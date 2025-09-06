import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get days parameter from query
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    // Calculate date range
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('event_logs')
      .select('event_name, session_id, created_at, browser_info')
      .in('event_name', ['audio_unlocked', 'audio_unlock_failed'])
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [Analytics Trend API] Database error:', error);
      throw error;
    }

    // Group by day and session
    const dailyStats = new Map<string, Map<string, { 
      unlocked: boolean; 
      failed: boolean;
      browser?: string;
    }>>();

    for (const row of data || []) {
      const day = row.created_at.slice(0, 10); // YYYY-MM-DD
      const sessionId = row.session_id;
      
      if (!sessionId) continue;
      
      if (!dailyStats.has(day)) {
        dailyStats.set(day, new Map());
      }
      
      const daySessions = dailyStats.get(day)!;
      
      if (!daySessions.has(sessionId)) {
        daySessions.set(sessionId, { 
          unlocked: false, 
          failed: false,
          browser: row.browser_info?.userAgent ? detectBrowserFromUA(row.browser_info.userAgent) : 'Unknown'
        });
      }
      
      const session = daySessions.get(sessionId)!;
      if (row.event_name === 'audio_unlocked') {
        session.unlocked = true;
      }
      if (row.event_name === 'audio_unlock_failed') {
        session.failed = true;
      }
    }

    // Calculate daily percentages
    const trend = [...dailyStats.entries()].map(([day, sessions]) => {
      const total = sessions.size;
      const unlocked = [...sessions.values()].filter(s => s.unlocked).length;
      const failed = [...sessions.values()].filter(s => s.failed && !s.unlocked).length;
      
      // Browser breakdown for this day
      const browserStats = new Map<string, number>();
      for (const session of sessions.values()) {
        if (session.unlocked) {
          const browser = session.browser || 'Unknown';
          browserStats.set(browser, (browserStats.get(browser) || 0) + 1);
        }
      }
      
      return {
        day,
        total,
        unlocked,
        failed,
        percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
        browsers: Object.fromEntries(browserStats)
      };
    }).sort((a, b) => a.day.localeCompare(b.day));

    return NextResponse.json({
      success: true,
      trend,
      summary: {
        days,
        totalSessions: trend.reduce((sum, day) => sum + day.total, 0),
        totalUnlocked: trend.reduce((sum, day) => sum + day.unlocked, 0),
        averagePercent: trend.length > 0 
          ? Math.round(trend.reduce((sum, day) => sum + day.percent, 0) / trend.length)
          : 0
      }
    });
  } catch (error) {
    console.error('❌ [Analytics Trend API] Failed to fetch trend data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trend data' 
      },
      { status: 500 }
    );
  }
}

function detectBrowserFromUA(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
}