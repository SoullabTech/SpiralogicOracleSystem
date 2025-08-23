import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { computeStarterPackComplete } from '@/lib/beta/badges';
import { isAdminUser } from '@/lib/server/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { force = false, user_id = null } = body || {};

    // Check if this is an admin operation for another user
    let targetUserId = user.id;
    if (user_id && user_id !== user.id) {
      const isAdmin = await isAdminUser(user.id);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      targetUserId = user_id;
    }

    // Get participant data
    const { data: participant } = await supabase
      .from('beta_participants')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ error: 'Not in beta program' }, { status: 400 });
    }

    if (participant.status === 'graduated') {
      return NextResponse.json({ 
        ok: true, 
        status: 'graduated',
        message: 'Already graduated'
      });
    }

    // Check graduation criteria
    const byDate = process.env.BETA_GRADUATION_DATE
      ? new Date() >= new Date(process.env.BETA_GRADUATION_DATE)
      : false;
      
    const byMilestone = computeStarterPackComplete(participant.flags || {});
    
    // Get badge count as additional criterion
    const { data: badges } = await supabase
      .from('beta_user_badges')
      .select('badge_id')
      .eq('user_id', targetUserId);
    
    const badgeCount = badges?.length || 0;
    const hasEnoughBadges = badgeCount >= 3; // Pioneer + 2 others
    
    const canGraduate = force || byDate || (byMilestone && hasEnoughBadges);

    if (!canGraduate) {
      return NextResponse.json({ 
        ok: false, 
        reason: 'criteria_not_met',
        requirements: {
          starter_pack_complete: byMilestone,
          enough_badges: hasEnoughBadges,
          badge_count: badgeCount,
          graduation_date_passed: byDate,
          graduation_date: process.env.BETA_GRADUATION_DATE
        }
      });
    }

    // Graduate the user
    const { error: graduateError } = await supabase
      .from('beta_participants')
      .update({ 
        status: 'graduated',
        flags: {
          ...participant.flags,
          graduated_at: new Date().toISOString(),
          graduation_reason: force ? 'admin_force' : byDate ? 'date' : 'milestone'
        }
      })
      .eq('user_id', targetUserId);

    if (graduateError) {
      console.error('Failed to graduate user:', graduateError);
      return NextResponse.json({ error: 'Failed to graduate' }, { status: 500 });
    }

    // Log graduation event
    await supabase
      .from('beta_events')
      .insert({
        user_id: targetUserId,
        kind: 'graduated',
        details: {
          reason: force ? 'admin_force' : byDate ? 'date' : 'milestone',
          badge_count: badgeCount,
          starter_pack_complete: byMilestone
        }
      });

    return NextResponse.json({ 
      ok: true, 
      status: 'graduated',
      message: 'Congratulations! You\'ve graduated from the beta program.',
      details: {
        badge_count: badgeCount,
        starter_pack_complete: byMilestone,
        graduation_reason: force ? 'admin_force' : byDate ? 'date' : 'milestone'
      }
    });

  } catch (error) {
    console.error('Beta graduation error:', error);
    return NextResponse.json({ error: 'Failed to process graduation' }, { status: 500 });
  }
}

// GET endpoint to check graduation eligibility
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: participant } = await supabase
      .from('beta_participants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ eligible: false, reason: 'not_in_beta' });
    }

    if (participant.status === 'graduated') {
      return NextResponse.json({ eligible: true, already_graduated: true });
    }

    const byDate = process.env.BETA_GRADUATION_DATE
      ? new Date() >= new Date(process.env.BETA_GRADUATION_DATE)
      : false;
      
    const byMilestone = computeStarterPackComplete(participant.flags || {});
    
    const { data: badges } = await supabase
      .from('beta_user_badges')
      .select('badge_id')
      .eq('user_id', user.id);
    
    const badgeCount = badges?.length || 0;
    const hasEnoughBadges = badgeCount >= 3;
    
    const eligible = byDate || (byMilestone && hasEnoughBadges);

    return NextResponse.json({
      eligible,
      requirements: {
        starter_pack_complete: byMilestone,
        enough_badges: hasEnoughBadges,
        badge_count: badgeCount,
        graduation_date_passed: byDate,
        graduation_date: process.env.BETA_GRADUATION_DATE
      }
    });

  } catch (error) {
    console.error('Beta graduation check error:', error);
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
  }
}