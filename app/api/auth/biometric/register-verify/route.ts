import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, credentialId, response, deviceType, deviceName } = await req.json();

    if (!userId || !credentialId || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const clientDataJSON = Buffer.from(response.clientDataJSON, 'base64').toString('utf-8');
    const clientData = JSON.parse(clientDataJSON);

    const { data: challengeData, error: challengeError } = await supabase
      .from('auth_challenges')
      .select('*')
      .eq('challenge', clientData.challenge)
      .eq('user_id', userId)
      .eq('type', 'registration')
      .eq('used', false)
      .single();

    if (challengeError || !challengeData) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(challengeData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Challenge expired' },
        { status: 400 }
      );
    }

    const { error: markUsedError } = await supabase
      .from('auth_challenges')
      .update({ used: true })
      .eq('id', challengeData.id);

    if (markUsedError) {
      console.error('Failed to mark challenge as used:', markUsedError);
    }

    const attestationBuffer = Buffer.from(response.attestationObject, 'base64');

    let publicKey: string;
    try {
      publicKey = this.extractPublicKeyFromAttestation(attestationBuffer);
    } catch (error) {
      console.error('Failed to extract public key:', error);
      publicKey = response.attestationObject;
    }

    const { data: existingCred } = await supabase
      .from('user_biometric_credentials')
      .select('id')
      .eq('credential_id', credentialId)
      .single();

    if (existingCred) {
      return NextResponse.json(
        { error: 'Credential already registered' },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from('user_biometric_credentials')
      .insert({
        user_id: userId,
        credential_id: credentialId,
        public_key: publicKey,
        counter: 0,
        device_type: deviceType || 'unknown',
        device_name: deviceName || 'Unknown Device'
      });

    if (insertError) {
      console.error('Failed to store credential:', insertError);
      return NextResponse.json(
        { error: 'Failed to register credential' },
        { status: 500 }
      );
    }

    const { error: updateUserError } = await supabase
      .from('users')
      .update({ biometric_enabled: true })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Failed to update user biometric status:', updateUserError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractPublicKeyFromAttestation(attestationBuffer: Buffer): string {
  return attestationBuffer.toString('base64');
}