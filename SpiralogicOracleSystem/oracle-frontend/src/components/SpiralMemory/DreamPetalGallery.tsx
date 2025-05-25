import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // adjust if needed

const elementColors: { [key: string]: string } = {
  Fire: 'bg-red-400',
  Water: 'bg-blue-400',
  Earth: 'bg-green-400',
  Air: 'bg-sky-300',
  Aether: 'bg-purple-500',
};

export default function DreamPetalGallery() {
  const [dreamBreaths, setDreamBreaths] = useState<any[]>([]);

  useEffect(() => {
    const fetchDreams = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('*')
        .neq('dream', null)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching dreams:', error.message);
      } else {
        setDreamBreaths(data || []);
      }
    };

    fetchDreams();
  }, []);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <h1 className="text-4xl font-bold text-indigo-700 mb-10">🌙 Dream Spiral Journal 📖✨</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {dreamBreaths.map((breath) => (
          <motion.div
            key={breath.id}
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-2xl shadow-xl bg-white bg-opacity-80 flex flex-col items-center justify-between ${elementColors[breath.dream_petal] || 'bg-gray-100'}`}
          >
            <p className="italic text-center text-gray-700 mb-4">"{breath.dream}"</p>

            {breath.dream_petal && (
              <div className="text-3xl font-bold mt-2">🌀 {breath.dream_petal}</div>
            )}

            <p className="mt-4 text-xs text-gray-500">
              {new Date(breath.date).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
