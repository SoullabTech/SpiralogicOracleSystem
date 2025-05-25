'use client';

import { useState, useEffect } from 'react';
import { usePersonalOracle } from '@/lib/hooks/usePersonalOracle';
import { useSession } from '@/hooks/useSession';
import OracleMemoryLog from '@/components/OracleMemoryLog';

export default function PersonalOraclePage() {
  const { oracleData, fetchOracle, loading } = usePersonalOracle();
  const [tone, setTone] = useState<'poetic' | 'direct' | 'mystic' | 'nurturing'>('poetic');
  const { session, loading: sessionLoading } = useSession();

  const userId = session?.user?.id || 'demo-user-1';
  const userName = session?.user?.user_metadata?.name || 'Seeker';

  const handleActivate = () => {
    fetchOracle({ userId, userName, tone });
  };

  useEffect(() => {
    if (session && !oracleData) {
      fetchOracle({ userId, userName, tone });
    }
  }, [session]);

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-100">🌟 Personal Oracle</h1>

      <select
        value={tone}
        onChange={(e) => setTone(e.target.value as any)}
        className="p-2 border rounded text-indigo-700 dark:text-white bg-white dark:bg-gray-800"
      >
        <option value="poetic">Poetic</option>
        <option value="direct">Direct</option>
        <option value="mystic">Mystic</option>
        <option value="nurturing">Nurturing</option>
      </select>

      <button
        onClick={handleActivate}
        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 mt-2"
      >
        🔮 Invoke Oracle
      </button>

      {(loading || sessionLoading) && (
        <p className="italic text-indigo-500 mt-4">Listening to your soul...</p>
      )}

      {oracleData && (
        <div className="mt-6 space-y-4 border-t pt-4">
          <p className="italic text-purple-700 dark:text-purple-300">
            “The horizon of the Sun opens. Spirit rises. My thread of becoming begins.”
          </p>
          <p><strong>🗣️ Intro:</strong> {oracleData.intro}</p>
          <p><strong>🌀 Reflection:</strong> {oracleData.reflection}</p>
          <p><strong>🪄 Ritual:</strong> {oracleData.ritual}</p>
          <p className="text-sm text-right text-indigo-500">
            🌀 Shared by: {oracleData.source || 'Oracle'}
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold text-indigo-700 mt-10">📜 Oracle Memory Thread</h2>
      <OracleMemoryLog userId={userId} />
    </div>
  );
}
