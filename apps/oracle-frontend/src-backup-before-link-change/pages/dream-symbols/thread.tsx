'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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

export default function SymbolThreadPage() {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const searchParams = useSearchParams();
  const symbol = searchParams.get('search') ?? '';
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const fetchSymbolDreams = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('*')
        .contains('symbols', [symbol]);

      if (!error && data) {
        setDreams(data);
        generateSummary(data);
      }
    };

    const generateSummary = (entries: DreamEntry[]) => {
      const count = (list: (string | undefined)[]) =>
        list.filter(Boolean).reduce<Record<string, number>>((acc, item) => {
          const key = item!;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

      const mostCommon = (counts: Record<string, number>) =>
        Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

      const elements = count(entries.map((d) => d.element));
      const phases = count(entries.map((d) => d.phase));
      const archetypes = count(entries.map((d) => d.archetype));

      const topElement = mostCommon(elements);
      const topPhase = mostCommon(phases);
      const topArchetype = mostCommon(archetypes);

      if (topElement && topPhase && topArchetype) {
        setSummary(
          `The symbol **${symbol}** most often appears in *${topElement}* dreams during the *${topPhase}* phase and is associated with the *${topArchetype}* archetype.`
        );
      }
    };

    if (symbol) fetchSymbolDreams();
  }, [symbol]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            🔗 Dreams Connected by “{symbol}”
          </h1>
          <p className="text-gray-600 mb-2">
            These dreams all reference the symbol <strong>{symbol}</strong>.
          </p>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-sm text-indigo-700 bg-white/60 rounded-xl p-4 border"
            >
              {summary}
            </motion.div>
          )}
          <Link
            href="/dream-journal"
            className="text-indigo-500 underline text-sm mt-4 inline-block"
          >
            ← Back to Journal
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dreams.map((dream, i) => {
            const colorClass = dream.element ? elementColors[dream.element.toLowerCase()] || '' : '';

            return (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/90 p-5 rounded-xl shadow border hover:shadow-lg transition"
              >
                <p className="text-sm text-gray-400 mb-1">
                  {new Date(dream.date).toLocaleDateString()}
                </p>
                <p className="text-md font-medium text-indigo-700 mb-2">{dream.dream}</p>

                {dream.insight && (
                  <p className="text-sm italic text-gray-700 mb-2">🪞 {dream.insight}</p>
                )}

                {dream.reflection && (
                  <p className="text-xs text-gray-600 italic mb-2">
                    ✍️ Reflection: {dream.reflection}
                  </p>
                )}

                {dream.phase && (
                  <p className="text-xs text-indigo-500">Phase: {dream.phase}</p>
                )}

                {dream.archetype && (
                  <p className="text-xs text-purple-500">Archetype: {dream.archetype}</p>
                )}

                {dream.element && (
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                    {dream.element.toUpperCase()}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
