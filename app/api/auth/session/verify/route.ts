import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const { userId } = await req.json();

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', token)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, biometric_enabled')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      session: {
        userId: session.user_id,
        email: user?.email,
        name: user?.name,
        sessionToken: session.session_token,
        deviceId: session.device_id,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        lastActive: session.last_active,
        biometricEnabled: user?.biometric_enabled || false
      }
    });
  } catch (error) {
    console.error('Session verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}