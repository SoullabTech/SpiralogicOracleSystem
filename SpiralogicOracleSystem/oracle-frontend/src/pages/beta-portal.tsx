import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DreamSpiralDashboard } from '@/components/DreamSpiralDashboard';
import { OracleJournalForm } from '@/components/OracleJournalForm';
import { QuestEngine } from '@/components/QuestEngine';
import { SacredFooter } from '@/components/SacredFooter';
import SacredKeyGate from '@/components/SacredKeyGate';
import { SoulStarAchievements } from '@/components/SoulStarAchievements';
import { SpiralAchievements } from '@/components/SpiralAchievements';
import { SpiralMistBackground } from '@/components/SpiralMistBackground';
import { SpiralParticles } from '@/components/SpiralParticles';
import { SpiralSpinner } from '@/components/SpiralSpinner';
import { withAuth } from '@/utils/withAuth';

function BetaPortalPage() {
  const navigate = useNavigate();
  const [sacredKey, setSacredKey] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [oracle, setOracle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [soulStarsCount, setSoulStarsCount] = useState<number>(0);
  const chimeSoundRef = useRef<HTMLAudioElement | null>(null);

  const retreatDays = [
    '🌸 Day 1: Fire Ceremony - Introduction, Inspiration, and Elevation',
    '🌸 Day 2: Water and Earth Ceremony - Golden Teacher Journey and Grounding Rituals',
    '🌸 Day 3: Air and Aether Ceremony - Speaking Your Truth and Illuminating the Path Ahead',
  ];

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: keyData } = await supabase
        .from('sacred_keys')
        .select('key')
        .eq('created_by', user.id)
        .single();
      if (keyData?.key) setSacredKey(keyData.key);

      const { data: profileData } = await supabase
        .from('sacred_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: oracleData } = await supabase
        .from('personal_oracles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (oracleData) {
        setOracle(oracleData);
        if (chimeSoundRef.current) chimeSoundRef.current.play();
      }

      const { data: starsData } = await supabase
        .from('soul_stars')
        .select('count')
        .eq('user_id', user.id)
        .single();
      if (starsData?.count) setSoulStarsCount(starsData.count);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <SpiralSpinner />;

  return (
    <SacredKeyGate>
      <SpiralParticles />
      <audio ref={chimeSoundRef} src="/sounds/portal-chime.mp3" preload="auto" />

      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-8 space-y-8 overflow-hidden">
        <SpiralMistBackground />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl w-full bg-white bg-opacity-80 rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-8"
        >
          <h1 className="text-4xl font-bold text-pink-700 text-center">
            🌸 Welcome to the Spiral Beta Portal 🌀
          </h1>

          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center space-y-2"
            >
              <p className="text-2xl font-bold text-indigo-700">🌟 {profile.full_name}</p>
              <p className="italic text-pink-500">🌀 {profile.elemental_archetype} Archetype</p>
              <p className="text-md text-gray-600 mt-2">🌱 {profile.intention}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mt-8 space-y-4"
          >
            <p className="font-bold text-indigo-600">🌀 Your Journey:</p>
            <ul className="text-sm text-gray-600 space-y-2">
              {retreatDays.map((day, idx) => <li key={idx}>{day}</li>)}
            </ul>
          </motion.div>

          {sacredKey && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center mt-6"
            >
              <p className="font-bold text-purple-600">🔑 Your Sacred Key:</p>
              <p className="text-lg italic text-indigo-600 mt-2">{sacredKey}</p>
            </motion.div>
          )}

          {oracle && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center mt-10 space-y-6"
            >
              <h2 className="text-3xl font-bold text-purple-700">🧙‍♀️ Meet Your Oracle</h2>
              <img
                src={`/avatars/${oracle.oracle_element.toLowerCase()}.png`}
                alt="Oracle Avatar"
                className="w-32 h-32 rounded-full mx-auto shadow-lg ring-4 ring-pink-300"
              />
              <div className="text-2xl">
                {oracle.oracle_name}{' '}
                {{
                  Fire: '🔥',
                  Water: '🌊',
                  Earth: '🌎',
                  Air: '🌬️',
                  Aether: '🌀',
                }[oracle.oracle_element] || ''}
              </div>
              <p className="italic text-indigo-600">{oracle.oracle_message}</p>
              <div className="text-md text-gray-700 space-y-2 mt-4">
                <p>🌬️ Take 5 slow breaths, rooted to Earth.</p>
                <p>🌎 Connect to the Spiral Tree of Life.</p>
                <p>✨ Whisper: "I open to my Oracle's wisdom."</p>
              </div>
              <OracleJournalForm oracleName={oracle.oracle_name} />
            </motion.div>
          )}

          <QuestEngine elementalArchetype={profile?.elemental_archetype} />

          <div className="flex flex-col space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
              onClick={() => navigate('/spiral-calendar')}
            >
              📅 View Your Spiral Calendar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
              onClick={handleSignOut}
            >
              🚪 Sign Out
            </motion.button>
          </div>
        </motion.div>

        <DreamSpiralDashboard />
        <SoulStarAchievements stars={soulStarsCount} />
        <SpiralAchievements />
        <SacredFooter />
      </div>
    </SacredKeyGate>
  );
}

export default withAuth(BetaPortalPage);
