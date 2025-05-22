import { supabase } from '@/lib/supabaseClient';
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';

interface Memory {
  id: string;
  title: string;
  created_at: string;
}

const MemoryListPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from<Memory>('memories')
          .select('id, metadata::text as title, created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMemories(data ?? []);
      } catch (err) {
        console.error('Failed to fetch memories:', err);
        setError('Unable to load your memories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="animate-pulse text-gray-500">Loading your memories…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Your Memories</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {memories.length === 0 ? (
        <p className="text-center text-gray-500">
          You don’t have any memories yet. Start by creating one 🌿
        </p>
      ) : (
        <ul className="space-y-3">
          {memories.map((mem) => (
            <li key={mem.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
              <Link
                href={`/insights?memoryId=${mem.id}`}
                className="block text-lg font-semibold text-indigo-700 hover:underline"
              >
                {mem.title || 'Untitled Memory'}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(mem.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemoryListPage;
