'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface JournalEntry {
  id: number;
  content: string;
  oracle_message: string;
  created_at: string;
  element?: string;
  archetype?: string;
  phase?: string;
}

export default function SymbolInsightThread() {
  const params = useSearchParams();
  const symbol = params.get('search');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSymbolThread = async () => {
      if (!symbol) return;

      try {
        const res = await fetch(`/api/oracle/symbol/${encodeURIComponent(symbol)}`);
        const data = await res.json();
        if (res.ok) setEntries(data.entries || []);
      } catch (err) {
        console.error('Error fetching symbol thread:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSymbolThread();
  }, [symbol]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        🪐 Insights for Symbol: <span className="italic">{symbol}</span>
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading symbol thread...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-600 italic">No entries found for this symbol.</p>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              className="bg-white/80 border border-indigo-200 p-4 rounded-xl shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
              <p className="text-md font-medium text-indigo-800 mb-2">{entry.content}</p>
              <p className="text-sm italic text-purple-800">✨ {entry.oracle_message}</p>

              <div className="mt-2 text-xs text-gray-500 space-x-3">
                {entry.element && <span>🌿 Element: {entry.element}</span>}
                {entry.archetype && <span>🜂 Archetype: {entry.archetype}</span>}
                {entry.phase && <span>🌀 Phase: {entry.phase}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
