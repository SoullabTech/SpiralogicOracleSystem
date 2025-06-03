import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { user_id } = await req.json();

  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select(`answer, survey_questions (element)`)
    .eq('user_id', user_id);

  if (error || !responses) {
    return NextResponse.json({ error: error?.message || 'No responses' }, { status: 400 });
  }

  const totals: Record<string, number> = {
    fire: 0, water: 0, earth: 0, air: 0, aether: 0,
  };

  responses.forEach((r: any) => {
    const element = r.survey_questions?.element;
    if (element && totals[element] !== undefined) {
      totals[element] += r.answer;
    }
  });

  const { error: upsertError } = await supabase.from('elemental_profiles').upsert({
    user_id,
    fire: totals.fire,
    water: totals.water,
    earth: totals.earth,
    air: totals.air,
    aether: totals.aether,
  }, { onConflict: 'user_id' });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: totals });
}
