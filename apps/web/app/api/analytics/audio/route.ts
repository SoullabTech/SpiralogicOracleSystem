import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get last 24 hours of data
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('event_logs')
      .select('event_name, session_id, browser_info')
      .in('event_name', ['audio_unlocked', 'audio_unlock_failed'])
      .gte('created_at', since);

    if (error) {
      console.error('❌ [Analytics API] Database error:', error);
      throw error;
    }

    // Process data by session
    const sessions = new Map<string, { 
      unlocked: boolean; 
      failed: boolean;
      browser?: string;
    }>();

    for (const row of data || []) {
      const sessionId = row.session_id;
      if (!sessionId) continue;
      
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, { 
          unlocked: false, 
          failed: false,
          browser: row.browser_info?.userAgent ? detectBrowserFromUA(row.browser_info.userAgent) : 'Unknown'
        });
      }
      
      const session = sessions.get(sessionId)!;
      if (row.event_name === 'audio_unlocked') {
        session.unlocked = true;
      }
      if (row.event_name === 'audio_unlock_failed') {
        session.failed = true;
      }
    }

    // Calculate statistics
    const total = sessions.size;
    const unlocked = [...sessions.values()].filter(s => s.unlocked).length;
    const failed = [...sessions.values()].filter(s => s.failed && !s.unlocked).length;
    
    // Browser breakdown
    const browserStats = new Map<string, { total: number; unlocked: number }>();
    for (const session of sessions.values()) {
      const browser = session.browser || 'Unknown';
      if (!browserStats.has(browser)) {
        browserStats.set(browser, { total: 0, unlocked: 0 });
      }
      const stats = browserStats.get(browser)!;
      stats.total++;
      if (session.unlocked) stats.unlocked++;
    }

    return NextResponse.json({
      success: true,
      stats: {
        total,
        unlocked,
        failed,
        percent: total > 0 ? Math.round((unlocked / total) * 100) : 0,
        browsers: Object.fromEntries(
          [...browserStats.entries()].map(([browser, stats]) => [
            browser,
            {
              ...stats,
              percent: stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0
            }
          ])
        )
      }
    });
  } catch (error) {
    console.error('❌ [Analytics API] Failed to fetch audio stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch audio stats' 
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