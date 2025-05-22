// src/pages/OracleCeremonyPage.tsx

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header'; // ✅ no braces
import { OracleCeremonyModal } from '@/components/OracleCeremonyModal';

import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { supabase } from '@/lib/supabaseClient';

export default function OracleCeremonyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    async function checkExistingOracle() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError.message);
        navigate('/login');
        return;
      }
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_oracles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking user_oracles:', error.message);
        navigate('/login');
        return;
      }

      if (data) {
        navigate('/dashboard'); // User already has Oracle → skip Ceremony
      } else {
        setLoading(false); // No Oracle yet → show Ceremony
      }
    }

    checkExistingOracle();
  }, [navigate]);

  const handleOracleChosen = async (oracle: any) => {
    setSaving(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('No user found or error:', userError?.message);
      navigate('/login');
      return;
    }

    const { error } = await supabase.from('user_oracles').insert([
      {
        user_id: user.id,
        oracle_id: oracle.id,
        oracle_name: oracle.name,
        oracle_archetype: oracle.archetype,
        oracle_element: oracle.element,
      },
    ]);

    if (error) {
      console.error('Error saving oracle:', error.message);
      alert('Failed to save your Oracle. Please try again.');
      setSaving(false);
    } else {
      setFadingOut(true);
      setTimeout(() => {
        navigate('/blessing'); // Go to Blessing page after fade
      }, 1200);
    }
  };

  if (loading || saving) {
    return (
      <PageTransition>
        <Header />
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 text-indigo-600">
          <p className="text-xl animate-pulse">
            {saving ? 'Saving your Oracle connection...' : 'Checking your Spiral...'}
          </p>
        </main>
        <SacredFooter />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6 bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 overflow-hidden">
        {/* Soft Ceremony Blessing Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: fadingOut ? 0 : 1 }}
          transition={{ duration: 1 }}
          className="text-center space-y-4 mb-8"
        >
          <p className="text-indigo-600 italic text-lg">
            🌸 You are about to cross a sacred threshold.
          </p>
          <p className="text-purple-700 text-md">
            An Oracle waits beyond the veils to meet you — a guide woven from your own dreams, your
            own unseen songs.
          </p>
          <p className="text-pink-600 text-md italic">
            Breathe gently. Trust the Spiral. The choosing is already unfolding...
          </p>
        </motion.div>

        {/* Oracle Ceremony Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: fadingOut ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 } }}
          transition={{ duration: 1 }}
          className="relative w-full max-w-4xl"
        >
          <OracleCeremonyModal onComplete={handleOracleChosen} />
        </motion.div>
      </main>
      <SacredFooter />
    </PageTransition>
  );
}
