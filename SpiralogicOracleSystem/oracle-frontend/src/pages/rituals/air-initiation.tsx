// Location: /oracle-frontend/src/pages/rituals/air-initiation.tsx
// Build: Frontend

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logJournalEntry } from '@/lib/journal';

const AirInitiationRitual = () => {
  const [truth, setTruth] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await logJournalEntry({
      title: 'Air 1: What Must Be Said?',
      content: truth,
      tags: ['air', 'expression', 'axiology', 'truth']
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-sky-900 to-cyan-700 text-white px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">What Must Be Said?</h1>
        <p className="mb-6 text-lg italic">
          “What truth needs to be spoken, written, or shared to bring clarity or connection?”
        </p>
        <p className="mb-6">
          Sit somewhere with a view of the sky. Breathe. Write or speak aloud one truth you’ve been holding back.
        </p>
        <textarea
          className="w-full p-4 rounded-lg text-black focus:outline-none mb-4"
          rows={6}
          placeholder="Give voice to your truth..."
          value={truth}
          onChange={(e) => setTruth(e.target.value)}
        />
        <button
          className="bg-air hover:bg-air-dark text-white font-semibold py-2 px-8 rounded-lg"
          onClick={handleSubmit}
        >
          Speak My Truth
        </button>
      </div>
    </div>
  );
};

export default AirInitiationRitual;
