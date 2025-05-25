'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

const rituals = [
  {
    id: 'ritual-fire-001',
    title: 'Ignite Intention',
    element: 'fire',
    description: 'Light a candle. Focus your breath on a clear intention. Speak it aloud three times.',
  },
  {
    id: 'ritual-water-001',
    title: 'Dream Offering',
    element: 'water',
    description: 'Write your dream on paper. Fold it and float it in water. Observe what feelings rise.',
  },
  {
    id: 'ritual-earth-001',
    title: 'Grounded Presence',
    element: 'earth',
    description: 'Stand barefoot on the ground. Breathe slowly. Feel your roots extending deep.',
  },
  {
    id: 'ritual-air-001',
    title: 'Breath of Clarity',
    element: 'air',
    description: 'Inhale for 4, hold for 4, exhale for 4. Repeat 4 times. Ask for guidance in silence.',
  },
];

export default function RitualRoomPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('completed_rituals');
    if (stored) setCompleted(JSON.parse(stored));
  }, []);

  const markComplete = (id: string) => {
    const updated = [...new Set([...completed, id])];
    setCompleted(updated);
    localStorage.setItem('completed_rituals', JSON.stringify(updated));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-soullab-gold text-center">🕯 Ritual Room</h1>
        <p className="text-soullab-moon text-center">Choose a sacred act and complete it with intention.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rituals.map((ritual) => (
            <div
              key={ritual.id}
              className={`rounded-xl p-6 border shadow backdrop-blur bg-white/10 border-white/10 ${
                completed.includes(ritual.id) ? 'opacity-50' : ''
              }`}
            >
              <h2 className="text-xl font-semibold text-white mb-2">{ritual.title}</h2>
              <p className="text-sm text-soullab-moon mb-3">{ritual.description}</p>
              <button
                disabled={completed.includes(ritual.id)}
                onClick={() => markComplete(ritual.id)}
                className="px-4 py-2 bg-soullab-indigo text-white rounded shadow disabled:opacity-50"
              >
                {completed.includes(ritual.id) ? '✅ Completed' : 'Begin Ritual'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
