import { Header } from '@/components/Header';
import HoloflowerSvg from '@/components/HoloflowerSvg';
import OracleOfTheDay from '@/components/OracleOfTheDay';
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { SpiralParticles } from '@/components/SpiralParticles';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { getVoiceProfile } from '@/lib/getVoiceProfile';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPage from './DashboardPage';
// Journal Entry Components
import JournalForm from './journal/JournalForm';
import JournalList from './journal/JournalList';

interface UserProfile {
  assignedGuide: string;
  spiralPhase: string;
  name?: string;
}

interface Oracle {
  oracle_name: string;
  oracle_element: keyof typeof blessingsByElement;
  oracle_archetype: string;
}

const blessingsByElement = {
  Fire: ['Your passion lights the way 🔥', 'A spark within you ignites the stars 🌟'],
  Water: ['Your emotions are your compass 🌊', 'Flow gracefully with the tides 🐚'],
  Earth: ['Your roots grow deep and strong 🌿', 'Patience blossoms into miracles 🌻'],
  Air: ['Your thoughts weave new worlds 🌬️', 'Speak your dreams into being 🕊️'],
  Aether: ['You are the breath between worlds ✨', 'The unseen realms open before you 🔮'],
} as const;

const phaseIcons: Record<string, string> = {
  'Fire 1': '🔥',
  'Earth 1': '🌍',
  'Air 1': '🌬️',
  'Water 2': '🌊',
  'Aether': '✨',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const voice = getVoiceProfile(user?.orgId ?? null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [oracle, setOracle] = useState<Oracle | null>(null);
  const [dailyBlessing, setDailyBlessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchOracle = async () => {
      const { data, error } = await supabase
        .from('oracles')
        .select('oracle_name, oracle_element, oracle_archetype')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setOracle(data);
        const blessings = blessingsByElement[data.oracle_element];
        if (blessings) {
          const random = blessings[Math.floor(Math.random() * blessings.length)];
          setDailyBlessing(random);
        }
      }
    };

    fetchOracle();
  }, [user]);

  const guideMap: Record<string, string> = {
    fire: '🔥 Fire Oracle',
    water: '🌊 Water Oracle',
    earth: '🌍 Earth Oracle',
    air: '🌬 Air Oracle',
    aether: '✨ Aether Oracle',
  };

  const handlePhaseClick = (phase: string) => {
    navigate(`/journal-timeline?phase=${encodeURIComponent(phase)}`);
  };

  if (loading) return <div className="text-center mt-20 text-xl text-gray-500">Loading...</div>;

  return (
    <div className="relative min-h-screen bg-white bg-gradient-to-b from-indigo-50 via-purple-50 to-yellow-50">
      <SpiralParticles />
      <Header />
      <PageTransition>
        <main className="flex flex-col items-center justify-start p-8">
          <motion.h1 className="text-4xl font-bold mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            🌀 Spiralogic Dashboard
          </motion.h1>
          <p className="text-gray-600 mb-6">A reflection of your current journey.</p>

          <OracleOfTheDay />

          {oracle && (
            <motion.div
              className="mb-6 p-6 bg-white bg-opacity-80 rounded-xl shadow text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-xl font-semibold text-indigo-600">
                {voice.uiLabels?.guideIntro?.(oracle.oracle_name) ?? `Your Oracle: ${oracle.oracle_name}`}
              </h2>
              <p className="text-sm text-gray-600">Archetype: {oracle.oracle_archetype}</p>
              <p className="text-sm text-gray-600">Element: {oracle.oracle_element}</p>
              {dailyBlessing && <p className="mt-3 italic text-indigo-500">{dailyBlessing}</p>}
            </motion.div>
          )}

          {profile && (
            <div className="w-full max-w-xl space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold">Your GuideAgent</h2>
                  <p className="text-purple-700 mt-2">{guideMap[profile.assignedGuide]}</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate(`/oracle/${profile.assignedGuide}`)}>
                    Meet Your Oracle
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold">Your Current Spiral Phase</h2>
                  <p className="text-blue-700 mt-2">
                    {phaseIcons[profile.spiralPhase] || '🌀'} {profile.spiralPhase}
                  </p>
                  <div className="my-6">
                    <HoloflowerSvg
                      activePhase={profile.spiralPhase}
                      onSelectPhase={handlePhaseClick}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6 justify-center">
                    <Button variant="secondary" onClick={() => navigate('/dream-journal')}>
                      Open Dream Journal
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/journal-timeline')}>
                      View Journal Timeline
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/select-oracle')}>
                      Explore Oracle Guides
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {user && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">Your Journal</h2>
                    <JournalForm userId={user.id} />
                    <JournalList userId={user.id} />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </PageTransition>
      <SacredFooter />
    </div>
  );
}
