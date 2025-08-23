import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin permission
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get badge award statistics with catalog details
    const { data: badgeStats, error: statsError } = await supabase
      .rpc('get_badge_award_stats');

    if (statsError) {
      console.warn('RPC failed, falling back to manual query:', statsError);
      
      // Fallback to manual aggregation
      const { data: awards, error: awardsError } = await supabase
        .from('beta_user_badges')
        .select(`
          badge_id,
          awarded_at,
          beta_badges_catalog (
            name,
            emoji,
            category
          )
        `);

      if (awardsError) {
        console.error('Failed to fetch badge awards:', awardsError);
        return NextResponse.json({ error: 'Failed to fetch badge data' }, { status: 500 });
      }

      // Manual aggregation
      const badgeGroups = awards?.reduce((acc: any, award: any) => {
        const badgeId = award.badge_id;
        if (!acc[badgeId]) {
          acc[badgeId] = {
            badge_id: badgeId,
            name: award.beta_badges_catalog?.name || badgeId,
            emoji: award.beta_badges_catalog?.emoji || '🏆',
            category: award.beta_badges_catalog?.category || 'other',
            awards: []
          };
        }
        acc[badgeId].awards.push(award);
        return acc;
      }, {}) || {};

      const manualStats = Object.values(badgeGroups).map((group: any) => {
        const awards = group.awards;
        const awardTimes = awards
          .map((a: any) => new Date(a.awarded_at).getTime())
          .sort((a: any, b: any) => a - b);
        
        // Calculate average time to earn (rough estimate based on award intervals)
        const avgHoursToEarn = awards.length > 1 
          ? (awardTimes[awardTimes.length - 1] - awardTimes[0]) / (awards.length - 1) / (1000 * 60 * 60)
          : 0;

        return {
          badge_id: group.badge_id,
          name: group.name,
          emoji: group.emoji,
          awarded_count: awards.length,
          unique_recipients: new Set(awards.map((a: any) => a.user_id)).size,
          avg_hours_to_earn: Math.max(0, avgHoursToEarn)
        };
      });

      return NextResponse.json({
        awards: manualStats.sort((a: any, b: any) => b.awarded_count - a.awarded_count)
      });
    }

    // Use RPC result if available
    const awards = badgeStats?.map((stat: any) => ({
      badge_id: stat.badge_id,
      name: stat.badge_name || stat.badge_id,
      emoji: stat.badge_emoji || '🏆',
      awarded_count: stat.award_count || 0,
      unique_recipients: stat.unique_users || 0,
      avg_hours_to_earn: stat.avg_hours_to_earn || 0
    })) || [];

    return NextResponse.json({
      awards: awards.sort((a: any, b: any) => b.awarded_count - a.awarded_count)
    });

  } catch (error) {
    console.error('Admin badge awards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}