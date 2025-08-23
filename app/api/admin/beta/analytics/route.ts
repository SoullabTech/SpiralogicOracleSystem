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

    // Get analytics data from the view we created
    const { data: analytics } = await supabase
      .from('v_beta_analytics')
      .select('*')
      .single();

    if (!analytics) {
      // Fallback to manual calculation if view doesn't exist
      const { data: participants } = await supabase
        .from('beta_participants')
        .select('status, flags, joined_at');

      const { data: recentEvents } = await supabase
        .from('beta_events')
        .select('user_id, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const totalParticipants = participants?.length || 0;
      const activeBetaUsers = participants?.filter(p => p.status === 'beta').length || 0;
      const graduatedUsers = participants?.filter(p => p.status === 'graduated').length || 0;
      
      const active24h = new Set(
        recentEvents?.filter(e => 
          new Date(e.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).map(e => e.user_id)
      ).size;

      const active7d = new Set(recentEvents?.map(e => e.user_id)).size;

      const starterPackComplete = participants?.filter(p => 
        p.flags?.starter_pack_complete === true
      ).length || 0;

      const starterPackCompletionRate = totalParticipants > 0 
        ? starterPackComplete / totalParticipants 
        : 0;

      return NextResponse.json({
        total_participants: totalParticipants,
        active_beta_users: activeBetaUsers,
        graduated_users: graduatedUsers,
        active_24h,
        active_7d,
        starter_pack_completion_rate: starterPackCompletionRate
      });
    }

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Beta analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}