import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { ceremonyId } = body;

    if (!ceremonyId) {
      return NextResponse.json({ error: 'Ceremony ID required' }, { status: 400 });
    }

    // Get ceremony details
    const { data: ceremony, error: ceremonyError } = await supabase
      .from('badge_ceremonies')
      .select('*')
      .eq('id', ceremonyId)
      .eq('user_id', user.id)
      .single();

    if (ceremonyError || !ceremony) {
      return NextResponse.json({ error: 'Ceremony not found' }, { status: 404 });
    }

    if (ceremony.status === 'completed') {
      return NextResponse.json({
        already_completed: true,
        message: 'Ceremony already completed',
        completed_at: ceremony.completed_at
      });
    }

    if (ceremony.status !== 'started') {
      return NextResponse.json({ error: 'Invalid ceremony status' }, { status: 400 });
    }

    // Check if user already has GRADUATED_PIONEER badge
    const { data: existingGradBadge } = await supabase
      .from('beta_user_badges')
      .select('badge_id')
      .eq('user_id', user.id)
      .eq('badge_id', 'GRADUATED_PIONEER')
      .maybeSingle();

    let graduationBadgeAwarded = false;

    // Award GRADUATED_PIONEER badge if not already present
    if (!existingGradBadge) {
      const { error: badgeError } = await supabase
        .from('beta_user_badges')
        .insert({
          user_id: user.id,
          badge_id: 'GRADUATED_PIONEER',
          source: 'graduation_ceremony'
        });

      if (badgeError) {
        console.error('Failed to award graduation badge:', badgeError);
        // Continue anyway - don't fail ceremony for badge error
      } else {
        graduationBadgeAwarded = true;
      }
    }

    // Update beta participant status to graduated
    const { error: participantError } = await supabase
      .from('beta_participants')
      .update({ 
        status: 'graduated',
        flags: {
          ...ceremony.meta,
          graduated_at: new Date().toISOString(),
          ceremony_id: ceremonyId,
          constellation_code: ceremony.constellation_code
        }
      })
      .eq('user_id', user.id);

    if (participantError) {
      console.error('Failed to update participant status:', participantError);
      // Continue anyway - the ceremony completion is more important
    }

    // Mark ceremony as completed
    const { error: completionError } = await supabase
      .from('badge_ceremonies')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        meta: {
          ...ceremony.meta,
          completion_duration_seconds: Math.floor((Date.now() - new Date(ceremony.started_at).getTime()) / 1000),
          graduation_badge_awarded: graduationBadgeAwarded
        }
      })
      .eq('id', ceremonyId);

    if (completionError) {
      console.error('Failed to complete ceremony:', completionError);
      return NextResponse.json({ error: 'Failed to complete ceremony' }, { status: 500 });
    }

    // Log graduation completion event
    await supabase
      .from('beta_events')
      .insert({
        user_id: user.id,
        kind: 'graduation_complete',
        details: {
          ceremony_id: ceremonyId,
          constellation_code: ceremony.constellation_code,
          graduation_badge_awarded: graduationBadgeAwarded,
          duration_seconds: Math.floor((Date.now() - new Date(ceremony.started_at).getTime()) / 1000)
        }
      });

    // Refresh materialized view for admin dashboard
    try {
      await supabase.rpc('refresh_ceremonies_view');
    } catch (viewError) {
      console.warn('Failed to refresh ceremonies view:', viewError);
    }

    return NextResponse.json({
      success: true,
      completed_at: new Date().toISOString(),
      graduation_badge_awarded: graduationBadgeAwarded,
      status: 'graduated',
      next_steps: {
        message: 'Welcome to your graduated pioneer status! Your beta journey is complete.',
        actions: [
          {
            type: 'profile_view',
            title: 'View Your Profile',
            url: '/beta/badges'
          },
          {
            type: 'continue_oracle',
            title: 'Continue with Oracle',
            url: '/oracle'
          }
        ]
      },
      ceremony: {
        id: ceremonyId,
        constellation_code: ceremony.constellation_code,
        started_at: ceremony.started_at,
        completed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Constellation completion error:', error);
    return NextResponse.json({ error: 'Failed to complete ceremony' }, { status: 500 });
  }
}