import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32)))
      .toString('base64url');

    const { error: insertError } = await supabase
      .from('magic_link_tokens')
      .insert({
        email,
        token,
        used: false,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      });

    if (insertError) {
      console.error('Failed to create magic link token:', insertError);
      return NextResponse.json(
        { error: 'Failed to generate magic link' },
        { status: 500 }
      );
    }

    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;

    const emailSubject = 'Sign in to Soullab';
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer { color: #6B7280; font-size: 14px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #1F2937;">Welcome back to Soullab</h1>
    <p style="color: #4B5563; font-size: 16px;">
      ${user.name ? `Hi ${user.name},` : 'Hi there,'}
    </p>
    <p style="color: #4B5563; font-size: 16px;">
      Click the button below to sign in to your account. This link will expire in 15 minutes.
    </p>
    <a href="${magicLink}" class="button">
      Sign in to Soullab →
    </a>
    <p style="color: #6B7280; font-size: 14px;">
      Or copy and paste this link into your browser:<br>
      <span style="color: #9CA3AF; word-break: break-all;">${magicLink}</span>
    </p>
    <div class="footer">
      <p>If you didn't request this email, you can safely ignore it.</p>
      <p>🔒 This is a secure, passwordless login link.</p>
    </div>
  </div>
</body>
</html>
    `;

    if (process.env.EMAIL_SERVICE === 'resend' && process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Soullab <hello@soullab.life>',
            to: email,
            subject: emailSubject,
            html: emailBody
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }
      } catch (error) {
        console.error('Failed to send email via Resend:', error);
        return NextResponse.json(
          { error: 'Failed to send email' },
          { status: 500 }
        );
      }
    } else {
      console.log('📧 Magic link (dev mode):', magicLink);
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
      devLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}