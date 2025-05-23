'use client';

import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface PetalModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;         // ✅ NEW: trigger parent logic (AetherPulse)
  petal: string;
  element: string;
  prompt: string;
  userId: string;
  mode: 'state' | 'phase';
}

export default function PetalModal({
  open,
  onClose,
  onSave,
  petal,
  element,
  prompt,
  userId,
  mode,
}: PetalModalProps) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveReflection = async () => {
    setSaving(true);
    const { error } = await supabase.from('spiralogic_reflections').insert([
      {
        petal,
        element,
        note,
        user_id: userId,
        mode,
      },
    ]);
    setSaving(false);
    if (!error) {
      setSaved(true);
      onSave?.(); // ✅ trigger parent update
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white w-full max-w-lg mx-4 rounded-xl shadow-lg p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-purple-700 mb-2">🌸 {petal}</h2>
            <p className="text-sm text-gray-600 italic mb-4">Element: {element}</p>
            <p className="text-sm text-indigo-600 mb-2">🪞 {prompt}</p>

            <textarea
              className="w-full p-3 border rounded text-sm"
              rows={4}
              placeholder="Your reflection..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              onClick={saveReflection}
              disabled={saving || !note.trim()}
              className={`mt-4 px-4 py-2 rounded text-sm transition ${
                saving || saved
                  ? 'bg-indigo-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Reflection'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
