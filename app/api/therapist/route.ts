import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';

// Therapist Management & Crisis Escalation API

interface TherapistProfile {
  id: string;
  name: string;
  credentials: string;
  email: string;
  phone?: string;
  specializations: string[];
  preferred_alert_method: 'email' | 'sms' | 'both' | 'webhook';
  emergency_only: boolean;
  timezone: string;
  on_call_hours?: {
    start: string;
    end: string;
    days: number[];
  };

  // Assignment settings
  max_crisis_load: number; // Max concurrent crisis cases
  current_crisis_load: number;
  accepts_new_assignments: boolean;

  // Availability
  status: 'available' | 'busy' | 'off_duty' | 'emergency_only';
  next_available?: string;

  // Performance metrics
  avg_response_time_minutes: number;
  crisis_interventions_count: number;
  satisfaction_rating: number;

  created_at: string;
  updated_at: string;
}

interface CrisisAssignment {
  id: string;
  user_id: string;
  therapist_id: string;
  crisis_intervention_id: string;
  assigned_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  status: 'assigned' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated';
  priority: 'moderate' | 'high' | 'crisis';
  notes?: string;
}

// GET /api/therapist - List all therapists or get specific therapist
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get('id');
  const onCallOnly = searchParams.get('on_call') === 'true';
  const availableOnly = searchParams.get('available') === 'true';

  try {
    if (therapistId) {
      // Get specific therapist
      const therapist = await getTherapistById(therapistId);
      if (!therapist) {
        return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
      }
      return NextResponse.json({ therapist });
    }

    // List therapists with filters
    let therapists = await getAllTherapists();

    if (onCallOnly) {
      therapists = therapists.filter(isTherapistOnCall);
    }

    if (availableOnly) {
      therapists = therapists.filter(t =>
        t.status === 'available' &&
        t.current_crisis_load < t.max_crisis_load &&
        t.accepts_new_assignments
      );
    }

    return NextResponse.json({ therapists });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/therapist - Create new therapist or assign crisis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'create_therapist':
        return await createTherapist(body.therapist);

      case 'assign_crisis':
        return await assignCrisis(body.user_id, body.crisis_intervention_id, body.priority);

      case 'acknowledge_crisis':
        return await acknowledgeCrisis(body.assignment_id, body.therapist_id);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in therapist POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/therapist - Update therapist profile or assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'update_profile':
        return await updateTherapistProfile(body.therapist_id, body.updates);

      case 'update_availability':
        return await updateTherapistAvailability(body.therapist_id, body.status, body.next_available);

      case 'update_assignment':
        return await updateCrisisAssignment(body.assignment_id, body.updates);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in therapist PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Implementation functions (these would connect to your database)

async function getAllTherapists(): Promise<TherapistProfile[]> {
  // This would query your Supabase database
  // For now, return mock data
  return [
    {
      id: 'therapist_001',
      name: 'Dr. Sarah Kim',
      credentials: 'PhD, LCSW',
      email: 'dr.kim@maiatherapy.com',
      phone: '+1-555-0101',
      specializations: ['Crisis Intervention', 'Trauma', 'Depression'],
      preferred_alert_method: 'both',
      emergency_only: false,
      timezone: 'America/New_York',
      on_call_hours: {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5] // Mon-Fri
      },
      max_crisis_load: 5,
      current_crisis_load: 2,
      accepts_new_assignments: true,
      status: 'available',
      avg_response_time_minutes: 15,
      crisis_interventions_count: 47,
      satisfaction_rating: 4.8,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-22T10:30:00Z'
    },
    {
      id: 'therapist_002',
      name: 'Dr. Michael Rodriguez',
      credentials: 'MD, Psychiatrist',
      email: 'dr.rodriguez@maiatherapy.com',
      phone: '+1-555-0102',
      specializations: ['Crisis Intervention', 'Anxiety', 'Medication Management'],
      preferred_alert_method: 'email',
      emergency_only: true, // Only for critical cases
      timezone: 'America/Los_Angeles',
      max_crisis_load: 3,
      current_crisis_load: 1,
      accepts_new_assignments: true,
      status: 'available',
      avg_response_time_minutes: 22,
      crisis_interventions_count: 31,
      satisfaction_rating: 4.9,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-22T09:15:00Z'
    }
  ];
}

async function getTherapistById(therapistId: string): Promise<TherapistProfile | null> {
  const therapists = await getAllTherapists();
  return therapists.find(t => t.id === therapistId) || null;
}

async function createTherapist(therapistData: Partial<TherapistProfile>): Promise<NextResponse> {
  // Validate required fields
  const required = ['name', 'credentials', 'email', 'specializations', 'timezone'];
  for (const field of required) {
    if (!therapistData[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const newTherapist: TherapistProfile = {
    id: `therapist_${Date.now()}`,
    name: therapistData.name!,
    credentials: therapistData.credentials!,
    email: therapistData.email!,
    phone: therapistData.phone,
    specializations: therapistData.specializations!,
    preferred_alert_method: therapistData.preferred_alert_method || 'email',
    emergency_only: therapistData.emergency_only || false,
    timezone: therapistData.timezone!,
    on_call_hours: therapistData.on_call_hours,
    max_crisis_load: therapistData.max_crisis_load || 3,
    current_crisis_load: 0,
    accepts_new_assignments: true,
    status: 'available',
    avg_response_time_minutes: 0,
    crisis_interventions_count: 0,
    satisfaction_rating: 0,
    created_at: DateTime.now().toISO(),
    updated_at: DateTime.now().toISO()
  };

  // This would save to database
  console.log('Creating therapist:', newTherapist);

  return NextResponse.json({
    message: 'Therapist created successfully',
    therapist: newTherapist
  }, { status: 201 });
}

async function assignCrisis(
  userId: string,
  crisisInterventionId: string,
  priority: 'moderate' | 'high' | 'crisis'
): Promise<NextResponse> {
  // Find best available therapist
  const availableTherapists = (await getAllTherapists()).filter(t =>
    t.status === 'available' &&
    t.current_crisis_load < t.max_crisis_load &&
    t.accepts_new_assignments &&
    (priority === 'crisis' || !t.emergency_only) // Emergency-only therapists only for crisis
  );

  if (availableTherapists.length === 0) {
    return NextResponse.json({
      error: 'No available therapists',
      escalation_required: true,
      suggested_action: 'contact_emergency_services'
    }, { status: 503 });
  }

  // Select therapist based on:
  // 1. Lowest current load
  // 2. Fastest response time
  // 3. Specialization match
  const selectedTherapist = selectBestTherapist(availableTherapists, priority);

  const assignment: CrisisAssignment = {
    id: `assignment_${Date.now()}`,
    user_id: userId,
    therapist_id: selectedTherapist.id,
    crisis_intervention_id: crisisInterventionId,
    assigned_at: DateTime.now().toISO(),
    status: 'assigned',
    priority: priority
  };

  // Update therapist's current load
  selectedTherapist.current_crisis_load++;

  // This would save to database
  console.log('Crisis assigned:', assignment);

  return NextResponse.json({
    message: 'Crisis successfully assigned to therapist',
    assignment,
    therapist: {
      id: selectedTherapist.id,
      name: selectedTherapist.name,
      expected_response_time: selectedTherapist.avg_response_time_minutes
    }
  });
}

async function acknowledgeCrisis(assignmentId: string, therapistId: string): Promise<NextResponse> {
  // This would update the assignment in database
  const now = DateTime.now().toISO();

  console.log(`Crisis assignment ${assignmentId} acknowledged by therapist ${therapistId} at ${now}`);

  return NextResponse.json({
    message: 'Crisis acknowledgment recorded',
    acknowledged_at: now
  });
}

async function updateTherapistProfile(
  therapistId: string,
  updates: Partial<TherapistProfile>
): Promise<NextResponse> {
  // Validate therapist exists
  const therapist = await getTherapistById(therapistId);
  if (!therapist) {
    return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
  }

  // Apply updates
  const updatedTherapist = {
    ...therapist,
    ...updates,
    updated_at: DateTime.now().toISO()
  };

  // This would save to database
  console.log('Therapist profile updated:', updatedTherapist);

  return NextResponse.json({
    message: 'Therapist profile updated successfully',
    therapist: updatedTherapist
  });
}

async function updateTherapistAvailability(
  therapistId: string,
  status: TherapistProfile['status'],
  nextAvailable?: string
): Promise<NextResponse> {
  const therapist = await getTherapistById(therapistId);
  if (!therapist) {
    return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
  }

  therapist.status = status;
  if (nextAvailable) {
    therapist.next_available = nextAvailable;
  }
  therapist.updated_at = DateTime.now().toISO();

  // This would save to database
  console.log(`Therapist ${therapistId} availability updated: ${status}`);

  return NextResponse.json({
    message: 'Availability updated successfully',
    status: status,
    next_available: nextAvailable
  });
}

async function updateCrisisAssignment(
  assignmentId: string,
  updates: Partial<CrisisAssignment>
): Promise<NextResponse> {
  // This would update the assignment in database
  console.log(`Crisis assignment ${assignmentId} updated:`, updates);

  return NextResponse.json({
    message: 'Crisis assignment updated successfully',
    updates
  });
}

// Utility functions

function isTherapistOnCall(therapist: TherapistProfile): boolean {
  if (!therapist.on_call_hours) return true; // Always available if no schedule set

  const now = DateTime.now().setZone(therapist.timezone);
  const currentDay = now.weekday; // 1 = Monday, 7 = Sunday
  const currentTime = now.toFormat('HH:mm');

  const { start, end, days } = therapist.on_call_hours;

  return (
    days.includes(currentDay) &&
    currentTime >= start &&
    currentTime <= end
  );
}

function selectBestTherapist(
  availableTherapists: TherapistProfile[],
  priority: 'moderate' | 'high' | 'crisis'
): TherapistProfile {
  // For crisis priority, prefer fastest response time
  if (priority === 'crisis') {
    return availableTherapists.reduce((best, current) =>
      current.avg_response_time_minutes < best.avg_response_time_minutes ? current : best
    );
  }

  // For other priorities, balance load and response time
  return availableTherapists.reduce((best, current) => {
    const bestScore = calculateTherapistScore(best);
    const currentScore = calculateTherapistScore(current);
    return currentScore > bestScore ? current : best;
  });
}

function calculateTherapistScore(therapist: TherapistProfile): number {
  // Higher score = better choice
  const loadScore = (therapist.max_crisis_load - therapist.current_crisis_load) / therapist.max_crisis_load;
  const responseScore = Math.max(0, (60 - therapist.avg_response_time_minutes) / 60); // Normalize to 0-1
  const satisfactionScore = therapist.satisfaction_rating / 5;

  return (loadScore * 0.4) + (responseScore * 0.4) + (satisfactionScore * 0.2);
}