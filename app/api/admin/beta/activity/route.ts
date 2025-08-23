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
    const { data: recentActivity } = await supabase
      .from('v_beta_recent_activity')
      .select('*')
      .limit(50);

    if (recentActivity && recentActivity.length > 0) {
      return NextResponse.json({ activity: recentActivity });
    }

    // Fallback to manual query
    const { data: events } = await supabase
      .from('beta_events')
      .select(`
        user_id,
        kind,
        details,
        created_at
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (!events) {
      return NextResponse.json({ activity: [] });
    }

    // Get participant info for the events
    const userIds = [...new Set(events.map(e => e.user_id))];
    const { data: participants } = await supabase
      .from('beta_participants')
      .select('user_id, status, cohort')
      .in('user_id', userIds);

    const participantMap = new Map(
      participants?.map(p => [p.user_id, p]) || []
    );

    const enrichedActivity = events.map(event => {
      const participant = participantMap.get(event.user_id);
      return {
        ...event,
        status: participant?.status || 'unknown',
        cohort: participant?.cohort || null
      };
    });

    return NextResponse.json({ activity: enrichedActivity });

  } catch (error) {
    console.error('Beta activity error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}