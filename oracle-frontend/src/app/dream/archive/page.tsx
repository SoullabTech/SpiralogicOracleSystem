'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DreamArchive() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const fetchDreams = async () => {
      const { data } = await supabase
        .from('dreams')
        .select('*')
        .order('created_at', { ascending: false });
      setDreams(data || []);
    };
    fetchDreams();
  }, []);

  const filtered = filter
    ? dreams.filter((d) => d.content.toLowerCase().includes(filter.toLowerCase()))
    : dreams;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-oracle text-gold">🌙 Dream Archive</h1>

      <input
        placeholder="Filter by theme, element, or phrase..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 border rounded bg-deep-violet text-gold"
      />

      {filtered.length > 0 ? (
        filtered.map((dream, i) => (
          <div key={i} className="bg-white/5 p-4 rounded border border-white/10">
            <p>{dream.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(dream.created_at).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No dreams found.</p>
      )}
    </div>
  );
}
