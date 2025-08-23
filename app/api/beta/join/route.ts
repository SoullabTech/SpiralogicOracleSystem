import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { validateBetaInvite, incrementInviteUsage, awardBadgeAdmin } from '@/lib/server/supabaseAdmin';
import { STARTER_PACK_BADGE } from '@/lib/beta/badges';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (process.env.BETA_INVITE_REQUIRED === 'true' && !code) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
    }

    // If invite required, validate using service role (server)
    if (process.env.BETA_INVITE_REQUIRED === 'true') {
      const validation = await validateBetaInvite(code);
      
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Increment usage
      await incrementInviteUsage(code);
    }

    // Check if user is already a participant
    const { data: existing } = await supabase
      .from('beta_participants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      // Create new participant
      const { error: insertError } = await supabase
        .from('beta_participants')
        .insert({
          user_id: user.id,
          status: 'beta',
          cohort: process.env.BETA_DEFAULT_COHORT || null,
          flags: { starter_pack_complete: false }
        });

      if (insertError) {
        console.error('Failed to create beta participant:', insertError);
        return NextResponse.json({ error: 'Failed to join beta' }, { status: 500 });
      }

      // Award Pioneer badge on join using admin client
      try {
        await awardBadgeAdmin(user.id, STARTER_PACK_BADGE, 'join');
      } catch (badgeError) {
        console.warn('Failed to award Pioneer badge:', badgeError);
        // Don't fail the join if badge award fails
      }
    }

    return NextResponse.json({ 
      ok: true, 
      status: 'beta',
      message: existing ? 'Already in beta' : 'Welcome to Soullab Beta!'
    });

  } catch (e: any) {
    console.error('Beta join error:', e);
    return NextResponse.json({ error: e?.message ?? 'Join failed' }, { status: 500 });
  }
}