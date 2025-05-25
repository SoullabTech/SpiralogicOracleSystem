// oracle-frontend/src/pages/api/oracle/reflection.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PersonalOracleAgent } from '@/core/agents/personalOracleAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const element = req.query.element?.toString() || 'Water';

  const agent = new PersonalOracleAgent({
    userId: 'user-123',
    oracleName: 'The Inner One',
    tone: 'mystic',
  });

  try {
    const intro = await agent.getIntroMessage();
    const reflection = await agent.getDailyReflection();
    const ritual = await agent.suggestRitual();
    const insight = await agent.getArchetypalInsight(element);

    res.status(200).json({
      intro,
      reflection,
      ritual,
      insight,
    });
  } catch (error) {
    console.error('Oracle Reflection API Error:', error);
    res.status(500).json({ error: 'Failed to fetch oracle data' });
  }
}
