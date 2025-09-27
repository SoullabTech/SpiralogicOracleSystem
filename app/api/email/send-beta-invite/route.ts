import { NextRequest, NextResponse } from 'next/server';
import { sendBetaInvite, sendBatchInvites } from '@/lib/email/sendBetaInvite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, template = 'beta-invitation', name, email, invites } = body;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not configured. Add to .env.local'
      }, { status: 500 });
    }

    if (mode === 'single') {
      if (!name || !email) {
        return NextResponse.json({
          success: false,
          error: 'Name and email required'
        }, { status: 400 });
      }

      const result = await sendBetaInvite({ name, email }, template);
      return NextResponse.json(result);
    }

    if (mode === 'batch') {
      if (!invites || !Array.isArray(invites) || invites.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Invites array required'
        }, { status: 400 });
      }

      const result = await sendBatchInvites(invites, template, 2000);
      return NextResponse.json(result);
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid mode. Use "single" or "batch"'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}