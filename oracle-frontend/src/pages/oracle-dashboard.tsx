'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabaseClient';

interface OracleMemory {
  id: string;
  user_id: string;
  type: string;
  content: string;
  element?: string;
  source?: string;
  timestamp?: string;
}

export default function OracleDashboard() {
  const [memories, setMemories] = useState<OracleMemory[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('oracle_memories')
        .select('*')
        .eq('user_id', 'demo-user-1')
        .order('timestamp', { ascending: false });

      if (!error && data) setMemories(data);
    };
    fetchMemories();
  }, []);

  const filtered = filter === 'all' ? memories : memories.filter(m => m.type === filter);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-soullab-gold text-center">📜 Oracle Dashboard</h1>
        <p className="text-center text-soullab-moon">View your evolving journey with Oralia.</p>

        <div className="flex justify-center gap-3 flex-wrap">
          {['all', 'reflection', 'ritual', 'insight', 'recommendation'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
                filter === type
                  ? 'bg-soullab-aether text-white border-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10 shadow"
            >
              <p className="text-sm text-soullab-moon mb-1">
                {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''} — {entry.type}
              </p>
              <p className="text-white text-sm">{entry.content}</p>
              {entry.element && (
                <span className="mt-2 inline-block text-xs text-soullab-gold">Element: {entry.element}</span>
              )}
              {entry.source && (
                <span className="ml-2 inline-block text-xs text-soullab-indigo">Source: {entry.source}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
