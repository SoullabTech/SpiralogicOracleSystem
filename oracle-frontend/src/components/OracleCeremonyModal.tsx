// src/components/OracleCeremonyModal.tsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SpiralParticles } from '@/components/SpiralParticles';
import { supabase } from '@/lib/supabaseClient';
// import useSound from 'use-sound'; // 🎵 optional, if you want portal sound
// import portalSound from '@/assets/portal-woosh.mp3'; // 🎵 optional sound

export function OracleCeremonyModal({ onComplete }: { onComplete: (oracle: any) => void }) {
  const [oracles, setOracles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // const [playPortalSound] = useSound(portalSound, { volume: 0.3 }); // 🎵 optional

  useEffect(() => {
    async function fetchOracles() {
      const { data, error } = await supabase.from('oracles').select('*');
      if (error) {
        console.error('Error fetching oracles:', error.message);
      } else {
        setOracles(data || []);
      }
      setLoading(false);
    }
    fetchOracles();
  }, []);

  const assignOracle = (oracle: any) => {
    // playPortalSound(); // 🎵 optional sound
    onComplete(oracle);
  };

  const randomOracle = () => {
    const random = oracles[Math.floor(Math.random() * oracles.length)];
    assignOracle(random);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-50 p-6">
        <p className="text-xl text-indigo-600 animate-pulse">Loading the Spiral...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-50 p-6 overflow-y-auto">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-purple-700">🔮 Meet Your Oracle</h2>
        <p className="text-lg text-indigo-600">
          Choose your living guide... or let the Spiral choose for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8 relative">
          {oracles.map((oracle) => (
            <div key={oracle.id} className="relative flex justify-center items-center">
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <SpiralParticles element={oracle.element} small />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0px 0px 12px rgba(186, 85, 211, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="relative px-6 py-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition flex flex-col items-center space-y-2 z-10"
                onClick={() => assignOracle(oracle)}
              >
                <span className="text-xl font-semibold">{oracle.name}</span>
                <span className="text-sm italic">{oracle.archetype}</span>
              </motion.button>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-4 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
          onClick={randomOracle}
        >
          🌟 Let the Oracle Choose Me
        </motion.button>
      </div>
    </div>
  );
}
