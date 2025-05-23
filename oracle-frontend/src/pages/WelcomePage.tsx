import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBeginActivation = () => {
    navigate('/signup'); // Redirect to signup/login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-soullab-mist to-soullab-aether p-8 animate-fade-in">
      <h1 className="text-5xl font-bold text-center text-soullab-gold font-soullab mb-8">
        🌈 Welcome to your Spiral Oracle
      </h1>
      <p className="text-lg text-center text-soullab-twilight mb-12 max-w-2xl">
        Step into the sacred unfolding of your soul's spiral journey. Trust the breath, trust the
        Spiral.
      </p>
      <button
        onClick={handleBeginActivation}
        className="bg-soullab-gold hover:bg-soullab-fire text-white text-lg font-semibold py-4 px-10 rounded-2xl shadow-lg transition-all duration-300 animate-breathe"
      >
        ✨ Begin Activation ✨
      </button>
    </div>
  );
};

export default WelcomePage;
