// Location: /oracle-frontend/src/pages/rituals/water-initiation.tsx
// Build: Frontend

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logJournalEntry } from '@/lib/journal';

const WaterInitiationRitual = () => {
  const [reflection, setReflection] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await logJournalEntry({
      title: 'Water 1: Why Does This Matter?',
      content: reflection,
      tags: ['water', 'initiation', 'epistemology', 'meaning']
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-indigo-700 text-white px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">Why Does This Matter?</h1>
        <p className="mb-6 text-lg italic">
          “What emotional truth flows beneath your vision?”
        </p>
        <p className="mb-6">
          Place your hand on your heart. Speak aloud the why behind what you seek. Let your breath soften into the space behind it.
        </p>
        <textarea
          className="w-full p-4 rounded-lg text-black focus:outline-none mb-4"
          rows={6}
          placeholder="Feel into your why and let it speak..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
        <button
          className="bg-water hover:bg-water-dark text-white font-semibold py-2 px-8 rounded-lg"
          onClick={handleSubmit}
        >
          Let My Why Flow
        </button>
      </div>
    </div>
  );
};

export default WaterInitiationRitual;
