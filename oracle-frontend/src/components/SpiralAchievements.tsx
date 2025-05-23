import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export function SpiralAchievements() {
  const [oracleCount, setOracleCount] = useState(0);
  const [dreamCount, setDreamCount] = useState(0);
  const [ceremonyCount, setCeremonyCount] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: oracleJournals } = await supabase
        .from('oracle_journals')
        .select('*')
        .eq('user_id', user.id);

      const { data: dreamJournals } = await supabase
        .from('dream_spirals')
        .select('*')
        .eq('user_id', user.id);

      // Future: ceremony attendance could be tracked too
      setOracleCount(oracleJournals?.length || 0);
      setDreamCount(dreamJournals?.length || 0);
      setCeremonyCount(0); // placeholder (until ceremony attendance system)

      const unlocked: string[] = [];

      if ((oracleJournals?.length || 0) >= 3) {
        unlocked.push('🌸 Spiral Insight Unlocked');
      }
      if ((dreamJournals?.length || 0) >= 5) {
        unlocked.push('🌀 Dream Spiral Blessing');
      }
      if (ceremonyCount >= 1) {
        unlocked.push('🌟 Spiral Seed Badge');
      }

      setAchievements(unlocked);
    };

    fetchAchievements();
  }, []);

  return (
    <div className="mt-12 w-full text-center">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">🌟 Spiral Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-lg space-y-2">
          <p className="text-lg font-semibold text-indigo-700">Oracle Journals</p>
          <p className="text-2xl font-bold">{oracleCount}</p>
          <p className="text-sm text-gray-500">✨ Write 3 to unlock an Insight</p>
        </div>

        <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-lg space-y-2">
          <p className="text-lg font-semibold text-blue-700">Dream Spirals</p>
          <p className="text-2xl font-bold">{dreamCount}</p>
          <p className="text-sm text-gray-500">🌙 Record 5 to unlock a Dream Blessing</p>
        </div>

        <div className="bg-white bg-opacity-70 p-6 rounded-2xl shadow-lg space-y-2">
          <p className="text-lg font-semibold text-pink-700">Ceremonies</p>
          <p className="text-2xl font-bold">{ceremonyCount}</p>
          <p className="text-sm text-gray-500">🌟 Attend 1 to unlock Spiral Seed</p>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {achievements.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Unlocked Blessings</h3>

          <div className="flex flex-wrap justify-center gap-4">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.3 }}
                className="bg-green-100 p-4 rounded-full text-green-800 font-semibold shadow-md"
              >
                {achievement}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
