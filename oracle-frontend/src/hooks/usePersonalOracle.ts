import { useState } from 'react';
import { PersonalOracleAgent } from '@/core/agents/PersonalOracleAgent';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/hooks/useSession';

export function usePersonalOracle(defaultElement = 'Water') {
  const [oracleData, setOracleData] = useState<null | {
    intro: string;
    reflection: string;
    ritual: string;
    insight: {
      message: string;
      archetype: string;
      tone: string;
      card: string;
      symbol: string;
      ritualId: string;
    };
  }>(null);

  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const userId = session?.user?.id;

  const fetchOracleReflection = async (element = defaultElement) => {
    if (!userId) return;

    setLoading(true);
    const oracle = new PersonalOracleAgent({
      userId,
      oracleName: 'Your Oracle',
      tone: 'mystic',
    });

    const [intro, reflection, ritual, insight] = await Promise.all([
      oracle.getIntroMessage(),
      oracle.getDailyReflection(),
      oracle.suggestRitual(),
      oracle.getArchetypalInsight(element),
    ]);

    // Log to Supabase memories
    await supabase.from('memories').insert([
      {
        user_id: userId,
        content: reflection,
        tag: 'reflection',
        emotion: 'curiosity',
        type: 'oracle-daily',
      },
      {
        user_id: userId,
        content: ritual,
        tag: 'ritual',
        emotion: 'calm',
        type: 'oracle-ritual',
      },
      {
        user_id: userId,
        content: insight.message,
        tag: `archetype:${insight.archetype}`,
        emotion: 'resonance',
        type: 'oracle-archetype',
        metadata: insight,
      },
    ]);

    // Optional: Log or update profile data
    await supabase.from('soul_profile').upsert(
      {
        user_id: userId,
        last_archetype: insight.archetype,
        last_element: element,
        last_reflection: reflection,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    setOracleData({ intro, reflection, ritual, insight });
    setLoading(false);
  };

  return {
    oracleData,
    loading,
    fetchOracleReflection,
  };
}
