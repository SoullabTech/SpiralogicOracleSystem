import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { email, password, sacredName, userIntention, betaAccessCode } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        sacred_name: sacredName || null,
        user_intention: userIntention || null,
        beta_access_code: betaAccessCode || null,
        beta_onboarded_at: betaAccessCode ? new Date().toISOString() : null,
      })
      .select('id, email, sacred_name, created_at')
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Create Oracle Agent for the user
    const { data: oracleAgent, error: agentError } = await supabase
      .from('oracle_agents')
      .insert({
        user_id: user.id,
        name: 'Maya',
        archetype: 'sacred_guide',
        personality_config: {
          voice_style: 'contemplative',
          wisdom_tradition: 'universal',
          communication_depth: 'soul_level',
          memory_integration: 'holistic',
          sacred_name: sacredName || 'beloved soul',
          user_intention: userIntention || null
        }
      })
      .select('id, name, archetype, created_at')
      .single();

    if (agentError) {
      console.error('Error creating oracle agent:', agentError);
      // Clean up user record if agent creation fails
      await supabase.from('users').delete().eq('id', user.id);
      
      return NextResponse.json(
        { error: 'Failed to initialize your Oracle guide. Please try again.' },
        { status: 500 }
      );
    }

    // Sign in the user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError) {
      console.error('Error signing in user:', authError);
      return NextResponse.json(
        { error: 'Account created but sign-in failed. Please try logging in.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        sacredName: user.sacred_name,
        createdAt: user.created_at
      },
      oracleAgent: {
        id: oracleAgent.id,
        name: oracleAgent.name,
        archetype: oracleAgent.archetype,
        createdAt: oracleAgent.created_at
      },
      session: authData.session
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}