// src/components/Journaling.tsx
'use client';

import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DreamEntry {
  id: number;
  date: string;
  dream: string;
  symbols?: string[];
  insight?: string;
}

const Journaling: React.FC = () => {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('id, date, dream, insight, symbols')
        .neq('dream', null)
        .order('date', { ascending: false });

      if (!error && data) setDreams(data);
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">🌀 Journaling Timeline</h2>
      <div className="space-y-6">
        {dreams.map((entry) => (
          <div key={entry.id} className="bg-white/80 p-4 rounded-xl shadow border">
            <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
            <p className="text-indigo-800 font-semibold mt-1">{entry.dream}</p>
            {entry.insight && (
              <p className="text-sm text-gray-600 italic mt-2">🪞 {entry.insight}</p>
            )}
            {entry.symbols?.length > 0 && (
              <p className="text-xs text-purple-600 mt-2">
                🜁 Symbols:{' '}
                {entry.symbols.map((symbol, i) => (
                  <Link
                    key={i}
                    href={`/dream-symbols/thread?search=${encodeURIComponent(symbol)}`}
                    className="underline mr-2"
                  >
                    {symbol}
                  </Link>
                ))}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journaling;
