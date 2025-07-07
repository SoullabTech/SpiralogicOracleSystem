import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ElementalContentService } from '../../../../backend/src/core/elemental/ElementalContentService';
import { ContentDeliveryContext, ContentAdaptationSettings } from '../../../../backend/src/core/elemental/types';
import { getSupabaseConfig } from '../../../../lib/config/supabase';

const elementalService = new ElementalContentService();

export async function GET(request: NextRequest) {
  try {
    const supabaseConfig = getSupabaseConfig();
    
    if (!supabaseConfig.isConfigured) {
      return NextResponse.json(
        { error: 'Elemental content service not available in demo mode' },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and current state
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get user's recent bypassing patterns
    const { data: recentAlerts } = await supabase
      .from('spiritual_bypassing_alerts')
      .select('pattern')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Get unintegrated content
    const { data: unintegratedContent } = await supabase
      .from('integration_gates')
      .select('content_id')
      .eq('user_id', user.id)
      .eq('locked', true);

    // Get last content access
    const { data: lastAccess } = await supabase
      .from('user_content_access')
      .select('accessed_at')
      .eq('user_id', user.id)
      .order('accessed_at', { ascending: false })
      .limit(1)
      .single();

    // Build delivery context
    const context: ContentDeliveryContext = {
      userId: user.id,
      currentStage: profile.integration_stage,
      recentBypassingPatterns: recentAlerts?.map(alert => alert.pattern) || [],
      integrationCapacity: calculateIntegrationCapacity(profile),
      stressLevel: profile.stress_level || 5,
      energyLevel: profile.energy_level || 5,
      lastContentAccess: lastAccess?.accessed_at ? new Date(lastAccess.accessed_at) : new Date(0),
      unintegratedContent: unintegratedContent?.map(content => content.content_id) || []
    };

    // Get adaptation settings from query params
    const url = new URL(request.url);
    const settings: ContentAdaptationSettings = {
      emphasizeMetaphorical: url.searchParams.get('metaphorical') === 'true',
      includeDisclaimers: url.searchParams.get('disclaimers') !== 'false',
      requireCommunityValidation: url.searchParams.get('community') === 'true',
      enableCrossDomainIntegration: url.searchParams.get('crossDomain') === 'true',
      preventConsumptionBehavior: url.searchParams.get('preventConsumption') !== 'false',
      minimumIntegrationGaps: parseInt(url.searchParams.get('integrationGaps') || '3')
    };

    // Get content recommendations
    const recommendations = await elementalService.getContentRecommendations(context, settings);

    // Track the recommendation request
    await supabase
      .from('user_content_requests')
      .insert({
        user_id: user.id,
        request_type: 'elemental_recommendations',
        context: JSON.stringify(context),
        recommendations_count: recommendations.length,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      recommendations,
      context: {
        integrationCapacity: context.integrationCapacity,
        currentStage: context.currentStage,
        recentPatterns: context.recentBypassingPatterns.length,
        unintegratedCount: context.unintegratedContent.length
      },
      adaptationSettings: settings
    });

  } catch (error) {
    console.error('Elemental recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseConfig = getSupabaseConfig();
    
    if (!supabaseConfig.isConfigured) {
      return NextResponse.json(
        { error: 'Elemental content service not available in demo mode' },
        { status: 503 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentId, engagement } = await request.json();

    // Validate content access
    const content = await validateContentAccess(user.id, contentId, supabase);
    if (!content.allowed) {
      return NextResponse.json(
        { error: content.reason, gateInfo: content.gateInfo },
        { status: 423 } // Locked
      );
    }

    // Track content engagement
    await elementalService.trackContentEngagement(user.id, contentId, engagement);

    // Log access in database
    await supabase
      .from('user_content_access')
      .insert({
        user_id: user.id,
        content_id: contentId,
        access_type: 'elemental_content',
        engagement_duration: engagement.engagementDuration || 0,
        accessed_at: new Date().toISOString()
      });

    // Check if this starts an integration requirement
    if (engagement.integrationStarted) {
      await supabase
        .from('integration_requirements')
        .insert({
          user_id: user.id,
          content_id: contentId,
          requirement_type: 'content_integration',
          status: 'in_progress',
          started_at: new Date().toISOString(),
          due_date: new Date(Date.now() + (engagement.integrationPeriod || 14) * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Content engagement tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}

function calculateIntegrationCapacity(profile: any): number {
  // Calculate based on stress, energy, and current stage
  let capacity = 5; // Base capacity

  // Adjust for stress (high stress reduces capacity)
  capacity -= Math.max(0, (profile.stress_level - 5) * 0.5);

  // Adjust for energy (low energy reduces capacity)
  capacity -= Math.max(0, (5 - profile.energy_level) * 0.3);

  // Adjust for integration stage
  const stageCapacities = {
    'initial_insight': 6,
    'reflection_gap': 4,
    'reality_application': 7,
    'daily_integration': 8,
    'embodied_wisdom': 9,
    'spiral_revisit': 7
  };

  capacity = Math.max(capacity, stageCapacities[profile.integration_stage as keyof typeof stageCapacities] || 5);

  return Math.max(1, Math.min(10, Math.round(capacity)));
}

async function validateContentAccess(userId: string, contentId: string, supabase: any): Promise<{
  allowed: boolean;
  reason?: string;
  gateInfo?: any;
}> {
  // Check for active integration gates
  const { data: gate } = await supabase
    .from('integration_gates')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('locked', true)
    .single();

  if (gate) {
    return {
      allowed: false,
      reason: 'Content locked by integration gate',
      gateInfo: gate
    };
  }

  // Check pacing limits
  const { data: recentAccess } = await supabase
    .from('user_content_access')
    .select('accessed_at')
    .eq('user_id', userId)
    .gte('accessed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('accessed_at', { ascending: false });

  if (recentAccess && recentAccess.length > 3) {
    return {
      allowed: false,
      reason: 'Daily content limit reached - focus on integration'
    };
  }

  return { allowed: true };
}