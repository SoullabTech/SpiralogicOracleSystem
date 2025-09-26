import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const challenge = Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    let allowCredentials: any[] = [];

    if (email) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userData) {
        const { data: credentials } = await supabase
          .from('user_biometric_credentials')
          .select('credential_id')
          .eq('user_id', userData.id);

        if (credentials && credentials.length > 0) {
          allowCredentials = credentials.map(cred => ({
            id: cred.credential_id,
            type: 'public-key'
          }));
        }

        const { error: insertError } = await supabase
          .from('auth_challenges')
          .insert({
            user_id: userData.id,
            email,
            challenge,
            type: 'authentication',
            used: false,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          });

        if (insertError) {
          console.error('Failed to store challenge:', insertError);
        }
      }
    } else {
      const { error: insertError } = await supabase
        .from('auth_challenges')
        .insert({
          email: null,
          challenge,
          type: 'authentication',
          used: false,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });

      if (insertError) {
        console.error('Failed to store challenge:', insertError);
      }
    }

    return NextResponse.json({
      challenge,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined
    });
  } catch (error) {
    console.error('Auth challenge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}