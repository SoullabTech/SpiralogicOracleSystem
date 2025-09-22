import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, prompt, explorerId, explorerName, sessionId, messageCount } = body;

    // Validate required fields
    if (!content || !explorerId || !explorerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If Supabase is configured, save to database
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('beta_journal_entries')
        .insert({
          explorer_id: explorerId,
          explorer_name: explorerName,
          content,
          prompt,
          session_id: sessionId,
          message_count: messageCount
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Don't fail completely if Supabase has issues
        // Fall back to localStorage on the client
        return NextResponse.json({
          id: `local-${Date.now()}`,
          saved: 'local',
          message: 'Saved locally (database unavailable)'
        });
      }

      return NextResponse.json({
        id: data.id,
        saved: 'database',
        message: 'Journal entry saved successfully'
      });
    } else {
      // Supabase not configured - return success for local storage
      return NextResponse.json({
        id: `local-${Date.now()}`,
        saved: 'local',
        message: 'Saved locally (database not configured)'
      });
    }
  } catch (error) {
    console.error('Journal save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const explorerId = searchParams.get('explorerId');

    if (!explorerId) {
      return NextResponse.json(
        { error: 'Explorer ID required' },
        { status: 400 }
      );
    }

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('beta_journal_entries')
        .select('*')
        .eq('explorer_id', explorerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ entries: [] });
      }

      return NextResponse.json({ entries: data || [] });
    } else {
      // Return empty array if Supabase not configured
      return NextResponse.json({ entries: [] });
    }
  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}