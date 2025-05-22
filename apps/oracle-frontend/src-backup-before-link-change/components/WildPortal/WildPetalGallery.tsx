import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function WildPetalGallery() {
  const [wildPetals, setWildPetals] = useState<any[]>([]);

  useEffect(() => {
    const fetchWildPetals = async () => {
      const { data, error } = await supabase
        .from('spiral_breaths')
        .select('wild_petals, date')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching Wild Petals:', error.message);
      } else {
        // Flatten all wild_petals into a single list
        const petals = data.flatMap((entry) =>
          (entry.wild_petals || []).map((petal: string) => ({
            message: petal,
            date: entry.date,
          })),
        );
        setWildPetals(petals);
      }
    };

    fetchWildPetals();
  }, []);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <h1 className="text-4xl font-bold text-indigo-700 mb-10">
        🌸 Wild Petal Blessings Archive 🌀
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {wildPetals.map((petal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white bg-opacity-80 rounded-2xl shadow-xl p-6 flex flex-col justify-between items-center text-center"
          >
            <p className="text-lg italic text-indigo-600 mb-4">"{petal.message}"</p>
            <p className="text-xs text-gray-500">{new Date(petal.date).toLocaleDateString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
