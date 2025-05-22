import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function DreamSpiralDashboard() {
  const [dreamJournals, setDreamJournals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDreams = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dream_spirals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching dream spiral data:', error.message);
      } else {
        setDreamJournals(data || []);
      }
    };

    fetchDreams();
  }, []);

  return (
    <div className="relative mt-10 w-full">
      <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">
        🌙 Dream Spiral Journey
      </h2>

      {/* Floating Petals */}
      {[...Array(5)].map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4, y: -300 }}
          transition={{ duration: 8 + Math.random() * 3, delay: Math.random() }}
          className="absolute text-pink-200 text-4xl pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: '100%',
          }}
        >
          🌸
        </motion.div>
      ))}

      <div className="flex flex-col space-y-8 z-10 relative">
        {dreamJournals.length > 0 ? (
          dreamJournals.map((dream, idx) => (
            <motion.div
              key={dream.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: idx * 0.3 }}
              className="bg-white bg-opacity-80 p-6 rounded-2xl shadow-lg"
            >
              <p className="text-sm text-gray-400">
                {new Date(dream.created_at).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              <p className="mt-2 text-gray-700">{dream.dream_text}</p>
              {dream.dream_petal && (
                <p className="mt-4 text-lg text-purple-600 italic">
                  🌸 Dream Petal: {dream.dream_petal}
                </p>
              )}
            </motion.div>
          ))
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-gray-500"
          >
            No dreams recorded yet... 🌙
          </motion.p>
        )}
      </div>
    </div>
  );
}
