// /pages/api/oracle/personal.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PersonalOracleAgent } from '@/core/agent/agents/personalOracleAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, userName, tone } = req.body;

  try {
    const agent = new PersonalOracleAgent({ userId, userName, tone });
    const intro = await agent.getIntroMessage();
    const reflection = await agent.getDailyReflection();
    const ritual = await agent.suggestRitual();

    res.status(200).json({ intro, reflection, ritual });
  } catch (err) {
    console.error('Oracle error:', err);
    res.status(500).json({ error: 'Internal Oracle Error' });
  }
}
