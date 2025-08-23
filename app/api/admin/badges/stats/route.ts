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
    
    // Check admin permission (basic check, could be enhanced)
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get ceremony statistics
    const { data: ceremonies, error: ceremoniesError } = await supabase
      .from('badge_ceremonies')
      .select('id, status, started_at, completed_at');

    if (ceremoniesError) {
      console.error('Failed to fetch ceremonies:', ceremoniesError);
      return NextResponse.json({ error: 'Failed to fetch ceremony data' }, { status: 500 });
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calculate statistics
    const totalCeremonies = ceremonies?.length || 0;
    const completedCeremonies = ceremonies?.filter(c => c.status === 'completed').length || 0;
    const completionRate = totalCeremonies > 0 ? completedCeremonies / totalCeremonies : 0;
    
    // Calculate recent completions (last 24h)
    const recentCompletions = ceremonies?.filter(c => 
      c.status === 'completed' && 
      c.completed_at && 
      new Date(c.completed_at) >= yesterday
    ).length || 0;

    // Calculate median duration for completed ceremonies
    const durations = ceremonies
      ?.filter(c => c.status === 'completed' && c.started_at && c.completed_at)
      ?.map(c => {
        const start = new Date(c.started_at).getTime();
        const end = new Date(c.completed_at!).getTime();
        return (end - start) / (1000 * 60); // minutes
      })
      ?.sort((a, b) => a - b) || [];

    const medianDuration = durations.length > 0 
      ? durations.length % 2 === 0
        ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
        : durations[Math.floor(durations.length / 2)]
      : 0;

    const stats = {
      total_ceremonies: totalCeremonies,
      completion_rate: completionRate,
      median_duration_minutes: medianDuration,
      recent_completions_24h: recentCompletions,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin badge stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}