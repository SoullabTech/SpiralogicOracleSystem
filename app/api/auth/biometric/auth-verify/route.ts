import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { credentialId, response } = await req.json();

    if (!credentialId || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: credential, error: credError } = await supabase
      .from('user_biometric_credentials')
      .select('*')
      .eq('credential_id', credentialId)
      .single();

    if (credError || !credential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    const clientDataJSON = Buffer.from(response.clientDataJSON, 'base64').toString('utf-8');
    const clientData = JSON.parse(clientDataJSON);

    const { data: challengeData, error: challengeError } = await supabase
      .from('auth_challenges')
      .select('*')
      .eq('challenge', clientData.challenge)
      .eq('type', 'authentication')
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

    const { error: updateCredError } = await supabase
      .from('user_biometric_credentials')
      .update({
        counter: credential.counter + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', credential.id);

    if (updateCredError) {
      console.error('Failed to update credential:', updateCredError);
    }

    const sessionToken = crypto.randomUUID();

    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: credential.user_id,
        session_token: sessionToken,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userId: credential.user_id,
      sessionToken
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}