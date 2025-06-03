'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import type { CrystalFocusType } from '@/lib/database.types';

const FOCUS_TYPES: CrystalFocusType[] = [
  'career',
  'spiritual',
  'relational',
  'health',
  'creative',
  'other',
];

export default function CrystalFocusEditor() {
  const { user } = useUser();
  const [type, setType] = useState<CrystalFocusType>('spiritual');
  const [challenges, setChallenges] = useState('');
  const [aspirations, setAspirations] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadFocus = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('elemental_profiles')
        .select('crystal_focus')
        .eq('user_id', user.id)
        .single();

      if (data?.crystal_focus) {
        setType(data.crystal_focus.type);
        setChallenges(data.crystal_focus.challenges);
        setAspirations(data.crystal_focus.aspirations);
        setCustomDescription(data.crystal_focus.customDescription || '');
      }
    };
    loadFocus();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const crystal_focus = {
      type,
      challenges,
      aspirations,
      customDescription: customDescription || undefined,
    };

    const { error } = await supabase
      .from('elemental_profiles')
      .update({ crystal_focus })
      .eq('user_id', user.id);

    setLoading(false);
    if (!error) setSaved(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-oracle text-gold">✨ Crystal Focus Editor</h1>

      <label className="block">
        <span className="text-sm text-gold">Focus Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CrystalFocusType)}
          className="w-full mt-1 p-2 border rounded bg-deep-violet text-gold"
        >
          {FOCUS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-gold">Challenges</span>
        <textarea
          rows={3}
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          className="w-full mt-1 p-2 border rounded bg-deep-violet text-gold"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gold">Aspirations</span>
        <textarea
          rows={3}
          value={aspirations}
          onChange={(e) => setAspirations(e.target.value)}
          className="w-full mt-1 p-2 border rounded bg-deep-violet text-gold"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gold">Optional Description</span>
        <textarea
          rows={2}
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          className="w-full mt-1 p-2 border rounded bg-deep-violet text-gold"
        />
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-gold text-deep-purple px-4 py-2 font-semibold rounded hover:bg-yellow-400"
      >
        {loading ? 'Saving...' : 'Save Crystal Focus'}
      </button>

      {saved && <p className="text-green-500 text-sm">💎 Saved successfully!</p>}
    </div>
  );
}
