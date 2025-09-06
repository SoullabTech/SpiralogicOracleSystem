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
      .select('event_name, browser_info')
      .in('event_name', ['audio_unlocked', 'audio_unlock_failed'])
      .gte('created_at', since);

    if (error) {
      console.error('❌ [Analytics Browser API] Database error:', error);
      throw error;
    }

    // Process data by browser
    const browserStats = new Map<string, {
      unlocked: number;
      failed: number;
      versions: Set<string>;
      platforms: Set<string>;
    }>();

    for (const row of data || []) {
      // Extract browser info
      let browserName = 'Unknown';
      let browserVersion = 'unknown';
      let platform = 'unknown';
      
      if (row.browser_info) {
        browserName = row.browser_info.browser || 
                     detectBrowserFromUA(row.browser_info.userAgent) || 
                     'Unknown';
        browserVersion = row.browser_info.browserVersion || 'unknown';
        platform = row.browser_info.platformType || row.browser_info.platform || 'unknown';
      }
      
      // Initialize browser stats if needed
      if (!browserStats.has(browserName)) {
        browserStats.set(browserName, {
          unlocked: 0,
          failed: 0,
          versions: new Set(),
          platforms: new Set()
        });
      }
      
      const stats = browserStats.get(browserName)!;
      
      // Update counts
      if (row.event_name === 'audio_unlocked') {
        stats.unlocked++;
      } else if (row.event_name === 'audio_unlock_failed') {
        stats.failed++;
      }
      
      // Track versions and platforms
      if (browserVersion !== 'unknown') {
        stats.versions.add(browserVersion);
      }
      if (platform !== 'unknown') {
        stats.platforms.add(platform);
      }
    }

    // Format results
    const results = [...browserStats.entries()].map(([browser, stats]) => {
      const total = stats.unlocked + stats.failed;
      return {
        browser,
        unlocked: stats.unlocked,
        failed: stats.failed,
        total,
        successRate: total > 0 ? Math.round((stats.unlocked / total) * 100) : 0,
        versions: Array.from(stats.versions).slice(0, 3), // Top 3 versions
        platforms: Array.from(stats.platforms)
      };
    }).sort((a, b) => b.total - a.total); // Sort by total usage

    // Calculate overall stats
    const totalSessions = results.reduce((sum, r) => sum + r.total, 0);
    const totalUnlocked = results.reduce((sum, r) => sum + r.unlocked, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    
    return NextResponse.json({
      success: true,
      browsers: results,
      summary: {
        days,
        totalSessions,
        totalUnlocked,
        totalFailed,
        overallSuccessRate: totalSessions > 0 
          ? Math.round((totalUnlocked / totalSessions) * 100) 
          : 0,
        bestPerformer: results[0]?.browser || 'N/A',
        worstPerformer: results.length > 0 
          ? results.reduce((worst, current) => 
              current.successRate < worst.successRate ? current : worst
            ).browser
          : 'N/A'
      }
    });
  } catch (error) {
    console.error('❌ [Analytics Browser API] Failed to fetch browser stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch browser stats' 
      },
      { status: 500 }
    );
  }
}

function detectBrowserFromUA(userAgent?: string): string | null {
  if (!userAgent) return null;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  
  return null;
}