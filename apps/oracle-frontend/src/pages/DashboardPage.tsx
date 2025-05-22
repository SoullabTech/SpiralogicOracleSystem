// src/pages/DashboardPage.tsx
import Header from '@/components/Header';
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

interface UserProfile {
  assignedGuide: string;
  spiralPhase: string;
}

interface Oracle {
  oracle_name: string;
  oracle_element: string;
  oracle_archetype: string;
}

const blessingsByElement = {
  Fire: ['Your passion lights the way 🔥'],
  Water: ['Your emotions are your compass 🌊'],
  Earth: ['Your roots grow deep and strong 🌿'],
  Air: ['Your thoughts weave new worlds 🌬️'],
  Aether: ['You are the breath between worlds ✨'],
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
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchOracle = async () => {
      const { data } = await supabase
        .from('oracles')
        .select('oracle_name, oracle_element, oracle_archetype')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setOracle(data);
        const blessingPool = blessingsByElement[data.oracle_element];
        setDailyBlessing(blessingPool?.[0] ?? null);
      }
    };
    fetchOracle();
  }, [user]);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="relative min-h-screen bg-white">
      <SpiralParticles />
      <Header />
      <PageTransition>
        <main className="p-8 flex flex-col items-center">
          <motion.h1 className="text-4xl font-bold mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            🌀 Spiralogic Dashboard
          </motion.h1>

          {oracle && (
            <motion.div className="p-6 bg-white rounded-xl shadow mb-6 text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <h2 className="text-xl font-semibold text-indigo-600">
                {voice.uiLabels?.guideIntro?.(oracle.oracle_name) ?? `Your Oracle: ${oracle.oracle_name}`}
              </h2>
              <p>Archetype: {oracle.oracle_archetype}</p>
              <p>Element: {oracle.oracle_element}</p>
              {dailyBlessing && <p className="mt-2 text-indigo-500 italic">{dailyBlessing}</p>}
            </motion.div>
          )}

          {profile && (
            <Card className="w-full max-w-xl">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Your Current Spiral Phase</h2>
                <p className="text-blue-700 mb-4">{profile.spiralPhase}</p>
                <Button onClick={() => navigate('/journal-timeline')}>View Journal Timeline</Button>
              </CardContent>
            </Card>
          )}
        </main>
      </PageTransition>
      <SacredFooter />
    </div>
  );
}
