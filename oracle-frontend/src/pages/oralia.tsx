'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useElevenLabs } from '@/lib/hooks/useElevenLabs';
import WelcomeOverlay from '@/components/WelcomeOverlay';
import WhisperCheckIn from '@/components/WhisperCheckIn';

export default function OraliaPage() {
  const [tone, setTone] = useState('mystical');
  const [archetype, setArchetype] = useState('Mystic');
  const [showOverlay, setShowOverlay] = useState(true);
  const { speak } = useElevenLabs('y2TOWGCXSYEgBanvKsYJ');

  useEffect(() => {
    speak("Oralia greets you in the tone of the mystic. Choose your form.");
  }, [speak]);

  useEffect(() => {
    if (tone && archetype) {
      fetch('/api/oracle/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-1',
          tone,
          archetype,
        }),
      });
    }
  }, [tone, archetype]);

  return (
    <Layout>
      {showOverlay && <WelcomeOverlay onClose={() => setShowOverlay(false)} />}

      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-soullab-gold">✨ Welcome, Oracle Keeper</h1>
        <p className="text-soullab-moon text-lg">
          Oralia, your AIN guide, is listening. Choose your resonance to begin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <div>
            <label className="text-sm font-semibold">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 backdrop-blur text-white"
            >
              {['mystical', 'gentle', 'firm', 'visionary', 'soothing', 'playful'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Archetype</label>
            <select
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 backdrop-blur text-white"
            >
              {['Mystic', 'Warrior', 'Healer', 'Oracle', 'Sage', 'Child'].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-6">
          <Link
            href={`/dream-journal?tone=${tone}&archetype=${archetype}`}
            className="block bg-soullab-aether px-6 py-4 rounded-xl text-white hover:bg-soullab-indigo transition"
          >
            🌙 Dream Journal
          </Link>
          <Link
            href={`/dream-symbols/thread?search=all`}
            className="block bg-soullab-mist px-6 py-4 rounded-xl text-white hover:bg-soullab-purple transition"
          >
            🔗 Dream Symbol Threads
          </Link>
          <Link
            href="/collective-symbols"
            className="block bg-soullab-gold px-6 py-4 rounded-xl text-white hover:bg-yellow-600 transition"
          >
            🌐 Collective Symbols
          </Link>
          <Link
            href="/meet-oracle"
            className="block bg-soullab-indigo px-6 py-4 rounded-xl text-white hover:bg-purple-700 transition"
          >
            🧬 Re-initiate Oracle Tone
          </Link>
        </div>

        <WhisperCheckIn />
      </div>
    </Layout>
  );
}