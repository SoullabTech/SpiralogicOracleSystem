import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: devices, error } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('Failed to get devices:', error);
      return NextResponse.json(
        { error: 'Failed to get devices' },
        { status: 500 }
      );
    }

    return NextResponse.json({ devices: devices || [] });
  } catch (error) {
    console.error('Device list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}