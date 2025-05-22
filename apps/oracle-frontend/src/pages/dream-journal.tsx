'use client';

import WhisperPlayer from '@/components/WhisperPlayer'; // <-- 🔊 Import whisper player
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Feather, Sparkles } from 'lucide-react';
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

const quoteOracle: Record<string, string[]> = {
  Mystic: [
    'You are the dreamer and the dreamed.',
    'The unconscious speaks in rivers and riddles.',
  ],
  Warrior: [
    'Your strength is your clarity.',
    'Truth cuts like flame through illusion.',
  ],
  Healer: [
    'The wound is the place where light enters.',
    'To feel is to alchemize.',
  ],
  Oracle: [
    'You already know. You’re remembering.',
    'Listen beyond the veil.',
  ],
};

function getQuote(archetype: string | undefined): string | null {
  if (!archetype || !quoteOracle[archetype]) return null;
  const options = quoteOracle[archetype];
  return options[Math.floor(Math.random() * options.length)];
}

export default function DreamJournalPage() {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [reflectingId, setReflectingId] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');

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

  const saveReflection = async (id: number) => {
    const { error } = await supabase
      .from('spiral_breaths')
      .update({ reflection: reflectionText })
      .eq('id', id);

    if (!error) {
      setDreams((prev) =>
        prev.map((d) => (d.id === id ? { ...d, reflection: reflectionText } : d))
      );
      setReflectingId(null);
      setReflectionText('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">🌙 Spiral Dream Journal</h1>

        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'fire', 'water', 'earth', 'air', 'aether'].map((el) => (
              <button
                key={el}
                onClick={() => setFilter(el)}
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm transition ${
                  filter === el ? 'bg-indigo-600 text-white' : 'bg-white/70 text-indigo-700'
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
            const quote = getQuote(dream.archetype);

            return (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/90 p-6 rounded-xl shadow-md border hover:shadow-lg transition cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : dream.id)}
              >
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(dream.date).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-md text-indigo-700 font-medium line-clamp-2">
                    {dream.dream}
                  </p>
                  <div className="ml-2">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {dream.element && (
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                    {dream.element.toUpperCase()}
                  </span>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="expand"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-sm text-gray-700 space-y-3"
                    >
                      {dream.phase && (
                        <p className="text-xs text-indigo-500">Phase: {dream.phase}</p>
                      )}
                      {dream.archetype && (
                        <p className="text-xs text-purple-500">Archetype: {dream.archetype}</p>
                      )}
                      {dream.insight && <p className="italic">🪞 Insight: {dream.insight}</p>}

                      {dream.symbols?.length > 0 && (
                        <p className="text-xs text-purple-600">
                          🜁 Symbols:{' '}
                          {dream.symbols.map((symbol, i) => (
                            <Link
                              key={i}
                              href={`/dream-symbols/thread?search=${encodeURIComponent(symbol)}`}
                              className="underline mr-1 hover:text-purple-800 transition"
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

                      {reflectingId === dream.id ? (
                        <motion.div
                          className="bg-purple-50/50 border rounded-xl p-4 mt-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs text-purple-800 mb-2 flex gap-1 items-center">
                            <Feather size={14} /> Write a Reflection Petal
                          </div>
                          <textarea
                            className="w-full p-2 border rounded text-sm"
                            rows={3}
                            value={reflectionText}
                            onChange={(e) => setReflectionText(e.target.value)}
                          />
                          <button
                            onClick={() => saveReflection(dream.id)}
                            className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                          >
                            Save Reflection
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          className="text-xs text-indigo-600 underline flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReflectingId(dream.id);
                            setReflectionText(dream.reflection || '');
                          }}
                        >
                          <Feather size={14} /> Reflect
                        </button>
                      )}

                      {dream.tags?.length > 0 && (
                        <p className="text-xs text-gray-400 italic">
                          Tags: {dream.tags.join(', ')}
                        </p>
                      )}

                      {quote && (
                        <div className="text-xs text-indigo-500 space-y-1">
                          <p className="flex items-center gap-1">
                            <Sparkles size={14} /> Oracle Whisper: “{quote}”
                          </p>
                          <WhisperPlayer text={quote} archetype={dream.archetype || 'Oracle'} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
