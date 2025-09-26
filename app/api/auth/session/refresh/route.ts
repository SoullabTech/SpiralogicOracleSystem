import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const { userId, deviceId } = await req.json();

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const oldToken = authHeader.substring(7);

    const { data: session } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', oldToken)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('user_sessions')
      .update({
        session_token: newToken,
        last_active: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', session.id);

    if (error) {
      console.error('Failed to refresh session:', error);
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionToken: newToken });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}