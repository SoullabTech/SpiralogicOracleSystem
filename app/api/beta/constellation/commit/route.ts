import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { 
  findEligibleConstellation,
  evaluateConstellationRules,
  adaptVisualToUserBadges,
  generateNarrationLines,
  getBadgeCategory,
  type UserBadge
} from '@/lib/beta/constellation';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if ceremony is enabled
    if (process.env.CEREMONY_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Graduation ceremonies are currently disabled' }, { status: 503 });
    }

    // Get user's badges
    const { data: userBadges, error: badgesError } = await supabase
      .from('beta_user_badges')
      .select('badge_id, awarded_at')
      .eq('user_id', user.id)
      .order('awarded_at', { ascending: true });

    if (badgesError) {
      console.error('Failed to fetch user badges:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    const badges: UserBadge[] = (userBadges || []).map(badge => ({
      badge_id: badge.badge_id,
      category: getBadgeCategory(badge.badge_id),
      awarded_at: badge.awarded_at
    }));

    // Check if user already graduated
    const hasGraduated = badges.some(b => b.badge_id === 'GRADUATED_PIONEER');
    if (hasGraduated) {
      return NextResponse.json({
        error: 'already_graduated',
        message: 'You have already completed your graduation ceremony'
      }, { status: 400 });
    }

    // Check for existing active ceremony
    const { data: existingCeremony } = await supabase
      .from('badge_ceremonies')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'started')
      .maybeSingle();

    if (existingCeremony) {
      // Return existing ceremony
      const { data: constellation } = await supabase
        .from('badge_constellations')
        .select('*')
        .eq('code', existingCeremony.constellation_code)
        .single();

      if (constellation) {
        const adaptedVisual = adaptVisualToUserBadges(constellation.visual, badges);
        const narrationLines = generateNarrationLines(constellation, badges);

        return NextResponse.json({
          ceremony_id: existingCeremony.id,
          constellation: {
            id: constellation.id,
            code: constellation.code,
            name: constellation.name,
            description: constellation.description,
            visual: adaptedVisual,
            narration_lines: narrationLines
          },
          started_at: existingCeremony.started_at,
          existing: true
        });
      }
    }

    // Find eligible constellation
    const eligibleConstellationCode = await findEligibleConstellation(badges);
    
    if (!eligibleConstellationCode) {
      return NextResponse.json({
        error: 'not_eligible',
        message: 'Continue exploring to unlock your constellation',
        current_badges: badges.length,
        required_minimum: 5
      }, { status: 400 });
    }

    // Get constellation definition
    const { data: constellation, error: constellationError } = await supabase
      .from('badge_constellations')
      .select('*')
      .eq('code', eligibleConstellationCode)
      .single();

    if (constellationError || !constellation) {
      console.error('Failed to fetch constellation:', constellationError);
      return NextResponse.json({ error: 'Constellation not found' }, { status: 404 });
    }

    // Evaluate rules
    const evaluation = evaluateConstellationRules(constellation.rules, badges);
    
    if (!evaluation.eligible) {
      return NextResponse.json({
        error: 'rules_not_met',
        message: 'Your badges don\'t yet form this constellation pattern',
        evaluation: evaluation.details
      }, { status: 400 });
    }

    // Create new ceremony
    const { data: newCeremony, error: ceremonyError } = await supabase
      .from('badge_ceremonies')
      .insert({
        user_id: user.id,
        constellation_code: eligibleConstellationCode,
        status: 'started',
        meta: {
          badge_count: badges.length,
          categories: [...new Set(badges.map(b => getBadgeCategory(b.badge_id)))],
          evaluation: evaluation.details
        }
      })
      .select()
      .single();

    if (ceremonyError) {
      console.error('Failed to create ceremony:', ceremonyError);
      return NextResponse.json({ error: 'Failed to start ceremony' }, { status: 500 });
    }

    // Adapt visual and generate narration
    const adaptedVisual = adaptVisualToUserBadges(constellation.visual, badges);
    const narrationLines = generateNarrationLines(constellation, badges);

    // Log ceremony start event
    await supabase
      .from('beta_events')
      .insert({
        user_id: user.id,
        kind: 'ceremony_started',
        details: {
          ceremony_id: newCeremony.id,
          constellation_code: eligibleConstellationCode,
          badge_count: badges.length
        }
      });

    return NextResponse.json({
      ceremony_id: newCeremony.id,
      constellation: {
        id: constellation.id,
        code: constellation.code,
        name: constellation.name,
        description: constellation.description,
        visual: adaptedVisual,
        narration_lines: narrationLines
      },
      started_at: newCeremony.started_at,
      existing: false
    });

  } catch (error) {
    console.error('Constellation commit error:', error);
    return NextResponse.json({ error: 'Failed to start ceremony' }, { status: 500 });
  }
}