// src/lib/hooks/usePersonalOracle.ts
import { useState } from 'react';
import { PersonalOracleAgent } from '@/core/agents/PersonalOracleAgent';

export function usePersonalOracle() {
  const [oracleData, setOracleData] = useState<null | {
    intro: string;
    reflection: string;
    ritual: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  async function fetchOracle({
    userId,
    userName,
    tone,
  }: {
    userId: string;
    userName: string;
    tone: string;
  }) {
    setLoading(true);
    const agent = new PersonalOracleAgent({ userId, oracleName: userName, tone });

    const intro = await agent.getIntroMessage();
    const reflection = await agent.getDailyReflection();
    const ritual = await agent.suggestRitual();

    setOracleData({ intro, reflection, ritual });
    setLoading(false);
  }

  return { oracleData, loading, fetchOracle };
}
