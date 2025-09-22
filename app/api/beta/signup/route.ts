import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

    // For now, we'll operate without a database
    // TODO: Add database persistence when available

    console.log('Beta signup successful (no database mode)');

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