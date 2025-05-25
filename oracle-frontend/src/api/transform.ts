// oracle-backend/api/transform.ts
import { supabase } from '../src/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

export const config = { api: { bodyParser: true } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const PROMPTS: Record<string, (text: string) => string> = {
  poetic: text => `Turn this into a poetic elemental reflection:\n\n${text}`,
  tarot: text => `Interpret this as a Tarot-style insight:\n\n${text}`,
  bullets: text => `Summarize into concise bullet points:\n\n${text}`,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { memoryId, mode } = req.body as { memoryId: string; mode: string };
  if (!memoryId || !PROMPTS[mode]) {
    return res.status(400).json({ error: 'Missing or invalid memoryId/mode' });
  }

  // fetch the original transcript
  const { data: mem, error: memErr } = await supabase
    .from('memory')
    .select('transcript')
    .eq('id', memoryId)
    .single();
  if (memErr || !mem) {
    return res.status(500).json({ error: memErr?.message || 'Memory not found' });
  }

  try {
    const prompt = PROMPTS[mode](mem.transcript || '');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    const transformed = completion.choices[0].message?.content?.trim();
    if (!transformed) throw new Error('Empty response');

    return res.status(200).json({ transformed });
  } catch (err: any) {
    console.error('Transform error', err);
    return res.status(500).json({ error: err.message });
  }
}
