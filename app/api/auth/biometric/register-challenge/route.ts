import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, userEmail } = await req.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const { error: insertError } = await supabase
      .from('auth_challenges')
      .insert({
        user_id: userId,
        email: userEmail,
        challenge,
        type: 'registration',
        used: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });

    if (insertError) {
      console.error('Failed to store challenge:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate challenge' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      challenge,
      user: {
        id: userId,
        name: userName || userEmail.split('@')[0],
        email: userEmail
      }
    });
  } catch (error) {
    console.error('Register challenge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}