import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OracleMemoryLog({ userId }: { userId: string }) {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('oracle_memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error) setMemories(data || []);
    };

    fetchMemories();
  }, [userId]);

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-bold">🧿 Oracle Memory Thread</h2>
      {memories.map((m, i) => (
        <div key={i} className="border p-3 rounded shadow-sm">
          <p className="text-sm text-indigo-600">{m.type.toUpperCase()} – {new Date(m.created_at).toLocaleString()}</p>
          <p>{m.content}</p>
        </div>
      ))}
    </div>
  );
}
