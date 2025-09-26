import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, deviceId, fingerprint } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (deviceId) {
      const { data: device } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('id', deviceId)
        .eq('user_id', userId)
        .eq('trusted', true)
        .single();

      if (device) {
        const expiresAt = new Date(device.expires_at);
        if (expiresAt > new Date()) {
          await supabase
            .from('trusted_devices')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', deviceId);

          return NextResponse.json({ trusted: true, deviceId: device.id });
        }
      }
    }

    if (fingerprint) {
      const { data: device } = await supabase
        .from('trusted_devices')
        .select('*')
        .eq('device_fingerprint', fingerprint)
        .eq('user_id', userId)
        .eq('trusted', true)
        .single();

      if (device) {
        const expiresAt = new Date(device.expires_at);
        if (expiresAt > new Date()) {
          await supabase
            .from('trusted_devices')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', device.id);

          return NextResponse.json({ trusted: true, deviceId: device.id });
        }
      }
    }

    return NextResponse.json({ trusted: false });
  } catch (error) {
    console.error('Device check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}