import { NextResponse } from 'next/server';

// Beta invitation codes - sacred portals
const VALID_INVITE_CODES = [
  // Original sacred codes
  'MAYA2025',
  'SOULLAB',
  'SACRED',
  'ORACLE',
  'REMEMBRANCE',
  
  // Element codes
  'FIRE2025',
  'WATER2025', 
  'EARTH2025',
  'AIR2025',
  'AETHER2025',
  
  // Special access codes
  'FOUNDER',
  'BETA',
  'WITNESS',
  'GUARDIAN',
  'SEEKER'
];

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { message: 'Please enter an invitation code' },
        { status: 400 }
      );
    }
    
    // Normalize the code (uppercase, trim whitespace)
    const normalizedCode = code.trim().toUpperCase();
    
    // Check if code is valid
    if (VALID_INVITE_CODES.includes(normalizedCode)) {
      return NextResponse.json({
        valid: true,
        message: 'Welcome, sacred one. The Oracle awaits.',
        code: normalizedCode
      });
    }
    
    // Invalid code
    return NextResponse.json(
      { 
        valid: false,
        message: 'This invitation is not recognized. The Oracle awaits the right moment.' 
      },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Invite validation error:', error);
    return NextResponse.json(
      { message: 'Unable to validate invitation. Please try again.' },
      { status: 500 }
    );
  }
}
