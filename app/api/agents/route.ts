import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/agents - Retrieve user's oracle agent
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's oracle agent
    const { data: oracleAgent, error } = await supabase
      .from('oracle_agents')
      .select(`
        id,
        name,
        archetype,
        personality_config,
        conversations_count,
        wisdom_level,
        last_conversation_at,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching oracle agent:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve oracle agent' },
        { status: 500 }
      );
    }

    if (!oracleAgent) {
      return NextResponse.json(
        { error: 'Oracle agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ oracleAgent });

  } catch (error) {
    console.error('Get oracle agent error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create oracle agent (typically called during signup)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, archetype, personalityConfig } = await request.json();

    // Check if user already has an oracle agent
    const { data: existingAgent } = await supabase
      .from('oracle_agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Oracle agent already exists for this user' },
        { status: 409 }
      );
    }

    // Create oracle agent
    const { data: oracleAgent, error } = await supabase
      .from('oracle_agents')
      .insert({
        user_id: user.id,
        name: name || 'Maya',
        archetype: archetype || 'sacred_guide',
        personality_config: personalityConfig || {
          voice_style: 'contemplative',
          wisdom_tradition: 'universal',
          communication_depth: 'soul_level',
          memory_integration: 'holistic'
        }
      })
      .select(`
        id,
        name,
        archetype,
        personality_config,
        conversations_count,
        wisdom_level,
        created_at
      `)
      .single();

    if (error) {
      console.error('Error creating oracle agent:', error);
      return NextResponse.json(
        { error: 'Failed to create oracle agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ oracleAgent }, { status: 201 });

  } catch (error) {
    console.error('Create oracle agent error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/agents - Update oracle agent
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, archetype, personalityConfig } = await request.json();

    // Update oracle agent
    const { data: oracleAgent, error } = await supabase
      .from('oracle_agents')
      .update({
        ...(name && { name }),
        ...(archetype && { archetype }),
        ...(personalityConfig && { personality_config: personalityConfig })
      })
      .eq('user_id', user.id)
      .select(`
        id,
        name,
        archetype,
        personality_config,
        conversations_count,
        wisdom_level,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error updating oracle agent:', error);
      return NextResponse.json(
        { error: 'Failed to update oracle agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ oracleAgent });

  } catch (error) {
    console.error('Update oracle agent error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}