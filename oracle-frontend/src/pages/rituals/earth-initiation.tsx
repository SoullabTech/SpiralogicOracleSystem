// Location: /oracle-frontend/src/pages/rituals/earth-initiation.tsx
// Build: Frontend

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logJournalEntry } from '@/lib/journal';

const EarthInitiationRitual = () => {
  const [groundingStep, setGroundingStep] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await logJournalEntry({
      title: 'Earth 1: How Will You Ground This?',
      content: groundingStep,
      tags: ['earth', 'grounding', 'ontology', 'practical']
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-900 to-emerald-700 text-white px-6 py-12">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">How Will You Ground This?</h1>
        <p className="mb-6 text-lg italic">
          “What concrete steps will anchor your vision into form?”
        </p>
        <p className="mb-6">
          Stand with bare feet. Feel gravity hold you. Speak aloud one practical action you will take today.
        </p>
        <textarea
          className="w-full p-4 rounded-lg text-black focus:outline-none mb-4"
          rows={6}
          placeholder="Name one step you will take now..."
          value={groundingStep}
          onChange={(e) => setGroundingStep(e.target.value)}
        />
        <button
          className="bg-earth hover:bg-earth-dark text-white font-semibold py-2 px-8 rounded-lg"
          onClick={handleSubmit}
        >
          Ground My Intention
        </button>
      </div>
    </div>
  );
};

export default EarthInitiationRitual;
