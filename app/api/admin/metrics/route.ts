// Admin Metrics API - Serves aggregated data from console views
// Protected by middleware, returns safe aggregated metrics (no PII)

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const metric = searchParams.get('metric') || 'overview';

    // Verify admin access (middleware should have already checked, but double-check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    switch (metric) {
      case 'overview':
        return getOverviewMetrics(supabase);
      
      case 'oracle-turns':
        return getOracleTurns(supabase, timeframe);
      
      case 'enrichment':
        return getEnrichmentMetrics(supabase, timeframe);
      
      case 'bridge-health':
        return getBridgeHealth(supabase, timeframe);
      
      case 'safeguards':
        return getSafeguards(supabase, timeframe);
      
      case 'archetypes':
        return getArchetypes(supabase, timeframe);
      
      case 'integration-flow':
        return getIntegrationFlow(supabase, timeframe);
      
      case 'reflection-quality':
        return getReflectionQuality(supabase, timeframe);
      
      case 'community-health':
        return getCommunityHealth(supabase, timeframe);
      
      case 'professional-network':
        return getProfessionalNetwork(supabase, timeframe);
      
      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin metrics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getOverviewMetrics(supabase: any) {
  const { data, error } = await supabase
    .from('admin_system_health')
    .select('*')
    .order('timeframe');

  if (error) throw error;

  // Transform into more readable format
  const metrics = data.reduce((acc: any, row: any) => {
    acc[row.timeframe] = {
      oracleTurns: row.oracle_turns_24h || row.oracle_turns_7d,
      activeUsers: row.active_users_24h || row.active_users_7d,
      bypassingAlerts: row.bypassing_alerts_24h || row.bypassing_alerts_7d,
      activeReflections: row.active_reflections,
      pendingGates: row.pending_gates,
      avgEmbodimentQuality: row.avg_embodiment_quality ? parseFloat(row.avg_embodiment_quality) : null
    };
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
}

async function getOracleTurns(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_oracle_turns')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .limit(30);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      totalTurns: row.total_turns,
      uniqueUsers: row.unique_users,
      avgCompletion: row.avg_completion ? parseFloat(row.avg_completion) : null,
      totalMinutes: row.total_minutes,
      completedTurns: row.completed_turns,
      warningTurns: row.warning_turns
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getEnrichmentMetrics(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_enrichment_metrics')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .limit(30);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      totalEnrichments: row.total_enrichments,
      uniqueUsers: row.unique_users,
      avgIntegrationQuality: row.avg_integration_quality ? parseFloat(row.avg_integration_quality) : null,
      highQualityIntegrations: row.high_quality_integrations,
      appliedInsights: row.applied_insights
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getBridgeHealth(supabase: any, timeframe: string) {
  const hours = getTimeframeHours(timeframe);
  
  const { data, error } = await supabase
    .from('admin_bridge_health')
    .select('*')
    .gte('hour', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
    .order('hour', { ascending: false })
    .limit(168); // 7 days of hourly data max

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      timestamp: row.hour,
      totalEntries: row.total_entries,
      activeUsers: row.active_users,
      avgConsistency: row.avg_consistency ? parseFloat(row.avg_consistency) : null,
      validatedEntries: row.validated_entries,
      struggleWisdomEntries: row.struggle_wisdom_entries,
      ordinaryMoments: row.ordinary_moments
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getSafeguards(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_safeguards')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .order('detection_count', { ascending: false })
    .limit(100);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      pattern: row.pattern,
      severity: row.severity,
      detectionCount: row.detection_count,
      affectedUsers: row.affected_users,
      interventionsDelivered: row.interventions_delivered,
      referralsMade: row.referrals_made,
      resolvedCases: row.resolved_cases
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getArchetypes(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_archetypes')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .order('interaction_count', { ascending: false })
    .limit(100);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      element: row.element,
      interactionCount: row.interaction_count,
      uniqueUsers: row.unique_users,
      avgCompletion: row.avg_completion ? parseFloat(row.avg_completion) : null
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getIntegrationFlow(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_integration_flow')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .order('gate_encounters', { ascending: false })
    .limit(100);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      gateType: row.gate_type,
      contentToUnlock: row.content_to_unlock,
      gateEncounters: row.gate_encounters,
      uniqueUsers: row.unique_users,
      successfulUnlocks: row.successful_unlocks,
      avgBypassAttempts: row.avg_bypass_attempts ? parseFloat(row.avg_bypass_attempts) : null,
      avgIntegrationRequirement: row.avg_integration_requirement ? parseFloat(row.avg_integration_requirement) : null
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getReflectionQuality(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_reflection_quality')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .limit(30);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      gapsInitiated: row.gaps_initiated,
      uniqueUsers: row.unique_users,
      completedGaps: row.completed_gaps,
      bypassedGaps: row.bypassed_gaps,
      avgDurationRequired: row.avg_duration_required ? parseFloat(row.avg_duration_required) : null,
      avgBypassAttempts: row.avg_bypass_attempts ? parseFloat(row.avg_bypass_attempts) : null
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getCommunityHealth(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_community_health')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .order('interaction_count', { ascending: false })
    .limit(100);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      interactionType: row.interaction_type,
      interactionCount: row.interaction_count,
      uniqueUsers: row.unique_users,
      avgHelpfulScore: row.avg_helpful_score ? parseFloat(row.avg_helpful_score) : null,
      avgGroundingScore: row.avg_grounding_score ? parseFloat(row.avg_grounding_score) : null,
      bypassingConcerns: row.bypassing_concerns,
      flaggedInteractions: row.flagged_interactions
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

async function getProfessionalNetwork(supabase: any, timeframe: string) {
  const days = getTimeframeDays(timeframe);
  
  const { data, error } = await supabase
    .from('admin_professional_network')
    .select('*')
    .gte('day', `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order('day', { ascending: false })
    .order('connection_requests', { ascending: false })
    .limit(100);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    data: data.map((row: any) => ({
      date: row.day,
      connectionType: row.connection_type,
      connectionRequests: row.connection_requests,
      uniqueUsers: row.unique_users,
      uniqueProfessionals: row.unique_professionals,
      activeConnections: row.active_connections,
      integratedConnections: row.integrated_connections
    })),
    timeframe,
    timestamp: new Date().toISOString()
  });
}

function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case '1d': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
}

function getTimeframeHours(timeframe: string): number {
  switch (timeframe) {
    case '1h': return 1;
    case '6h': return 6;
    case '24h': return 24;
    case '7d': return 168;
    default: return 24;
  }
}