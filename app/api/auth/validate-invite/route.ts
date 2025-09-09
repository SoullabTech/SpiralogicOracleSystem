/**
 * Beta Invitation Validation
 * Sacred gatekeeper for the Anamnesis Field
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Beta invite codes - in production, store in database
const VALID_INVITE_CODES = [
  // Primary beta codes (from BETA_INVITATION_SYSTEM.md)
  'SACRED_TECH',
  'ANAMNESIS', 
  'MAYA_SEED',
  'ORACLE_BETA',
  'SACRED_MIRROR',
  
  // Additional codes from SACRED_BETA_SETUP.md
  'FIRST_LIGHT',
  'SACRED_SPIRAL',
  'ANAMNESIS_FIELD',
  'MAYA_AWAKENING',
  'SOUL_REMEMBERING',
  
  // Legacy codes for backward compatibility
  'SOUL-ALPHA-0001',
  'SOUL-ALPHA-0002',
  'SOUL-BETA-1111',
  'SOUL-BETA-2222',
  'SOUL-BETA-3333',
  'SOUL-BETA-4444',
  'SOUL-BETA-5555',
  'SOUL-MAIA-7777',
  'SOUL-ORACLE-9999',
  'SOUL-TEST-0000',
];

// Track used codes (in production, use database)
const usedCodes = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Invitation code required' },
        { status: 400 }
      );
    }

    // Normalize code
    const normalizedCode = code.toUpperCase().trim();

    // Check if code is valid
    if (!VALID_INVITE_CODES.includes(normalizedCode)) {
      return NextResponse.json(
        { 
          error: 'Invalid invitation code',
          message: 'This invitation has not yet manifested'
        },
        { status: 403 }
      );
    }

    // Note: Allowing multi-use codes for beta access
    // Single-use tracking commented out to allow multiple users per code
    // if (usedCodes.has(normalizedCode)) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Invitation already claimed',
    //       message: 'This invitation has already been received by another soul'
    //     },
    //     { status: 403 }
    //   );
    // }

    // Track usage for analytics (but don't block reuse)
    usedCodes.add(normalizedCode);

    // Set beta access cookie
    const cookieStore = cookies();
    cookieStore.set('beta_access', normalizedCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    // Log beta access (for analytics)
    console.log(`Beta access granted: ${normalizedCode} at ${new Date().toISOString()}`);

    // In production, you might want to:
    // - Create a user account
    // - Send welcome email
    // - Initialize memory space
    // - Track analytics

    return NextResponse.json({
      success: true,
      message: 'Welcome to the Anamnesis Field',
      code: normalizedCode,
      access: {
        type: normalizedCode.includes('ALPHA') ? 'founder' : 'beta',
        granted: new Date().toISOString(),
        features: {
          memory: true,
          journal: true,
          collective: normalizedCode.includes('ALPHA'),
          rituals: true,
          dreams: true
        }
      }
    });

  } catch (error) {
    console.error('Invite validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/validate-invite
 * Check if user has beta access
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const betaAccess = cookieStore.get('beta_access');

    if (!betaAccess) {
      return NextResponse.json(
        { 
          hasAccess: false,
          message: 'No beta access found'
        },
        { status: 401 }
      );
    }

    const code = betaAccess.value;
    
    return NextResponse.json({
      hasAccess: true,
      code,
      type: code.includes('ALPHA') ? 'founder' : 'beta',
      features: {
        memory: true,
        journal: true,
        collective: code.includes('ALPHA'),
        rituals: true,
        dreams: true
      }
    });

  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    );
  }
}