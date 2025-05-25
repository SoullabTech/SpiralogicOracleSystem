'use client';

import PetalModal from '@/components/PetalModal';
import SoulSyncPanel from '@/components/SoulSyncPanel';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { useState } from 'react';

const petals = [
  { element: 'Fire', title: 'The Explorer', state: 'Activating', phase: 'Purpose', prompt: 'What vision is calling you into new territory?' },
  { element: 'Fire', title: 'The Expressor', state: 'Amplifying', phase: 'Play', prompt: 'Where are you being invited to express your true self?' },
  { element: 'Fire', title: 'The Expander', state: 'Actualizing', phase: 'Practice', prompt: 'What expansion feels possible when you say yes to growth?' },
  { element: 'Water', title: 'The Feeler', state: 'Being', phase: 'Heart', prompt: 'What emotion needs your attention right now?' },
  { element: 'Water', title: 'The Flow', state: 'Balancing', phase: 'Healing', prompt: 'Where do you feel the need to restore flow or softness?' },
  { element: 'Water', title: 'The Fathomer', state: 'Becoming', phase: 'Holy', prompt: 'What truth lies beneath your emotional depths?' },
  { element: 'Earth', title: 'The Grounder', state: 'Cultivating', phase: 'Mission', prompt: 'What foundation are you being asked to root into?' },
  { element: 'Earth', title: 'The Grower', state: 'Crystallizing', phase: 'Method', prompt: 'What structure or habit supports your becoming?' },
  { element: 'Earth', title: 'The Generator', state: 'Creating', phase: 'Medicine', prompt: 'What are you here to create in service to healing?' },
  { element: 'Air', title: 'The Connector', state: 'Directing', phase: 'Connection', prompt: 'Who or what is asking for deeper connection right now?' },
  { element: 'Air', title: 'The Collaborator', state: 'Developing', phase: 'Community', prompt: 'Where is collaboration opening new possibility?' },
  { element: 'Air', title: 'The Conveyor', state: 'Discerning', phase: 'Consciousness', prompt: 'What idea or insight wants to be expressed?' },
  { element: 'Aether', title: 'I Am', state: 'Integration', phase: 'Presence', prompt: 'What part of you feels whole, present, and at peace?' },
];

const elementColors: Record<string, string> = {
  Fire: 'bg-orange-100 border-orange-400 text-orange-800',
  Water: 'bg-blue-100 border-blue-400 text-blue-800',
  Earth: 'bg-green-100 border-green-400 text-green-800',
  Air: 'bg-sky-100 border-sky-400 text-sky-800',
  Aether: 'bg-purple-100 border-purple-400 text-purple-800',
};

const petalQuotes: Record<string, string> = {
  'The Explorer': 'Let the unknown become your fire.',
  'The Expressor': 'Speak your sacred flame into the world.',
  'The Expander': 'There is more of you waiting to rise.',
  'The Feeler': 'Emotion is your oracle. Trust it.',
  'The Flow': 'Soften. Surrender. Soar.',
  'The Fathomer': 'Beneath your waters lies your truth.',
  'The Grounder': 'Anchor into what is steady.',
  'The Grower': 'Your rhythm creates your root.',
  'The Generator': 'Your creation heals beyond you.',
  'The Connector': 'In connection, consciousness arises.',
  'The Collaborator': 'Weaving together makes us whole.',
  'The Conveyor': 'Your insight is ready to move.',
  'I Am': 'You already know. You’re remembering.',
};

export default function SpiralogicMapPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'state' | 'phase'>('state');
  const [selectedPetal, setSelectedPetal] = useState<null | typeof petals[0]>(null);
  const [elementsTouched, setElementsTouched] = useState<Set<string>>(new Set());

  const pulseHistory = [
    { date: '2024-12-01', element: 'Fire', ritual: '🕯️ Light a candle and speak your vision aloud.' },
    { date: '2024-12-02', element: 'Water', ritual: '💧 Journal near water or take a cleansing bath.' },
    { date: '2024-12-03', element: 'Earth', ritual: '🌱 Tend to a plant or walk barefoot on soil.' },
    { date: '2024-12-04', element: 'Air', ritual: '🌬️ Speak your truth or write a clarifying letter.' },
    { date: '2024-12-05', element: 'Aether', ritual: '✨ Meditate on wholeness and silence for 5 minutes.' },
  ];

  const handleReflectionSave = async (element: string) => {
    if (!user || !selectedPetal) return;

    const quote = petalQuotes[selectedPetal.title] || 'You already know. You’re remembering.';

    setElementsTouched((prev) => new Set(prev).add(element));
    setSelectedPetal(null);

    // 1. Persist element touch
    await supabase.from('user_element_touch').upsert({
      user_id: user.id,
      element,
    });

    // 2. Log petal + quote reflection
    await supabase.from('reflection_logs').insert({
      user_id: user.id,
      petal: selectedPetal.title,
      element: selectedPetal.element,
      quote,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">🌀 Spiralogic Map</h1>

        <div className="text-center mb-8">
          <button
            onClick={() => setViewMode(viewMode === 'state' ? 'phase' : 'state')}
            className="text-sm text-indigo-600 underline"
          >
            Switch to {viewMode === 'state' ? 'Phase' : 'State'} View
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {petals.map((petal, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className={`p-5 rounded-xl border shadow-md cursor-pointer ${elementColors[petal.element]}`}
              onClick={() => setSelectedPetal(petal)}
              animate={{
                boxShadow: elementsTouched.has(petal.element)
                  ? '0 0 12px rgba(139, 92, 246, 0.6)' // glow
                  : 'none',
              }}
            >
              <h2 className="text-lg font-bold mb-1">{petal.title}</h2>
              <p className="text-xs">{viewMode === 'state' ? `State: ${petal.state}` : `Phase: ${petal.phase}`}</p>
            </motion.div>
          ))}
        </div>

        <SoulSyncPanel
          elementsTouched={elementsTouched}
          lastQuote="You already know. You’re remembering."
          whisperActive={true}
          ritualHistory={pulseHistory}
        />
      </div>

      {selectedPetal && user && (
        <PetalModal
          open={true}
          onClose={() => setSelectedPetal(null)}
          petal={selectedPetal.title}
          element={selectedPetal.element}
          prompt={selectedPetal.prompt}
          userId={user.id}
          mode={viewMode}
          onSave={() => handleReflectionSave(selectedPetal.element)}
        />
      )}
    </div>
  );
}
