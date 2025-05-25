// Location: /oracle-frontend/src/pages/rituals/aether-initiation.tsx
// Build: Frontend

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logJournalEntry } from '@/lib/journal';

const AetherInitiationRitual = () => {
  const [essence, setEssence] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await logJournalEntry({
      title: 'Aether 1: What Is the Thread That Weaves It All?',
      content: essence,
      tags: ['aether', 'integration', 'wholeness', 'oracle']
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">What Is the Thread That Weaves It All?</h1>
        <p className="mb-6 text-lg italic">
          “Reflect on the spiral you’ve walked. What wholeness is emerging now?”
        </p>
        <p className="mb-6">
          Sit in stillness. Place one hand on your heart, one on your belly. Breathe slowly. Let a single word or image arise that unifies your journey.
        </p>
        <textarea
          className="w-full p-4 rounded-lg text-black focus:outline-none mb-4"
          rows={6}
          placeholder="What is arising from within your wholeness...?"
          value={essence}
          onChange={(e) => setEssence(e.target.value)}
        />
        <button
          className="bg-aether hover:bg-aether-dark text-white font-semibold py-2 px-8 rounded-lg"
          onClick={handleSubmit}
        >
          Receive the Thread
        </button>
      </div>
    </div>
  );
};

export default AetherInitiationRitual;
