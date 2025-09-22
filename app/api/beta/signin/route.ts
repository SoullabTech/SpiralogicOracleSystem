import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - make it optional for beta
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, explorerName } = body;

    console.log('Beta signin for:', explorerName);

    // If no Supabase, use mock signin
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        userId: 'mock-user-id',
        explorerId: 'mock-explorer-id',
        explorerName: explorerName,
        mayaInstance: 'mock-instance',
        sessionId: 'mock-session',
        sanctuary: 'established',
        signupDate: new Date().toISOString()
      });
    }

    // Look up explorer in database
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: explorer, error } = await supabase
      .from('explorers')
      .select('*')
      .eq('explorer_name', explorerName)
      .eq('email', email)
      .single();

    if (error || !explorer) {
      return NextResponse.json(
        { error: 'Explorer not found. Please check your email and explorer name.' },
        { status: 404 }
      );
    }

    // Look up beta user
    const { data: betaUser } = await supabase
      .from('beta_users')
      .select('*')
      .eq('email', email)
      .single();

    // Create new session
    const sessionId = crypto.randomUUID();

    // Return successful signin
    return NextResponse.json({
      success: true,
      userId: betaUser?.id || explorer.explorer_id,
      explorerId: explorer.explorer_id,
      explorerName: explorer.explorer_name,
      mayaInstance: betaUser?.maya_instance || crypto.randomUUID(),
      sessionId: sessionId,
      sanctuary: 'established',
      signupDate: explorer.signup_date
    });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}