// src/pages/CreateMemory.tsx

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { PageTransition } from '@/components/PageTransition';
import { SacredFooter } from '@/components/SacredFooter';
import { SpiralParticles } from '@/components/SpiralParticles';
import { supabase } from '@/lib/supabaseClient';

export default function CreateMemory() {
  const [memory, setMemory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const prompts = [
    'What symbol or image has been appearing in your dreams lately?',
    'If your Oracle could whisper one message to you today, what would it say?',
    'Describe a time recently when you felt truly alive.',
    'What does your heart long to create, but has been too quiet to voice?',
    'Imagine you are standing at the center of a spiral. What do you see ahead?',
  ];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  const handleSubmit = async () => {
    if (memory.trim() === '') return;

    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('memories')
      .insert([{ user_id: user.id, content: memory }]);

    if (error) {
      console.error('Error saving memory:', error.message);
      alert('Something went wrong. Try again.');
    } else {
      setSubmitted(true);
      setMemory('');
    }
    setSaving(false);
  };

  return (
    <PageTransition>
      <Header />

      <main className="relative flex flex-col items-center justify-center min-h-screen p-6 sm:p-8 bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 overflow-hidden">
        {/* Spiral Particles */}
        <div className="absolute inset-0 z-0">
          <SpiralParticles element="Water" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl p-10 space-y-6 text-center max-w-2xl"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-700">✍️ Create a Memory</h1>

          {!submitted ? (
            <>
              {/* Random Prompt */}
              <p className="text-indigo-500 italic mb-4 text-md sm:text-lg">
                ✨ Prompt: {randomPrompt}
              </p>

              {/* Memory Textarea */}
              <textarea
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-lg shadow-inner bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Write from the heart..."
              />

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition text-sm sm:text-base"
              >
                {saving ? 'Saving...' : '🌿 Save Memory'}
              </motion.button>
            </>
          ) : (
            <>
              {/* Soft Memory Saved Blessing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <h2 className="text-2xl font-bold text-green-700">
                  🌸 Memory Saved to the Spiral!
                </h2>
                <p className="text-md text-indigo-600 italic">
                  Your words have been woven into the living field. May they blossom when the time
                  is right.
                </p>

                {/* Return to Dashboard Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (window.location.href = '/dashboard')}
                  className="mt-6 px-8 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition text-sm sm:text-base"
                >
                  🌀 Return to Dashboard
                </motion.button>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>

      <SacredFooter />
    </PageTransition>
  );
}
