'use client';

import DreamPetalGallery from '@/components/SpiralMemory/DreamPetalGallery';
import { supabase } from '@/lib/supabaseClient';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, FileDown, Pencil } from 'lucide-react';
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

export default function DreamJournal() {
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectingId, setReflectingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDreams = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('id, date, dream, element, tags, insight, symbols, phase, archetype, reflection')
        .neq('dream', null);

      if (error) {
        console.error('Error fetching dreams:', error.message);
      } else {
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

  const exportDreams = () => {
    const text = filteredDreams.map(d => `📅 ${d.date}\n${d.dream}\nInsight: ${d.insight}\nReflection: ${d.reflection || '—'}\nTags: ${(d.tags || []).join(', ')}\nSymbols: ${(d.symbols || []).join(', ')}\nPhase: ${d.phase} | Archetype: ${d.archetype}\n\n`).join('');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'dream_journal_export.txt');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto w-full">
        <DreamPetalGallery />

        <div className="flex flex-wrap justify-between items-center mt-6 mb-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'fire', 'water', 'earth', 'air', 'aether'].map((el) => (
              <button
                key={el}
                onClick={() => setFilter(el)}
                className={`px-3 py-1 rounded-full text-sm font-medium shadow-md transition ${
                  filter === el ? 'bg-indigo-600 text-white' : 'bg-white/60 text-indigo-700'
                }`}
              >
                {el.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setSortNewest((prev) => !prev)}
              className="text-sm text-indigo-700 underline hover:text-indigo-900"
            >
              Sort: {sortNewest ? 'Newest First' : 'Oldest First'}
            </button>
            <button
              onClick={exportDreams}
              className="flex gap-1 items-center text-sm text-purple-600 hover:text-purple-900"
            >
              <FileDown size={16} /> Export Journal
            </button>
          </div>
        </div>

        <div className="bg-white bg-opacity-80 rounded-3xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold mb-8 text-center">🌙 Spiral Dream Journal</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDreams.map((dream, index) => {
              const isExpanded = expandedId === dream.id;
              const colorClass = dream.element ? elementColors[dream.element.toLowerCase()] || '' : '';

              return (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white p-6 rounded-xl shadow-md cursor-pointer border hover:shadow-lg transition relative"
                  onClick={() => setExpandedId(isExpanded ? null : dream.id)}
                >
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(dream.date).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-start">
                    <p className="text-md text-indigo-700 line-clamp-2">
                      {dream.dream}
                    </p>
                    <div className="ml-2 mt-1">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {dream.element && (
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                      {dream.element.toUpperCase()}
                    </span>
                  )}

                  {(dream.phase || dream.archetype) && (
                    <div className="mt-1 text-xs text-indigo-400 italic">
                      {dream.phase && `• Phase: ${dream.phase}`} {dream.archetype && `• Archetype: ${dream.archetype}`}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-4 text-sm text-gray-600 space-y-2">
                      <p className="whitespace-pre-wrap">
                        {dream.insight || 'No insight recorded.'}
                      </p>
                      {dream.symbols?.length > 0 && (
                        <div className="text-xs text-purple-600 italic space-x-2">
                          🜁 Symbols:
                          {dream.symbols.map((symbol, i) => (
                            <Link
                              key={i}
                              href={`/dream-symbols?search=${encodeURIComponent(symbol)}`}
                              className="underline hover:text-purple-800"
                            >
                              {symbol}
                            </Link>
                          ))}
                        </div>
                      )}
                      {dream.tags?.length > 0 && (
                        <div className="text-xs text-gray-400 italic">
                          Tags: {dream.tags.join(', ')}
                        </div>
                      )}
                      <div className="mt-2">
                        <button
                          className="text-xs text-indigo-600 underline flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReflectingId(dream.id);
                            setReflectionText(dream.reflection || '');
                          }}
                        >
                          <Pencil size={14} /> Reflect on this dream
                        </button>
                        {reflectingId === dream.id && (
                          <div className="mt-2">
                            <textarea
                              className="w-full p-2 border rounded"
                              rows={3}
                              value={reflectionText}
                              onChange={(e) => setReflectionText(e.target.value)}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveReflection(dream.id);
                              }}
                              className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Save Reflection
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
