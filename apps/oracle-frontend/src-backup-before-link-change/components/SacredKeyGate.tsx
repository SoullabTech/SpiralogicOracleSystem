// src/components/SacredKeyGate.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SacredKeyGate({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [sacredKeyInput, setSacredKeyInput] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 🌀 Check if the user already claimed a key
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sacred_keys')
        .select('*')
        .eq('created_by', user.id)
        .single();

      if (data) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    checkAccess();
  }, []);

  const handleClaimKey = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('sacred_keys')
      .update({ claimed: true, created_by: user.id })
      .eq('key', sacredKeyInput)
      .eq('claimed', false)
      .single();

    if (error || !data) {
      setMessage('❌ Invalid or already claimed key.');
    } else {
      setMessage('🌸 Sacred Key accepted!');
      setHasAccess(true);
    }
  };

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        🌬️ Checking your sacred access...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-100 to-indigo-100">
        <div className="bg-white bg-opacity-80 p-8 rounded-xl shadow-xl space-y-6">
          <h1 className="text-3xl font-bold text-center text-indigo-700">
            🔑 Enter Your Sacred Key
          </h1>
          <input
            type="text"
            value={sacredKeyInput}
            onChange={(e) => setSacredKeyInput(e.target.value)}
            placeholder="Type your Sacred Key here..."
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleClaimKey}
            className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Unlock Portal
          </button>
          {message && <p className="text-center text-purple-700">{message}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
