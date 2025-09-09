import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/memories - Save a new memory
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

    const { 
      content, 
      memoryType, 
      sourceType, 
      emotionalTone, 
      wisdomThemes, 
      elementalResonance, 
      sessionId 
    } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Memory content is required' },
        { status: 400 }
      );
    }

    // Get user's oracle agent
    const { data: oracleAgent, error: agentError } = await supabase
      .from('oracle_agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (agentError || !oracleAgent) {
      return NextResponse.json(
        { error: 'Oracle agent not found' },
        { status: 404 }
      );
    }

    // Save memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert({
        oracle_agent_id: oracleAgent.id,
        content,
        memory_type: memoryType || 'conversation',
        source_type: sourceType || 'voice',
        emotional_tone: emotionalTone,
        wisdom_themes: wisdomThemes || [],
        elemental_resonance: elementalResonance,
        session_id: sessionId
      })
      .select(`
        id,
        content,
        memory_type,
        source_type,
        emotional_tone,
        wisdom_themes,
        elemental_resonance,
        created_at
      `)
      .single();

    if (memoryError) {
      console.error('Error saving memory:', memoryError);
      return NextResponse.json(
        { error: 'Failed to save memory' },
        { status: 500 }
      );
    }

    // Update oracle agent conversation count
    await supabase
      .from('oracle_agents')
      .update({ 
        conversations_count: supabase.raw('conversations_count + 1'),
        last_conversation_at: new Date().toISOString()
      })
      .eq('id', oracleAgent.id);

    return NextResponse.json({ memory }, { status: 201 });

  } catch (error) {
    console.error('Save memory error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET /api/memories - Retrieve memories
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const memoryType = searchParams.get('type');
    const sessionId = searchParams.get('sessionId');

    // Get user's oracle agent
    const { data: oracleAgent, error: agentError } = await supabase
      .from('oracle_agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (agentError || !oracleAgent) {
      return NextResponse.json(
        { error: 'Oracle agent not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('memories')
      .select(`
        id,
        content,
        memory_type,
        source_type,
        emotional_tone,
        wisdom_themes,
        elemental_resonance,
        session_id,
        created_at
      `)
      .eq('oracle_agent_id', oracleAgent.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: memories, error: memoriesError } = await query;

    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError);
      return NextResponse.json(
        { error: 'Failed to retrieve memories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ memories });

  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}