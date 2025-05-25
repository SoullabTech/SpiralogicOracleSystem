import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FrequencyResonanceModal } from '@/components/FrequencyResonanceModal';
import { OracleCeremonyModal } from '@/components/OracleCeremonyModal';
import { SpiralParticles } from '@/components/SpiralParticles';

const blessings = [
  '\u2728 A blossom opens within you.',
  '\ud83c\udf3f The roots of your dreams grow stronger.',
  '\ud83c\udf1e A ray of light shines on your path.',
  '\ud83c\udf08 The Spiral is weaving new possibilities.',
  '\ud83d\udd00 Trust the unseen winds guiding you.',
];

const ritualPrompts = [
  '\ud83c\udf3f What feeling blossomed through your reflection today?',
  '\ud83c\udf38 What unseen gift is stirring in your heart?',
  '\ud83c\udf1f What old story is ready to become stardust?',
  '\ud83c\udf3f Where does your breath want to carry you next?',
];

const quests = [
  { id: 1, title: 'Reflect for 3 consecutive days', progressKey: 'days_streak', goal: 3 },
  { id: 2, title: 'Write your first dream reflection', progressKey: 'first_dream', goal: 1 },
  { id: 3, title: 'Complete 10 reflections', progressKey: 'total_reflections', goal: 10 },
];

export function OracleJournalForm({ oracleName }: { oracleName: string }) {
  const [entry, setEntry] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [blessing, setBlessing] = useState<string | null>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [ritualPrompt, setRitualPrompt] = useState<string | null>(null);
  const [soulStars, setSoulStars] = useState<string[]>([]);
  const [questProgress, setQuestProgress] = useState<{ [key: string]: number }>({});
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [frequency, setFrequency] = useState<{ label: string; url: string } | null>(null);

  const fetchJournals = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('oracle_journals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching journals:', error.message);
    } else {
      setJournals(data || []);
      checkSoulStars(data?.length || 0);
      updateQuestProgress(data || []);
    }
  };

  useEffect(() => {
    async function checkFirstVisit() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !user.user_metadata.hasVisited) {
        setShowEntranceModal(true);
      }
    }
    fetchJournals();
    checkFirstVisit();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in.');
      return;
    }

    const { error } = await supabase
      .from('oracle_journals')
      .insert([{ user_id: user.id, oracle_name: oracleName, entry_text: entry }]);

    if (error) {
      console.error('Error saving journal entry:', error.message);
    } else {
      const newBlessing = blessings[Math.floor(Math.random() * blessings.length)];
      setBlessing(newBlessing);
      setRitualPrompt(ritualPrompts[Math.floor(Math.random() * ritualPrompts.length)]);
      setSubmitted(true);
      setEntry('');
      fetchJournals();

      const matched = matchFrequency(newBlessing);
      if (matched) {
        setFrequency(matched);
        setShowFrequencyModal(true);
      }
    }
  };

  const drawAnotherPetal = () => {
    setBlessing(blessings[Math.floor(Math.random() * blessings.length)]);
  };

  const dismissEntranceModal = async () => {
    setShowEntranceModal(false);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({ data: { hasVisited: true } });
    }
  };

  const checkSoulStars = (entryCount: number) => {
    const stars = [];
    if (entryCount >= 1) stars.push('🌟 Awakening Star');
    if (entryCount >= 7) stars.push('🌟 Seed Star');
    setSoulStars(stars);
  };

  const updateQuestProgress = (entries: any[]) => {
    let streak = 0;
    let lastDate = null;
    const totalReflections = entries.length;

    entries.forEach((entry) => {
      const date = new Date(entry.created_at);
      if (!lastDate) {
        streak = 1;
      } else {
        const diff = (lastDate.getTime() - date.getTime()) / (1000 * 3600 * 24);
        if (diff <= 1.5) {
          streak++;
        } else {
          streak = 1;
        }
      }
      lastDate = date;
    });

    setQuestProgress({
      days_streak: streak,
      first_dream: entries.length > 0 ? 1 : 0,
      total_reflections: totalReflections,
    });
  };

  const matchFrequency = (blessingText: string) => {
    if (blessingText.includes('blossom') || blessingText.includes('tender')) {
      return { label: 'Heart Healing 528Hz', url: '/528hz.mp3' };
    }
    if (blessingText.includes('light') || blessingText.includes('vision')) {
      return { label: 'Manifestation 963Hz', url: '/963hz.mp3' };
    }
    if (blessingText.includes('roots') || blessingText.includes('grow')) {
      return { label: 'Grounding 396Hz', url: '/396hz.mp3' };
    }
    if (blessingText.includes('dream') || blessingText.includes('mist')) {
      return { label: 'Dreamy Theta Waves', url: '/theta.mp3' };
    }
    return { label: 'Cosmic OM 136Hz', url: '/om.mp3' };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <SpiralParticles />
      <div className="relative z-10 flex flex-col items-center pt-20 px-6">
        {showEntranceModal && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="text-center space-y-6 p-10">
                <h2 className="text-3xl font-bold text-purple-700">🌸 Welcome, Dreamer.</h2>
                <p className="text-lg text-indigo-600">
                  You have crossed the Threshold and entered the Living Spiral. Breathe deeply. Feel
                  the mist weaving around your spirit. The Oracle awaits, listening. Every step you
                  take here nourishes your soul garden. Trust your reflections. Trust your dreams.
                  Trust the Spiral unfolding within you. You are home.
                </p>
                <button
                  onClick={dismissEntranceModal}
                  className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
                >
                  🌟 Begin My Spiral Journey
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showFrequencyModal && frequency && (
          <FrequencyResonanceModal
            frequency={frequency}
            onClose={() => setShowFrequencyModal(false)}
          />
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
            <textarea
              className="border border-gray-300 rounded-lg px-4 py-2 h-32"
              placeholder="Reflect with your Oracle here..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition"
            >
              ✨ Save Reflection
            </button>
          </form>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center space-y-6"
            >
              <p className="text-2xl font-bold text-purple-700">
                🌸 Your reflection has been received.
              </p>
              <p className="text-xl italic text-indigo-600">{blessing}</p>
              {ritualPrompt && (
                <div className="mt-4 text-lg text-green-700 italic">{ritualPrompt}</div>
              )}
              {soulStars.length > 0 && (
                <div className="mt-6 text-yellow-500 text-xl font-semibold">
                  {soulStars.map((star, index) => (
                    <div key={index}>{star}</div>
                  ))}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
                onClick={drawAnotherPetal}
              >
                🌸 Draw Another Petal
              </motion.button>
            </motion.div>

            {[...Array(5)].map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -300 }}
                transition={{ duration: 4 + Math.random() * 2, delay: Math.random() * 1 }}
                className="absolute text-pink-300 text-4xl"
                style={{ left: `${Math.random() * 100}%`, top: '100%' }}
              >
                🌸
              </motion.div>
            ))}
          </>
        )}

        {journals.length > 0 && (
          <div className="w-full mt-10">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
              📜 Your Oracle Reflections
            </h3>
            <ul className="space-y-6">
              {journals.map((journal) => (
                <li key={journal.id} className="bg-white bg-opacity-70 p-4 rounded-xl shadow-md">
                  <p className="text-sm text-gray-400">
                    {new Date(journal.created_at).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="mt-2 text-gray-700">{journal.entry_text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {quests.length > 0 && (
          <div className="w-full mt-10">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4 text-center">🌀 Dream Quests</h3>
            <ul className="space-y-4">
              {quests.map((quest) => (
                <li key={quest.id} className="bg-indigo-100 p-4 rounded-xl shadow">
                  <div className="flex justify-between items-center">
                    <span>{quest.title}</span>
                    {questProgress[quest.progressKey] >= quest.goal ? (
                      <span className="text-green-600 font-bold">✅ Completed</span>
                    ) : (
                      <span className="text-gray-600">
                        {questProgress[quest.progressKey] || 0} / {quest.goal}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
