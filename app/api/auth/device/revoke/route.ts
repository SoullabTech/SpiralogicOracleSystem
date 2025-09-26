import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from('trusted_devices')
      .update({ trusted: false })
      .eq('id', deviceId);

    if (updateError) {
      console.error('Failed to revoke device:', updateError);
      return NextResponse.json(
        { error: 'Failed to revoke device' },
        { status: 500 }
      );
    }

    const { error: deleteSessionsError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('device_id', deviceId);

    if (deleteSessionsError) {
      console.error('Failed to delete sessions:', deleteSessionsError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Device revoke error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}