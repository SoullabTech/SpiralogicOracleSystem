'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DreamEntry {
  id: number;
  date: string;
  dream: string;
  element?: string;
  tags?: string[];
  insight?: string;
  symbols?: string[];
  phase?: string;
  archetype?: string;
  reflection?: string;
}

const elementColors: Record<string, string> = {
  fire: 'bg-orange-100 text-orange-800',
  water: 'bg-blue-100 text-blue-800',
  earth: 'bg-green-100 text-green-800',
  air: 'bg-sky-100 text-sky-800',
  aether: 'bg-purple-100 text-purple-800',
};

export default function DreamJournalPage() {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    const fetchDreams = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('*')
        .neq('dream', null);

      if (!error && data) {
        setDreams(data);
      }
    };
    fetchDreams();
  }, []);

  const filteredDreams = dreams
    .filter((d) => filter === 'all' || d.element?.toLowerCase() === filter)
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortNewest ? db - da : da - db;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">🌙 Your Dream Journal</h1>

        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'fire', 'water', 'earth', 'air', 'aether'].map((el) => (
              <button
                key={el}
                onClick={() => setFilter(el)}
                className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition ${
                  filter === el ? 'bg-purple-600 text-white' : 'bg-white/70 text-purple-700'
                }`}
              >
                {el.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => setSortNewest((prev) => !prev)}
              className="text-sm underline text-indigo-600 ml-4"
            >
              Sort: {sortNewest ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDreams.map((dream, i) => {
            const isExpanded = expandedId === dream.id;
            const colorClass = dream.element ? elementColors[dream.element.toLowerCase()] || '' : '';

            return (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : dream.id)}
              >
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(dream.date).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-md text-indigo-700 line-clamp-2">
                    {dream.dream}
                  </p>
                  <div className="ml-2">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {dream.element && (
                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
                  >
                    {dream.element.toUpperCase()}
                  </span>
                )}

                {isExpanded && (
                  <div className="mt-4 text-sm text-gray-700 space-y-2">
                    {dream.insight && <p className="italic">🪞 Insight: {dream.insight}</p>}

                    {dream.symbols?.length > 0 && (
                      <p className="text-xs text-purple-500">
                        🜁 Symbols:{' '}
                        {dream.symbols.map((symbol, i) => (
                          <Link
                            key={i}
                            href={`/dream-symbols?search=${encodeURIComponent(symbol)}`}
                            className="underline mr-1"
                          >
                            {symbol}
                          </Link>
                        ))}
                      </p>
                    )}

                    {dream.reflection && (
                      <p className="text-xs text-gray-600 italic">
                        ✍️ Reflection: {dream.reflection}
                      </p>
                    )}

                    {dream.tags?.length > 0 && (
                      <p className="text-xs text-gray-400 italic">
                        Tags: {dream.tags.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
