import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { 
  computeStarterPackComplete, 
  BADGE_EVENT_MAP, 
  EVENT_STARTER_MAP 
} from '@/lib/beta/badges';
import { awardBadgeAdmin } from '@/lib/server/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const body = await req.json();
    const { kind, details } = body || {};

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!kind) {
      return NextResponse.json({ error: 'Event kind required' }, { status: 400 });
    }

    // Record event
    const { error: eventError } = await supabase
      .from('beta_events')
      .insert({
        user_id: user.id, 
        kind, 
        details: details ?? {}
      });

    if (eventError) {
      console.error('Failed to record beta event:', eventError);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    // Get current participant data
    const { data: participant } = await supabase
      .from('beta_participants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Update participant flags for starter pack tracking
    const flags = { ...(participant?.flags ?? {}) };
    const starterKey = EVENT_STARTER_MAP[kind];
    if (starterKey) {
      flags[starterKey] = true;
    }

    const starterComplete = computeStarterPackComplete(flags);
    flags['starter_pack_complete'] = starterComplete;

    // Update participant with new flags and last activity
    const { error: updateError } = await supabase
      .from('beta_participants')
      .upsert({
        user_id: user.id,
        status: participant?.status || 'beta',
        cohort: participant?.cohort || process.env.BETA_DEFAULT_COHORT || null,
        flags,
        last_event_at: new Date().toISOString()
      });

    if (updateError) {
      console.warn('Failed to update participant flags:', updateError);
    }

    // Auto-award badges based on event kind
    const badgeId = BADGE_EVENT_MAP[kind];
    let newBadge = null;
    if (badgeId && process.env.BETA_BADGES_ENABLED === 'true') {
      try {
        // Check if user already has this badge
        const { data: existingBadge } = await supabase
          .from('beta_user_badges')
          .select('badge_id')
          .eq('user_id', user.id)
          .eq('badge_id', badgeId)
          .maybeSingle();

        if (!existingBadge) {
          await awardBadgeAdmin(user.id, badgeId, kind);
          
          // Get badge details for response
          const { data: badge } = await supabase
            .from('beta_badges_catalog')
            .select('*')
            .eq('badge_id', badgeId)
            .single();
          
          newBadge = badge;
        }
      } catch (badgeError) {
        console.warn('Failed to award badge:', badgeError);
        // Don't fail the event recording if badge award fails
      }
    }

    // Calculate progress towards PATHFINDER badge (3 active days in 7)
    let pathfinderProgress = null;
    if (kind === 'oracle_turn') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: recentEvents } = await supabase
        .from('beta_events')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('kind', 'oracle_turn')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentEvents) {
        const uniqueDays = new Set(
          recentEvents.map(e => new Date(e.created_at).toDateString())
        );
        const activeDays = uniqueDays.size;
        
        if (activeDays >= 3) {
          // Check if PATHFINDER badge already awarded
          const { data: pathfinderBadge } = await supabase
            .from('beta_user_badges')
            .select('badge_id')
            .eq('user_id', user.id)
            .eq('badge_id', 'PATHFINDER')
            .maybeSingle();

          if (!pathfinderBadge) {
            try {
              await awardBadgeAdmin(user.id, 'PATHFINDER', 'activity_pattern');
              
              const { data: badge } = await supabase
                .from('beta_badges_catalog')
                .select('*')
                .eq('badge_id', 'PATHFINDER')
                .single();
              
              if (!newBadge) newBadge = badge; // Show this badge if no other was awarded
            } catch (error) {
              console.warn('Failed to award PATHFINDER badge:', error);
            }
          }
        }
        
        pathfinderProgress = { activeDays, needed: 3 };
      }
    }

    return NextResponse.json({ 
      ok: true, 
      starter_pack_complete: starterComplete, 
      flags,
      new_badge: newBadge,
      pathfinder_progress: pathfinderProgress,
      event_recorded: kind
    });

  } catch (error) {
    console.error('Beta event error:', error);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}