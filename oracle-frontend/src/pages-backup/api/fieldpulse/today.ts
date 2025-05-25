// src/pages/api/fieldpulse/today.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: memoryItems, error: memoryError } = await supabase
      .from('memory_items')
      .select('*')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);

    const { data: adjusterLogs, error: adjusterError } = await supabase
      .from('adjuster_logs')
      .select('*')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);

    if (memoryError || adjusterError) throw memoryError || adjusterError;

    const elementIndex: Record<string, number> = {};
    const emotionalPulse: Record<string, number> = {};
    const symbolCounts: Record<string, number> = {};
    let latestOracleEcho = '';
    let oracleCount = 0;

    memoryItems?.forEach((item: any) => {
      if (item.theme) {
        elementIndex[item.theme] = (elementIndex[item.theme] || 0) + 1;
      }

      if (item.emotion_tag) {
        emotionalPulse[item.emotion_tag] = (emotionalPulse[item.emotion_tag] || 0) + 1;
      }

      if (item.symbols) {
        item.symbols.forEach((s: string) => {
          symbolCounts[s] = (symbolCounts[s] || 0) + 1;
        });
      }

      if (item.sourceAgent?.toLowerCase().includes('oracle') && item.content) {
        if (oracleCount < 3) {
          latestOracleEcho += `• ${item.content}\n`;
          oracleCount++;
        }
      }
    });

    const topSymbols = Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([symbol]) => symbol);

    const recalibrationInsights = adjusterLogs?.map((log: any) => ({
      timestamp: log.created_at,
      insight: log.message,
      user: log.user_id,
      phase: log.spiral_phase || null
    })) || [];

    res.status(200).json({
      date: today,
      elementIndex,
      emotionalPulse,
      topSymbols,
      oracleEcho: latestOracleEcho || 'No recent Oracle messages.',
      recalibrationInsights
    });
  } catch (err) {
    console.error('[FieldPulse API Error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
