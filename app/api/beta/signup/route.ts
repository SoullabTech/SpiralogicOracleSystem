import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client conditionally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured - using mock response for beta testing');
      // Return mock successful response for testing
      const mockResponse = {
        userId: uuidv4(),
        explorerId: uuidv4(),
        explorerName: 'MAYA-TESTER',
        mayaInstance: uuidv4(),
        sessionId: uuidv4(),
        sanctuary: 'established',
        signupDate: new Date().toISOString()
      };
      return NextResponse.json(mockResponse);
    }

    const {
      email,
      timezone,
      referralCode,
      consent,
      explorerName,
      invitationCode,
      agreementAccepted,
      agreementDate
    } = await request.json();

    // Validate consent and agreement
    if (!consent || !agreementAccepted) {
      return NextResponse.json(
        { error: 'Consent and agreement required' },
        { status: 400 }
      );
    }

    // Validate explorer name
    if (!explorerName || !explorerName.startsWith('MAYA-')) {
      return NextResponse.json(
        { error: 'Valid explorer name required' },
        { status: 400 }
      );
    }

    // Validate invitation code (for beta access control)
    const VALID_CODES = [
      'MAYA-BETA-2025',
      'SPIRALOGIC-SEED',
      'EARLY-EXPLORER',
      'TEST-ACCESS' // For testing
    ];

    if (!invitationCode || !VALID_CODES.includes(invitationCode)) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 403 }
      );
    }

    // Check for existing user
    const { data: existingUser } = await supabase
      .from('beta_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check for duplicate explorer name
    const { data: existingExplorer } = await supabase
      .from('explorers')
      .select('explorer_id')
      .eq('explorer_name', explorerName)
      .single();

    if (existingExplorer) {
      return NextResponse.json(
        { error: 'Explorer name already taken' },
        { status: 409 }
      );
    }

    // Create unique Maya instance
    const userId = uuidv4();
    const mayaInstance = uuidv4();
    const explorerId = uuidv4();

    // Store user in database
    const { error: insertError } = await supabase
      .from('beta_users')
      .insert({
        id: userId,
        email,
        timezone,
        referral_code: referralCode || null,
        maya_instance: mayaInstance,
        privacy_mode: 'sanctuary',
        created_at: new Date().toISOString(),
        consent_date: new Date().toISOString(),
        evolution_level: 1.0,
        protection_patterns: [],
        session_count: 0
      });

    // Create explorer record
    const { error: explorerError } = await supabase
      .from('explorers')
      .insert({
        explorer_id: explorerId,
        explorer_name: explorerName,
        email,
        invitation_code: invitationCode,
        agreement_accepted: agreementAccepted,
        agreement_date: agreementDate,
        signup_date: new Date().toISOString(),
        status: 'active',
        week_number: 1,
        arc_level: 1,
        session_count: 0
      });

    if (insertError || explorerError) {
      console.error('Database error:', insertError || explorerError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create initial sanctuary session
    const sessionId = uuidv4();
    await supabase
      .from('sanctuary_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        maya_instance: mayaInstance,
        opened_at: new Date().toISOString(),
        sanctuary_seal: generateSanctuarySeal(),
        protection_active: true
      });

    // Log beta enrollment (anonymized)
    await supabase
      .from('beta_metrics')
      .insert({
        event: 'beta_signup',
        timestamp: new Date().toISOString(),
        timezone,
        has_referral: !!referralCode,
        // No email or identifying info logged
      });

    return NextResponse.json({
      userId,
      explorerId,
      explorerName,
      mayaInstance,
      sessionId,
      sanctuary: 'established',
      signupDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

function generateSanctuarySeal(): string {
  // Create cryptographic boundary for session
  return Buffer.from(uuidv4()).toString('base64');
}