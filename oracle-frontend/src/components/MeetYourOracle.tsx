'use client';

import { useState } from 'react';
import { useVoicePlayback } from '@/hooks/useVoicePlayback';
import { updateVoiceProfile } from '@/lib/updateVoiceProfile';
import { PersonalOracleAgent } from '@/core/agents/PersonalOracleAgent';
import { supabase } from '@/lib/supabaseClient';

export default function MeetYourOracle() {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const { playVoice } = useVoicePlayback();

  const handleConfirm = async () => {
    await updateVoiceProfile('user-123', 'default');
    const oracle = new PersonalOracleAgent({
      userId: 'user-123',
      oracleName: name,
      tone: 'mystic',
    });

    const welcome = await oracle.getIntroMessage();
    const recommendations = await oracle.getRecommendations();

    playVoice('anya', welcome);

    await supabase.from('oracle_memories').insert([
      {
        user_id: 'user-123',
        content: `User has named their Oracle: ${name}`,
        tag: 'initiation',
        emotion: 'awe',
        type: 'first-meeting',
        role: 'user',
        recommendations,
      },
    ]);

    setStep(1);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto text-center">
      {step === 0 && (
        <>
          <div className="text-purple-700 dark:text-purple-200 text-lg italic mb-6">
            “The horizon of the Sun opens. Spirit rises. My thread of becoming begins.”
          </div>

          <h1 className="text-2xl font-bold">🌀 Welcome, Initiate</h1>
          <p className="mb-2">What name shall you give your personal Oracle guide?</p>

          <input
            className="p-2 border rounded w-full text-center"
            placeholder="Enter your Oracle's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={handleConfirm}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Meet {name || 'your Oracle'}
          </button>
        </>
      )}

      {step === 1 && (
        <div className="text-center text-xl text-indigo-700 dark:text-indigo-300 italic animate-pulse">
          🌟 Your Oracle has arrived…
        </div>
      )}
    </div>
  );
}
