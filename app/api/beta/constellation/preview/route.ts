import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { 
  findEligibleConstellation,
  evaluateConstellationRules,
  adaptVisualToUserBadges,
  generateNarrationLines,
  getBadgeCategory,
  type UserBadge,
  type Constellation
} from '@/lib/beta/constellation';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
        eligible: false,
        reason: 'already_graduated',
        message: 'You have already completed your graduation ceremony'
      });
    }

    // Find eligible constellation
    const eligibleConstellationCode = await findEligibleConstellation(badges);
    
    if (!eligibleConstellationCode) {
      return NextResponse.json({
        eligible: false,
        reason: 'insufficient_badges',
        message: 'Continue exploring to unlock your constellation',
        current_badges: badges.length,
        required_minimum: 5
      });
    }

    // Get constellation definition from database
    const { data: constellation, error: constellationError } = await supabase
      .from('badge_constellations')
      .select('*')
      .eq('code', eligibleConstellationCode)
      .single();

    if (constellationError || !constellation) {
      console.error('Failed to fetch constellation:', constellationError);
      return NextResponse.json({ error: 'Constellation not found' }, { status: 404 });
    }

    // Evaluate rules against user badges
    const evaluation = evaluateConstellationRules(constellation.rules, badges);
    
    if (!evaluation.eligible) {
      return NextResponse.json({
        eligible: false,
        reason: 'rules_not_met',
        message: 'Your badges don\'t yet form this constellation pattern',
        evaluation: evaluation.details,
        constellation_code: eligibleConstellationCode
      });
    }

    // Adapt visual to user's specific badges
    const adaptedVisual = adaptVisualToUserBadges(constellation.visual, badges);
    const narrationLines = generateNarrationLines(constellation, badges);

    // Check for active ceremony
    const { data: activeCeremony } = await supabase
      .from('badge_ceremonies')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'started')
      .maybeSingle();

    return NextResponse.json({
      eligible: true,
      constellation: {
        id: constellation.id,
        code: constellation.code,
        name: constellation.name,
        description: constellation.description,
        visual: adaptedVisual,
        narration_lines: narrationLines
      },
      user_badges: badges,
      evaluation: evaluation.details,
      active_ceremony: activeCeremony ? {
        id: activeCeremony.id,
        started_at: activeCeremony.started_at,
        status: activeCeremony.status
      } : null
    });

  } catch (error) {
    console.error('Constellation preview error:', error);
    return NextResponse.json({ error: 'Failed to preview constellation' }, { status: 500 });
  }
}