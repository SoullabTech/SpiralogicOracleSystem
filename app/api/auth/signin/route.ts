import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, sacred_name, last_login')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError) {
      console.error('Auth sign-in error:', authError);
      return NextResponse.json(
        { error: 'Sign-in failed. Please try again.' },
        { status: 500 }
      );
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Get user's oracle agent
    const { data: oracleAgent } = await supabase
      .from('oracle_agents')
      .select('id, name, archetype, last_conversation_at, conversations_count')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        sacredName: user.sacred_name,
        lastLogin: user.last_login
      },
      oracleAgent: oracleAgent || null,
      session: authData.session
    });

  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}