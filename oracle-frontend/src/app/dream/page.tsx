'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DreamPage() {
  const [dream, setDream] = useState('');
  const [tag, setTag] = useState('');
  const [dreams, setDreams] = useState<any[]>([]);

  const userId = 'demo-user'; // Replace with real user ID from Supabase Auth

  const saveDream = async () => {
    if (!dream) return;
    const { error } = await supabase.from('dreams').insert([{ user_id: userId, content: dream, tag }]);
    if (!error) {
      setDream('');
      setTag('');
      fetchDreams();
    }
  };

  const fetchDreams = async () => {
    const { data } = await supabase
      .from('dreams')
      .select('content, tag, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setDreams(data);
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-oracle mb-4">🌌 Dream Weaver</h1>

      <textarea
        className="w-full border rounded p-3 mb-3"
        rows={5}
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        placeholder="Record your dream, vision, or symbol..."
      />

      <label className="block font-semibold mb-1">Elemental Tag</label>
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select Element</option>
        <option value="fire">🔥 Fire</option>
        <option value="water">💧 Water</option>
        <option value="earth">🌱 Earth</option>
        <option value="air">🌬 Air</option>
        <option value="aether">✨ Aether</option>
      </select>

      <button
        onClick={saveDream}
        className="bg-gold text-deep-purple font-bold px-6 py-2 rounded"
      >
        Save Dream
      </button>

      <h2 className="text-xl font-bold mt-8 mb-4">🌙 Dream Archive</h2>
      {dreams.map((entry, i) => (
        <div key={i} className="border p-4 mb-3 rounded shadow">
          <p className="italic text-sm opacity-60">{entry.created_at?.slice(0, 10)}</p>
          <p className="mb-2">{entry.content}</p>
          {entry.tag && <p className="text-xs text-gold">Element: {entry.tag}</p>}
        </div>
      ))}
    </div>
  );
}
