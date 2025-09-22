import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '@/lib/supabase-server';

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

    // Try to save to Supabase if available
    const supabase = await getSupabaseClient();

    if (supabase) {
      try {
        // Check if explorer already exists
        const { data: existingExplorer } = await supabase
          .from('explorers')
          .select('*')
          .eq('explorer_name', explorerName)
          .single();

        if (existingExplorer) {
          // Explorer already exists, return their info
          console.log('Explorer already exists:', explorerName);

          return NextResponse.json({
            success: true,
            userId: existingExplorer.explorer_id,
            explorerId: existingExplorer.explorer_id,
            explorerName: existingExplorer.explorer_name,
            mayaInstance: uuidv4(),
            sessionId: uuidv4(),
            sanctuary: 'established',
            signupDate: existingExplorer.signup_date || new Date().toISOString()
          });
        }

        // Create new explorer record
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

        if (explorerError) {
          console.error('Explorer creation error:', explorerError);
          throw explorerError;
        }

        // Try to create beta user record (optional)
        await supabase
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
          })
          .catch((err: any) => console.log('Beta user creation skipped:', err));

        // Try to create sanctuary session (optional)
        await supabase
          .from('sanctuary_sessions')
          .insert({
            id: sessionId,
            user_id: userId,
            maya_instance: mayaInstance,
            sanctuary_seal: Buffer.from(uuidv4()).toString('base64'),
            protection_active: true
          })
          .catch((err: any) => console.log('Sanctuary session creation skipped:', err));

        // Try to log metrics (optional)
        await supabase
          .from('beta_metrics')
          .insert({
            event: 'beta_signup',
            timezone,
            has_referral: !!referralCode,
            metadata: {
              explorer_name: explorerName
            }
          })
          .catch((err: any) => console.log('Metrics logging skipped:', err));

        console.log('Saved to Supabase successfully');
      } catch (dbError) {
        console.log('Supabase operations failed, continuing without database:', dbError);
      }
    } else {
      console.log('Supabase not available - using local storage mode');
    }

    // Always return successful response
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

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}