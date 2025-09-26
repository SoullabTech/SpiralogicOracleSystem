import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, biometric_enabled')
      .eq('email', email)
      .single();

    if (!userData) {
      return NextResponse.json({ hasCredentials: false });
    }

    const { data: credentials } = await supabase
      .from('user_biometric_credentials')
      .select('id')
      .eq('user_id', userData.id)
      .limit(1);

    return NextResponse.json({
      hasCredentials: credentials && credentials.length > 0
    });
  } catch (error) {
    console.error('Check credentials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}