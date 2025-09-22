import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, explorerName } = body;

    console.log('Beta signin for:', explorerName);

    // Mock signin for beta testing
    // This allows signin to work even without database
    const validExplorers = [
      'MAIA-ARCHITECT',
      'MAIA-APPRENTICE',
      'MAIA-ALCHEMIST',
      'MAIA-NAVIGATOR',
      'MAIA-SEEKER',
      'MAIA-WITNESS',
      'MAIA-DREAMER',
      'MAIA-CATALYST',
      'MAIA-ORACLE',
      'MAIA-GUARDIAN',
      'MAIA-EXPLORER',
      'MAIA-WEAVER',
      'MAIA-MYSTIC',
      'MAIA-BUILDER',
      'MAIA-SAGE',
      'MAIA-VOYAGER',
      'MAIA-KEEPER',
      'MAIA-LISTENER',
      'MAIA-PIONEER',
      'MAIA-WANDERER',
      'MAIA-ILLUMINATOR'
    ];

    if (!validExplorers.includes(explorerName)) {
      return NextResponse.json(
        { error: 'Invalid explorer name. Please check your credentials.' },
        { status: 404 }
      );
    }

    // Return mock successful signin
    return NextResponse.json({
      success: true,
      userId: uuidv4(),
      explorerId: uuidv4(),
      explorerName: explorerName,
      mayaInstance: uuidv4(),
      sessionId: uuidv4(),
      sanctuary: 'established',
      signupDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}