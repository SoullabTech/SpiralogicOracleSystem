'use client';

import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { RefreshCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OracleMessage {
  id: number;
  message: string;
  element?: string;
  archetype?: string;
  created_at: string;
}

export default function OracleOfTheDay() {
  const [oracle, setOracle] = useState<OracleMessage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOracle();
  }, []);

  const fetchOracle = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('oracle_daily')
      .select('*')
      .eq('created_at', today)
      .limit(1)
      .single();

    if (error || !data) {
      // fallback dynamic generation (simulate for now)
      setOracle({
        id: 0,
        message: 'Trust the spiral. What seems unclear now is preparing you for integration.',
        element: 'Aether',
        archetype: 'Oracle',
        created_at: today,
      });
    } else {
      setOracle(data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-tr from-indigo-100 to-purple-200 rounded-3xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-purple-700 flex items-center gap-1">
          <Sparkles className="text-yellow-500" size={18} /> Oracle of the Day
        </h2>
        <button
          onClick={fetchOracle}
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {oracle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-700"
        >
          <p className="italic">"{oracle.message}"</p>
          <div className="mt-2 text-xs text-indigo-500">
            {oracle.element && <>Element: {oracle.element}</>} {oracle.archetype && <>• Archetype: {oracle.archetype}</>}
          </div>
        </motion.div>
      )}

      {loading && <p className="text-xs text-gray-400 mt-2">Loading oracle...</p>}
    </div>
  );
}
