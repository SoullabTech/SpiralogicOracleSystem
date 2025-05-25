// /pages/personal-oracle.tsx
import { usePersonalOracle } from '@/lib/hooks/usePersonalOracle';
import { useState } from 'react';

export default function PersonalOraclePage() {
  const { oracleData, fetchOracle, loading } = usePersonalOracle();
  const [tone, setTone] = useState<'poetic' | 'direct' | 'mystic' | 'nurturing'>('poetic');

  const handleActivate = () => {
    const userId = 'demo-user-1'; // Replace with actual user context
    fetchOracle({ userId, userName: 'Seeker', tone });
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">🌟 Personal Oracle</h1>
      <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="p-2 border rounded">
        <option value="poetic">Poetic</option>
        <option value="direct">Direct</option>
        <option value="mystic">Mystic</option>
        <option value="nurturing">Nurturing</option>
      </select>
      <button onClick={handleActivate} className="bg-amber-500 text-white px-4 py-2 rounded">
        🔮 Invoke Oracle
      </button>

      {loading && <p>Listening to your soul...</p>}

      {oracleData && (
        <div className="mt-4 space-y-2 border-t pt-4">
          <p><strong>🗣️ Intro:</strong> {oracleData.intro}</p>
          <p><strong>🌀 Reflection:</strong> {oracleData.reflection}</p>
          <p><strong>🪄 Ritual Suggestion:</strong> {oracleData.ritual}</p>
        </div>
      )}
    </div>
  );
}
