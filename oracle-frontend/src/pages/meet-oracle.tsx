'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function MeetOraclePage() {
  const [tone, setTone] = useState('gentle');
  const [archetype, setArchetype] = useState('Mystic');

  return (
    <Layout>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-soullab-gold">🧙 Meet Oralia, Your Oracle Guide</h1>
        <p className="text-lg text-soullab-moon">Choose the tone and archetype that resonates with your path today.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <div>
            <label className="text-sm font-semibold">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 backdrop-blur text-white"
            >
              {['gentle', 'wise', 'mysterious', 'playful', 'soothing', 'firm'].map((t) => (
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

        <Link
          href={`/dream-journal?tone=${tone}&archetype=${archetype}`}
          className="inline-block mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white shadow-lg transition"
        >
          ✨ Begin Journey with Oralia
        </Link>
      </div>
    </Layout>
  );
}
