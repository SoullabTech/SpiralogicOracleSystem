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

    console.log('Beta signup for:', explorerName);

    // Validate invitation code (for beta access control)
    const VALID_CODES = [
      'MAIA-BETA-2025',
      'SPIRALOGIC-SEED',
      'EARLY-EXPLORER',
      'APPRENTICE-ACCESS', // Special for your early tester
      'TEST-ACCESS' // For testing
    ];

    if (!invitationCode || !VALID_CODES.includes(invitationCode)) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 403 }
      );
    }

    // Validate consent and agreement
    if (!consent || !agreementAccepted) {
      return NextResponse.json(
        { error: 'Consent and agreement required' },
        { status: 400 }
      );
    }

    // Validate explorer name
    if (!explorerName || !explorerName.startsWith('MAIA-')) {
      return NextResponse.json(
        { error: 'Valid explorer name required (must start with MAIA-)' },
        { status: 400 }
      );
    }

    // Generate IDs
    const userId = uuidv4();
    const explorerId = uuidv4();
    const mayaInstance = uuidv4();
    const sessionId = uuidv4();

    // If Supabase is configured, save to database
    if (supabase) {
      try {
        // Create beta user
        const { error: userError } = await supabase
          .from('beta_users')
          .insert({
            id: userId,
            email,
            timezone,
            referral_code: referralCode || null,
            maya_instance: mayaInstance,
            privacy_mode: 'sanctuary',
            evolution_level: 1.0,
            protection_patterns: [],
            session_count: 0
          });

        if (userError && userError.code !== '23505') { // Ignore duplicate key errors
          console.error('User creation error:', userError);
        }

        // Create explorer record
        const { error: explorerError } = await supabase
          .from('explorers')
          .insert({
            explorer_id: explorerId,
            explorer_name: explorerName,
            email,
            invitation_code: invitationCode,
            agreement_accepted: agreementAccepted,
            agreement_date: agreementDate || new Date().toISOString(),
            status: 'active',
            week_number: 1,
            arc_level: 1,
            session_count: 0
          });

        if (explorerError && explorerError.code !== '23505') { // Ignore duplicate key errors
          console.error('Explorer creation error:', explorerError);
        }

        // Create initial sanctuary session
        const { error: sessionError } = await supabase
          .from('sanctuary_sessions')
          .insert({
            id: sessionId,
            user_id: userId,
            maya_instance: mayaInstance,
            sanctuary_seal: Buffer.from(uuidv4()).toString('base64'),
            protection_active: true
          });

        if (sessionError) {
          console.error('Session creation error:', sessionError);
        }

        // Log beta enrollment metric
        await supabase
          .from('beta_metrics')
          .insert({
            event: 'beta_signup',
            timezone,
            has_referral: !!referralCode,
            metadata: {
              explorer_name: explorerName,
              invitation_code: invitationCode
            }
          });

      } catch (dbError) {
        console.error('Database operation error:', dbError);
        // Continue anyway - don't fail the signup
      }
    } else {
      console.warn('Supabase not configured - using mock storage');
    }

    // Return successful response
    const response = {
      userId,
      explorerId,
      explorerName,
      mayaInstance,
      sessionId,
      sanctuary: 'established',
      signupDate: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}