import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, fingerprint, deviceName, deviceType, fullFingerprint } = await req.json();

    if (!userId || !fingerprint) {
      return NextResponse.json(
        { error: 'User ID and fingerprint are required' },
        { status: 400 }
      );
    }

    const { data: existingDevice } = await supabase
      .from('trusted_devices')
      .select('*')
      .eq('device_fingerprint', fingerprint)
      .eq('user_id', userId)
      .single();

    if (existingDevice) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from('trusted_devices')
        .update({
          trusted: true,
          last_seen: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', existingDevice.id);

      if (updateError) {
        console.error('Failed to update device:', updateError);
        return NextResponse.json(
          { error: 'Failed to trust device' },
          { status: 500 }
        );
      }

      return NextResponse.json({ deviceId: existingDevice.id });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: newDevice, error: insertError } = await supabase
      .from('trusted_devices')
      .insert({
        user_id: userId,
        device_fingerprint: fingerprint,
        device_name: deviceName || 'Unknown Device',
        device_type: deviceType || 'unknown',
        user_agent: fullFingerprint?.userAgent || req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        trusted: true,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError || !newDevice) {
      console.error('Failed to create device:', insertError);
      return NextResponse.json(
        { error: 'Failed to trust device' },
        { status: 500 }
      );
    }

    return NextResponse.json({ deviceId: newDevice.id });
  } catch (error) {
    console.error('Device trust error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}