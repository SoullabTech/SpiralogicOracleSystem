import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

// Crisis Dashboard API - Real-time monitoring for therapists and admins

interface CrisisDashboardData {
  active_crises: ActiveCrisis[];
  alert_statistics: AlertStatistics;
  therapist_workload: TherapistWorkload[];
  recent_interventions: RecentIntervention[];
  system_health: SystemHealth;
}

interface ActiveCrisis {
  id: string;
  user_id: string;
  user_name?: string;
  risk_level: 'moderate' | 'high' | 'crisis';
  status: 'detected' | 'assigned' | 'acknowledged' | 'in_progress' | 'resolved';
  assigned_therapist?: {
    id: string;
    name: string;
    response_time_estimate: number;
  };
  trigger_time: string;
  last_contact?: string;
  escalation_level: 'standard' | 'urgent' | 'immediate';
  follow_up_tasks: {
    pending: number;
    completed: number;
    overdue: number;
  };
}

interface AlertStatistics {
  last_24h: {
    total_alerts: number;
    crisis_level: number;
    high_risk: number;
    moderate_risk: number;
    avg_response_time_minutes: number;
    successful_interventions: number;
  };
  last_7d: {
    total_alerts: number;
    crisis_level: number;
    high_risk: number;
    moderate_risk: number;
    avg_response_time_minutes: number;
    successful_interventions: number;
  };
  trends: {
    direction: 'increasing' | 'stable' | 'decreasing';
    percentage_change: number;
  };
}

interface TherapistWorkload {
  therapist_id: string;
  name: string;
  status: 'available' | 'busy' | 'off_duty' | 'emergency_only';
  current_cases: number;
  max_cases: number;
  avg_response_time: number;
  alerts_today: number;
  utilization_percentage: number;
  next_available?: string;
}

interface RecentIntervention {
  id: string;
  user_id: string;
  user_name?: string;
  therapist_name: string;
  intervention_type: 'crisis_alert' | 'high_risk_alert' | 'follow_up';
  outcome: 'successful' | 'escalated' | 'in_progress' | 'failed';
  duration_minutes?: number;
  notes?: string;
  timestamp: string;
}

interface SystemHealth {
  alert_system: {
    status: 'operational' | 'degraded' | 'down';
    email_delivery_rate: number;
    sms_delivery_rate: number;
    webhook_success_rate: number;
  };
  assessment_system: {
    status: 'operational' | 'degraded' | 'down';
    completion_rate: number;
    avg_response_time_ms: number;
  };
  database: {
    status: 'operational' | 'degraded' | 'down';
    query_time_ms: number;
    connection_pool_usage: number;
  };
  overall_health: 'healthy' | 'warning' | 'critical';
}

// GET /api/crisis-dashboard - Get dashboard data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get('therapist_id');
  const timeframe = searchParams.get('timeframe') || '24h';

  try {
    const dashboardData = await getCrisisDashboardData(therapistId, timeframe);
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching crisis dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crisis-dashboard - Update crisis status or take action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'acknowledge_crisis':
        return await acknowledgeCrisisFromDashboard(body.crisis_id, body.therapist_id);

      case 'escalate_crisis':
        return await escalateCrisis(body.crisis_id, body.escalation_type, body.notes);

      case 'resolve_crisis':
        return await resolveCrisis(body.crisis_id, body.resolution_notes);

      case 'update_therapist_status':
        return await updateTherapistStatus(body.therapist_id, body.status, body.next_available);

      case 'send_test_alert':
        return await sendTestAlert(body.therapist_id);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in crisis dashboard POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Implementation functions

async function getCrisisDashboardData(therapistId?: string, timeframe: string = '24h'): Promise<CrisisDashboardData> {
  // This would query your database for real-time data
  // For now, return mock data

  const activeCrises: ActiveCrisis[] = [
    {
      id: 'crisis_001',
      user_id: 'user_123',
      user_name: 'Anonymous User 123',
      risk_level: 'crisis',
      status: 'assigned',
      assigned_therapist: {
        id: 'therapist_001',
        name: 'Dr. Sarah Kim',
        response_time_estimate: 10
      },
      trigger_time: DateTime.now().minus({ minutes: 25 }).toISO(),
      escalation_level: 'immediate',
      follow_up_tasks: { pending: 4, completed: 1, overdue: 0 }
    },
    {
      id: 'crisis_002',
      user_id: 'user_456',
      user_name: 'Anonymous User 456',
      risk_level: 'high',
      status: 'in_progress',
      assigned_therapist: {
        id: 'therapist_002',
        name: 'Dr. Michael Rodriguez',
        response_time_estimate: 15
      },
      trigger_time: DateTime.now().minus({ hours: 2 }).toISO(),
      last_contact: DateTime.now().minus({ minutes: 30 }).toISO(),
      escalation_level: 'urgent',
      follow_up_tasks: { pending: 2, completed: 3, overdue: 1 }
    }
  ];

  const alertStatistics: AlertStatistics = {
    last_24h: {
      total_alerts: 12,
      crisis_level: 2,
      high_risk: 4,
      moderate_risk: 6,
      avg_response_time_minutes: 18,
      successful_interventions: 10
    },
    last_7d: {
      total_alerts: 67,
      crisis_level: 8,
      high_risk: 23,
      moderate_risk: 36,
      avg_response_time_minutes: 22,
      successful_interventions: 61
    },
    trends: {
      direction: 'stable',
      percentage_change: -5.2
    }
  };

  const therapistWorkload: TherapistWorkload[] = [
    {
      therapist_id: 'therapist_001',
      name: 'Dr. Sarah Kim',
      status: 'busy',
      current_cases: 3,
      max_cases: 5,
      avg_response_time: 15,
      alerts_today: 5,
      utilization_percentage: 60,
    },
    {
      therapist_id: 'therapist_002',
      name: 'Dr. Michael Rodriguez',
      status: 'available',
      current_cases: 1,
      max_cases: 3,
      avg_response_time: 22,
      alerts_today: 2,
      utilization_percentage: 33,
    }
  ];

  const recentInterventions: RecentIntervention[] = [
    {
      id: 'intervention_001',
      user_id: 'user_789',
      user_name: 'Anonymous User 789',
      therapist_name: 'Dr. Sarah Kim',
      intervention_type: 'crisis_alert',
      outcome: 'successful',
      duration_minutes: 45,
      notes: 'Crisis resolved through safety planning and family contact',
      timestamp: DateTime.now().minus({ hours: 1 }).toISO()
    },
    {
      id: 'intervention_002',
      user_id: 'user_321',
      user_name: 'Anonymous User 321',
      therapist_name: 'Dr. Michael Rodriguez',
      intervention_type: 'high_risk_alert',
      outcome: 'in_progress',
      notes: 'Initial contact made, follow-up scheduled',
      timestamp: DateTime.now().minus({ hours: 3 }).toISO()
    }
  ];

  const systemHealth: SystemHealth = {
    alert_system: {
      status: 'operational',
      email_delivery_rate: 98.5,
      sms_delivery_rate: 97.2,
      webhook_success_rate: 99.1
    },
    assessment_system: {
      status: 'operational',
      completion_rate: 89.3,
      avg_response_time_ms: 1200
    },
    database: {
      status: 'operational',
      query_time_ms: 85,
      connection_pool_usage: 42
    },
    overall_health: 'healthy'
  };

  // Filter by therapist if specified
  if (therapistId) {
    const filteredCrises = activeCrises.filter(c => c.assigned_therapist?.id === therapistId);
    const filteredWorkload = therapistWorkload.filter(w => w.therapist_id === therapistId);
    const filteredInterventions = recentInterventions.filter(i => i.therapist_name.includes(therapistId)); // This would be proper therapist ID matching

    return {
      active_crises: filteredCrises,
      alert_statistics,
      therapist_workload: filteredWorkload,
      recent_interventions: filteredInterventions,
      system_health
    };
  }

  return {
    active_crises: activeCrises,
    alert_statistics,
    therapist_workload,
    recent_interventions: recentInterventions,
    system_health
  };
}

async function acknowledgeCrisisFromDashboard(crisisId: string, therapistId: string): Promise<NextResponse> {
  // This would update the crisis status in database
  const acknowledgedAt = DateTime.now().toISO();

  console.log(`Crisis ${crisisId} acknowledged by therapist ${therapistId} via dashboard at ${acknowledgedAt}`);

  // Start follow-up protocol
  // This would trigger the FollowUpProtocolManager
  console.log(`Initiating follow-up protocol for crisis ${crisisId}`);

  return NextResponse.json({
    message: 'Crisis acknowledged successfully',
    crisis_id: crisisId,
    acknowledged_at: acknowledgedAt,
    follow_up_initiated: true
  });
}

async function escalateCrisis(
  crisisId: string,
  escalationType: 'emergency_services' | 'supervisor' | 'additional_therapist',
  notes?: string
): Promise<NextResponse> {
  // This would trigger escalation procedures
  console.log(`Escalating crisis ${crisisId} to ${escalationType}:`, notes);

  const escalationActions = {
    emergency_services: {
      action: 'Contact 911 and local emergency services',
      priority: 'immediate',
      follow_up: 'law_enforcement_wellness_check'
    },
    supervisor: {
      action: 'Alert clinical supervisor for guidance',
      priority: 'urgent',
      follow_up: 'supervisor_consultation'
    },
    additional_therapist: {
      action: 'Assign additional therapist for support',
      priority: 'urgent',
      follow_up: 'team_intervention'
    }
  };

  const escalation = escalationActions[escalationType];

  return NextResponse.json({
    message: 'Crisis escalated successfully',
    crisis_id: crisisId,
    escalation_type: escalationType,
    action_taken: escalation.action,
    priority: escalation.priority,
    follow_up_required: escalation.follow_up,
    escalated_at: DateTime.now().toISO()
  });
}

async function resolveCrisis(crisisId: string, resolutionNotes: string): Promise<NextResponse> {
  // This would update crisis status to resolved
  const resolvedAt = DateTime.now().toISO();

  console.log(`Crisis ${crisisId} resolved at ${resolvedAt}:`, resolutionNotes);

  // Schedule post-crisis follow-up assessments
  // This would integrate with the FollowUpProtocolManager

  return NextResponse.json({
    message: 'Crisis marked as resolved',
    crisis_id: crisisId,
    resolved_at: resolvedAt,
    post_crisis_followup_scheduled: true
  });
}

async function updateTherapistStatus(
  therapistId: string,
  status: 'available' | 'busy' | 'off_duty' | 'emergency_only',
  nextAvailable?: string
): Promise<NextResponse> {
  // This would update therapist availability in database
  console.log(`Therapist ${therapistId} status updated to ${status}`, { nextAvailable });

  return NextResponse.json({
    message: 'Therapist status updated',
    therapist_id: therapistId,
    status,
    next_available: nextAvailable,
    updated_at: DateTime.now().toISO()
  });
}

async function sendTestAlert(therapistId: string): Promise<NextResponse> {
  // This would trigger a test alert through the RealTimeAlertService
  console.log(`Sending test alert to therapist ${therapistId}`);

  // Mock test results
  const testResults = {
    email: { status: 'sent', delivery_time_ms: 850 },
    sms: { status: 'sent', delivery_time_ms: 1200 },
    webhook: { status: 'sent', delivery_time_ms: 420 }
  };

  return NextResponse.json({
    message: 'Test alert sent successfully',
    therapist_id: therapistId,
    test_results: testResults,
    sent_at: DateTime.now().toISO()
  });
}

// WebSocket endpoint for real-time updates (if using Socket.IO or similar)
export async function WEBSOCKET() {
  // This would handle WebSocket connections for real-time dashboard updates
  // Implementation would depend on your WebSocket library choice
  return new Response('WebSocket endpoint for real-time crisis dashboard updates', {
    status: 426,
    headers: { 'Upgrade': 'Required' }
  });
}