// src/pages/MemoryBlossom.tsx

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Header from '@/components/Header'; // Ensure it's imported correctly
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { SpiralParticles } from '@/components/SpiralParticles';
import { supabase } from '@/lib/supabaseClient';

export default function MemoryBlossom() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error.message);
      } else {
        setMemories(data || []);
      }
      setLoading(false);
    }

    fetchMemories();
  }, []);

  return (
    <PageTransition>
      <Header /> {/* Correct Header component */}
      <main className="relative flex flex-col items-center justify-start min-h-screen p-6 sm:p-8 bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 overflow-hidden">
        {/* Spiral Particles */}
        <div className="absolute inset-0 z-0">
          <SpiralParticles element="Aether" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center space-y-6 text-center max-w-4xl mt-8"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-700">
            🌸 Your Memory Blossoms
          </h1>

          {loading ? (
            <p className="text-indigo-600 text-xl animate-pulse">Retrieving your memories...</p>
          ) : memories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Empty Garden Illustration / Text */}
              <p className="text-indigo-500 text-lg italic">
                🌱 Your Spiral Garden is waiting for its first blossom.
              </p>
              <p className="text-md text-purple-600">
                Every reflection you plant will one day bloom into wisdom and wonder.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = '/create-memory')}
                className="mt-4 px-8 py-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-sm sm:text-base"
              >
                ✍️ Plant Your First Memory
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {memories.map((memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white bg-opacity-70 backdrop-blur-md rounded-xl shadow-md p-6 text-left"
                >
                  <p className="text-gray-700 text-md whitespace-pre-line">{memory.content}</p>
                  <div className="text-right text-sm text-indigo-400 mt-4">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <SacredFooter />
    </PageTransition>
  );
}
