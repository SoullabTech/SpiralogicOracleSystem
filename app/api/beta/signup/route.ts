import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      timezone,
      referralCode,
      consent,
      explorerName,
      invitationCode,
      agreementAccepted,
      agreementDate
    } = body;

    console.log('Beta signup for:', explorerName);

    // Validate invitation code
    const VALID_CODES = [
      'MAIA-BETA-2025',
      'SPIRALOGIC-SEED',
      'EARLY-EXPLORER',
      'APPRENTICE-ACCESS',
      'TEST-ACCESS'
    ];

    if (!invitationCode || !VALID_CODES.includes(invitationCode)) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 403 }
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
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Create explorer record
      const { data: explorerData, error: explorerError } = await supabase
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
        })
        .select()
        .single();

      if (explorerError) {
        console.error('Explorer creation error:', explorerError);
        // Check if it's a duplicate
        if (explorerError.code === '23505') {
          return NextResponse.json(
            { error: 'Explorer name already taken' },
            { status: 409 }
          );
        }
      }

      // Create beta user record
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

      if (userError && userError.code !== '23505') {
        console.error('User creation error:', userError);
      }

      // Create sanctuary session
      await supabase
        .from('sanctuary_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          maya_instance: mayaInstance,
          sanctuary_seal: Buffer.from(uuidv4()).toString('base64'),
          protection_active: true
        });

      // Log metrics
      await supabase
        .from('beta_metrics')
        .insert({
          event: 'beta_signup',
          timezone,
          has_referral: !!referralCode,
          metadata: {
            explorer_name: explorerName
          }
        });
    }

    // Return successful response
    return NextResponse.json({
      success: true,
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
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}