// /pages/admin/phase-dashboard.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);

interface PhaseStat {
  ritual_id: string;
  count: number;
}

export default function PhaseDashboard() {
  const [stats, setStats] = useState<PhaseStat[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from('ritual_progress')
        .select('ritual_id, count:ritual_id', { count: 'exact' })
        .group('ritual_id');
      if (!error) setStats(data);
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌀 Collective Phase Tracker</h1>
      <ul className="space-y-2">
        {stats.map(({ ritual_id, count }, i) => (
          <li key={i} className="bg-white shadow p-3 rounded-xl">
            <div className="font-medium">{ritual_id}</div>
            <div className="text-sm text-gray-500">Completions: {count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
