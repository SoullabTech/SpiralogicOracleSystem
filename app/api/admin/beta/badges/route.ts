import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { isAdminUser } from '@/lib/server/supabaseAdmin';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Try to get data from the view first
    const { data: badgeStats } = await supabase
      .from('v_beta_badge_stats')
      .select('*')
      .order('sort_order');

    if (badgeStats && badgeStats.length > 0) {
      return NextResponse.json({ badges: badgeStats });
    }

    // Fallback to manual calculation
    const { data: badges } = await supabase
      .from('beta_badges_catalog')
      .select('*')
      .order('sort_order');

    const badgesWithStats = await Promise.all(
      (badges || []).map(async (badge) => {
        const { data: awards } = await supabase
          .from('beta_user_badges')
          .select('user_id, awarded_at')
          .eq('badge_id', badge.badge_id);

        const { data: participants } = await supabase
          .from('beta_participants')
          .select('joined_at')
          .in('user_id', awards?.map(a => a.user_id) || []);

        const awardedCount = awards?.length || 0;
        const uniqueRecipients = new Set(awards?.map(a => a.user_id)).size;

        // Calculate average hours to earn
        let avgHoursToEarn = 0;
        if (awards && participants && awards.length > 0) {
          const hoursToEarn = awards.map(award => {
            const participant = participants.find((p: any) => p.user_id === award.user_id);
            if (participant) {
              const joinTime = new Date(participant.joined_at);
              const awardTime = new Date(award.awarded_at);
              return (awardTime.getTime() - joinTime.getTime()) / (1000 * 60 * 60);
            }
            return 0;
          }).filter(h => h > 0);
          
          avgHoursToEarn = hoursToEarn.length > 0 
            ? hoursToEarn.reduce((a, b) => a + b, 0) / hoursToEarn.length 
            : 0;
        }

        return {
          badge_id: badge.badge_id,
          name: badge.name,
          emoji: badge.emoji,
          awarded_count: awardedCount,
          unique_recipients: uniqueRecipients,
          avg_hours_to_earn: avgHoursToEarn
        };
      })
    );

    return NextResponse.json({ badges: badgesWithStats });

  } catch (error) {
    console.error('Beta badges stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch badge stats' }, { status: 500 });
  }
}