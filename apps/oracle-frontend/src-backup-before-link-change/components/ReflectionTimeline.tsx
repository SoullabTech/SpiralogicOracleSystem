'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ReflectionEntry {
  id: number;
  petal: string;
  element: string;
  quote: string;
  note: string;
  mode: 'state' | 'phase';
  created_at: string;
}

export default function ReflectionTimeline() {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);

  useEffect(() => {
    const fetchReflections = async () => {
      const { data, error } = await supabase
        .from('spiralogic_reflections')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) setReflections(data);
    };

    fetchReflections();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h2 className="text-3xl text-center font-bold text-purple-700 mb-6">🌀 Spiral Reflection Timeline</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reflections.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/90 border rounded-xl p-5 shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</p>
              <span className={`text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700`}>
                {entry.mode.toUpperCase()}
              </span>
            </div>

            <h3 className="text-md font-bold text-purple-700">{entry.petal}</h3>
            <p className="text-xs italic text-gray-400 mb-1">Element: {entry.element}</p>

            <p className="text-sm text-indigo-800 mb-2">🪞 {entry.note}</p>
            <p className="text-xs text-gray-500">“{entry.quote}”</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
