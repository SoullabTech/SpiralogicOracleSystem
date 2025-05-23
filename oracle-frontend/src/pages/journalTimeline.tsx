'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface TimelineEntry {
  id: number;
  date: string;
  dream: string;
  phase?: string;
  element?: string;
  symbols?: string[];
  insight?: string;
  reflection?: string;
}

const phaseOrder = ['Fire 1', 'Earth 1', 'Air 1', 'Water 2', 'Aether'];

const phaseColors: Record<string, string> = {
  'Fire 1': 'text-orange-600',
  'Earth 1': 'text-green-600',
  'Air 1': 'text-blue-500',
  'Water 2': 'text-indigo-600',
  'Aether': 'text-purple-700',
};

export default function JournalTimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const phaseFromQuery = searchParams.get('phase');
    if (phaseFromQuery) setSelectedPhase(phaseFromQuery);
  }, [searchParams]);

  useEffect(() => {
    const fetchTimeline = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('id, date, dream, phase, element, symbols, insight, reflection')
        .neq('dream', null)
        .order('date', { ascending: true });

      if (!error && data) setEntries(data);
    };

    fetchTimeline();
  }, []);

  const filtered = entries
    .filter((entry) => selectedPhase === 'all' || entry.phase === selectedPhase)
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortNewest ? db - da : da - db;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 p-8">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">🧭 Spiral Journal Timeline</h1>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['all', ...phaseOrder].map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition shadow-sm border ${
                selectedPhase === phase
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-100'
              }`}
            >
              {phase === 'all' ? 'All Phases' : phase}
            </button>
          ))}
          <button
            onClick={() => setSortNewest((prev) => !prev)}
            className="ml-4 text-xs underline text-indigo-600"
          >
            Sort: {sortNewest ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        <div className="space-y-6">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-white/80 border border-purple-200 rounded-xl p-5 shadow-md"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
                {entry.phase && (
                  <span className={`text-xs font-semibold italic ${phaseColors[entry.phase] || 'text-gray-600'}`}>
                    {entry.phase}
                  </span>
                )}
              </div>

              <p className="text-md font-medium text-indigo-800 mb-2 line-clamp-3">
                {entry.dream}
              </p>

              {entry.insight && (
                <p className="text-sm text-gray-700 italic whitespace-pre-wrap mb-2">
                  🪞 Insight: {entry.insight}
                </p>
              )}

              {entry.reflection && (
                <p className="text-sm text-purple-700 whitespace-pre-wrap italic mb-2">
                  ✍️ Reflection: {entry.reflection}
                </p>
              )}

              {entry.symbols?.length > 0 && (
                <div className="text-xs text-purple-500 space-x-2 mt-1">
                  Symbols:
                  {entry.symbols.map((symbol, idx) => (
                    <Link
                      key={idx}
                      href={`/dream-symbols/thread?search=${encodeURIComponent(symbol)}`}
                      className="underline hover:text-purple-800"
                    >
                      {symbol}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}