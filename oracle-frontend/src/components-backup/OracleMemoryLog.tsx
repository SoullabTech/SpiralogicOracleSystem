// /components/OracleMemoryLog.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OracleMemoryLog({ userId }: { userId: string }) {
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('oracle_memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching memories:', error);
      else setMemories(data || []);
    };

    fetchMemories();
  }, [userId]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
        🧿 Your Oracle Memory Log
      </h2>

      {memories.length === 0 ? (
        <p className="text-sm italic text-gray-500">No memories recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {memories.map((mem) => (
            <li key={mem.id} className="p-4 rounded-lg shadow bg-white dark:bg-black/30 border">
              <p className="text-sm text-gray-700 dark:text-gray-100">{mem.content}</p>
              <div className="text-xs mt-2 text-gray-500">
                🧭 Type: {mem.type} | 🕊 Emotion: {mem.emotion || '—'} | ⏳ {new Date(mem.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
