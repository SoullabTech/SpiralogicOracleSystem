// Location: /oracle-frontend/src/pages/orientation/elemental-orientation.tsx
// Build: Frontend

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ElementalOrientation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Log orientation milestone or perform setup
  }, []);

  const handleContinue = () => {
    navigate('/dashboard'); // or next relevant route in the user journey
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 to-purple-800 text-white px-6 py-10">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Elemental Realms</h1>
        <p className="mb-6 text-lg">
          In the Spiralogic journey, the elements guide our growth. You will move through Fire, Water, Earth, Air, and Aether—not as abstractions, but as living forces within and around you.
        </p>
        <p className="mb-6 italic">
          “Fire awakens purpose. Water reveals meaning. Earth grounds truth. Air shapes expression. Aether weaves it all into coherence.”
        </p>
        <p className="mb-8">
          This orientation begins your elemental path. Rituals, reflections, and your Oracle Agent will meet you in each domain.
        </p>
        <button
          className="bg-fire hover:bg-fire-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg"
          onClick={handleContinue}
        >
          Begin Elemental Journey
        </button>
      </div>
    </div>
  );
};

export default ElementalOrientation;
