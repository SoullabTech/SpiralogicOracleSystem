import { NextResponse } from 'next/server';

// Beta invitation codes - sacred portals
const VALID_INVITE_CODES = [
  // Beta Tester Codes - Soullab-[Name] format
  'SOULLAB-NATHAN',
  'SOULLAB-JASON',
  'SOULLAB-TRAVIS',
  'SOULLAB-ANDREA',
  'SOULLAB-JUSTIN',
  'SOULLAB-SUSAN',
  'SOULLAB-MEAGAN',
  'SOULLAB-PATRICK',
  'SOULLAB-AUGUSTEN',
  'SOULLAB-SOPHIE',
  'SOULLAB-TAMARA',
  'SOULLAB-LORALEE',
  'SOULLAB-ANDREAFAGAN',
  'SOULLAB-CECE',
  'SOULLAB-ZSUZSANNA',
  'SOULLAB-LEONARD',
  'SOULLAB-ANGELA',
  'SOULLAB-KRISTEN',
  'SOULLAB-CYNTHY',
  'SOULLAB-DOUG',
  'SOULLAB-RICK',
  'SOULLAB-NINA',
  'SOULLAB-JULIE',
  'SOULLAB-KIMBERLY',

  // Founder access
  'SOULLAB'
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
