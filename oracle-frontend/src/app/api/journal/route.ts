// 📁 oracle-frontend/app/api/journal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        id,
        user_id,
        content,
        mood,
        elemental_tag,
        archetype_tag,
        created_at,
        metadata
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    console.error('GET /api/journal error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
