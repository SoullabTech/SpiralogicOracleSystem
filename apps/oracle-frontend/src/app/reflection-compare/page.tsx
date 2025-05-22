'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface ReflectionEntry {
  id: number;
  petal: string;
  element: string;
  quote: string;
  note: string;
  mode: 'state' | 'phase';
  created_at: string;
}

export default function ReflectionComparePage() {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [grouped, setGrouped] = useState<
    Record<string, { state?: ReflectionEntry; phase?: ReflectionEntry }>
  >({});

  useEffect(() => {
    const fetchReflections = async () => {
      const { data, error } = await supabase
        .from('spiralogic_reflections')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const groupedData: Record<string, { state?: ReflectionEntry; phase?: ReflectionEntry }> = {};
        data.forEach((entry) => {
          if (!groupedData[entry.petal]) groupedData[entry.petal] = {};
          groupedData[entry.petal][entry.mode] = entry;
        });
        setReflections(data);
        setGrouped(groupedData);
      }
    };

    fetchReflections();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl text-center font-bold text-purple-700">
            🌸 Spiralogic Petal Reflections: State vs. Phase
          </h2>
          <Link
            href="/dashboard"
            className="text-sm text-indigo-600 underline hover:text-indigo-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {Object.entries(grouped).map(([petal, modes], i) => (
            <motion.div
              key={petal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/90 border rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-bold text-purple-700 mb-1">{petal}</h3>
              <p className="text-xs text-gray-500 mb-3">
                Element: {modes.state?.element || modes.phase?.element}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-indigo-200 rounded p-4 bg-indigo-50">
                  <h4 className="text-sm font-semibold text-indigo-700 mb-1">🌿 State Reflection</h4>
                  {modes.state ? (
                    <>
                      <p className="text-sm text-gray-700 mb-2">“{modes.state.note}”</p>
                      <p className="text-xs text-gray-500 italic">— {modes.state.quote}</p>
                    </>
                  ) : (
                    <p className="text-xs italic text-gray-400">No state reflection yet.</p>
                  )}
                </div>

                <div className="border border-purple-200 rounded p-4 bg-purple-50">
                  <h4 className="text-sm font-semibold text-purple-700 mb-1">🌀 Phase Reflection</h4>
                  {modes.phase ? (
                    <>
                      <p className="text-sm text-gray-700 mb-2">“{modes.phase.note}”</p>
                      <p className="text-xs text-gray-500 italic">— {modes.phase.quote}</p>
                    </>
                  ) : (
                    <p className="text-xs italic text-gray-400">No phase reflection yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
