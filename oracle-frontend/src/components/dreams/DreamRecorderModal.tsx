'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function DreamRecorderModal({ onClose }: { onClose: () => void }) {
  const [dream, setDream] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await supabase.from('spiral_breaths').insert([
      {
        dream,
        element: 'aether',
        type: 'dream',
        emotion: 'mystical',
        created_at: new Date().toISOString(),
      },
    ]);
    setDream('');
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-xl font-bold mb-4 text-purple-700">🌙 Record a Dream</h2>
        <textarea
          className="w-full border rounded p-3 mb-4 text-sm"
          rows={5}
          placeholder="Describe your dream..."
          value={dream}
          onChange={(e) => setDream(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 hover:underline">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !dream.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Dream
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
