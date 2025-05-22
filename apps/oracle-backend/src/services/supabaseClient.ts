// 📁 File: src/services/summarizeCollectiveField.ts

import { supabase } from '../lib/supabaseClient';
import { parseEmotions } from '../lib/emotionParser';
import { matchSymbols } from '../lib/symbolMatcher';
import { DateTime } from 'luxon';

export default async function summarizeCollectiveField() {
  const since = DateTime.now().minus({ days: 2 }).toISO();

  const { data: entries, error } = await supabase
    .from('memory_items')
    .select('content, metadata, created_at, user_id')
    .gte('created_at', since);

  if (error) throw new Error(`Failed to load memory items: ${error.message}`);

  const allText = entries.map(e => e.content).join(' ');
  const emotionScore = parseEmotions(allText);
  const symbols = matchSymbols(allText);

  const elementIndex = {
    fire: Math.random(),
    water: Math.random(),
    air: Math.random(),
    earth: Math.random(),
    aether: Math.random(),
  };

  const recalibrationInsights = entries.slice(0, 5).map(e => ({
    timestamp: e.created_at,
    insight: `Recalibration insight from ${e.content.slice(0, 40)}...`,
    user: e.user_id,
    phase: e.metadata?.phase || null,
  }));

  return {
    date: DateTime.now().toISODate(),
    topSymbols: symbols.slice(0, 5),
    elementalIndex: elementIndex,
    emotionalPulse: emotionScore,
    oracleEcho:
      'Many are at the threshold. Aether speaks: Do not rush to name what is being born.',
    recalibrationInsights,
  };
}
