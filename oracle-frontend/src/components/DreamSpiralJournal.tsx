import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const dreamPetals = [
  '🌸 Vision of New Beginnings',
  '🌀 Whispers of Ancestral Wisdom',
  '🌿 Seeds of Healing',
  '🌞 Illuminated Pathways',
  '🌈 Unfolding Miracles',
];

export function DreamSpiralJournal() {
  const [dream, setDream] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dreamBlessing, setDreamBlessing] = useState<string | null>(null);
  const [dreamJournals, setDreamJournals] = useState<any[]>([]);

  const fetchDreams = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('dream_spirals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dreams:', error.message);
    } else {
      setDreamJournals(data || []);
    }
  };

  useEffect(() => {
    fetchDreams();
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
      .from('dream_spirals')
      .insert([{ user_id: user.id, dream_text: dream }]);

    if (error) {
      console.error('Error saving dream:', error.message);
    } else {
      setDreamBlessing(dreamPetals[Math.floor(Math.random() * dreamPetals.length)]);
      setSubmitted(true);
      setDream('');
      fetchDreams();
    }
  };

  const drawAnotherDreamPetal = () => {
    setDreamBlessing(dreamPetals[Math.floor(Math.random() * dreamPetals.length)]);
  };

  return (
    <div className="relative flex flex-col space-y-10 mt-6 items-center">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        🌙 Dream Spiral Journal
      </h2>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">
          <textarea
            className="border border-blue-300 rounded-lg px-4 py-2 h-32 bg-blue-50"
            placeholder="Record your sacred dream here..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            🌙 Save Dream
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
            <p className="text-2xl font-bold text-indigo-700">🌸 Your dream has been honored.</p>
            <p className="text-xl italic text-blue-600">{dreamBlessing}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
              onClick={drawAnotherDreamPetal}
            >
              🌸 Draw Another Dream Petal
            </motion.button>
          </motion.div>

          {/* Floating Dream Petals */}
          {[...Array(5)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -300 }}
              transition={{ duration: 5 + Math.random() * 2, delay: Math.random() * 1 }}
              className="absolute text-blue-300 text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
              }}
            >
              🌸
            </motion.div>
          ))}
        </>
      )}

      {/* Dream Journal History */}
      {dreamJournals.length > 0 && (
        <div className="w-full mt-10">
          <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">
            📜 Your Dream Reflections
          </h3>
          <ul className="space-y-6">
            {dreamJournals.map((dreamEntry) => (
              <li key={dreamEntry.id} className="bg-white bg-opacity-70 p-4 rounded-xl shadow-md">
                <p className="text-sm text-gray-400">
                  {new Date(dreamEntry.created_at).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="mt-2 text-gray-700">{dreamEntry.dream_text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
