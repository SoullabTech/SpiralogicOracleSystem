import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { computeStarterPackComplete } from '@/lib/beta/badges';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ status: 'anon' });
    }

    // Get participant data
    const { data: participant } = await supabase
      .from('beta_participants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Get user badges
    const { data: badges } = await supabase
      .from('beta_user_badges')
      .select(`
        badge_id,
        awarded_at,
        source,
        beta_badges_catalog (
          name,
          emoji,
          description
        )
      `)
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: false });

    // Get recent events for engagement metrics
    const { data: recentEvents } = await supabase
      .from('beta_events')
      .select('kind, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false });

    const starterComplete = computeStarterPackComplete(participant?.flags || {});
    
    // Calculate engagement metrics
    const eventCounts = (recentEvents || []).reduce((acc, event) => {
      acc[event.kind] = (acc[event.kind] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeDays = new Set(
      (recentEvents || []).map(e => new Date(e.created_at).toDateString())
    ).size;

    return NextResponse.json({
      user_id: user.id,
      status: participant?.status ?? 'none',
      cohort: participant?.cohort,
      joined_at: participant?.joined_at,
      flags: participant?.flags ?? {},
      starter_pack_complete: starterComplete,
      badges: badges?.map(b => ({
        id: b.badge_id,
        name: (b.beta_badges_catalog as any)?.name,
        emoji: (b.beta_badges_catalog as any)?.emoji,
        description: (b.beta_badges_catalog as any)?.description,
        awarded_at: b.awarded_at,
        source: b.source
      })) ?? [],
      engagement: {
        active_days_7d: activeDays,
        event_counts: eventCounts,
        total_events_7d: recentEvents?.length || 0
      }
    });

  } catch (error) {
    console.error('Beta status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}