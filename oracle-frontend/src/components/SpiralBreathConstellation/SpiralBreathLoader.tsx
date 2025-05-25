// src/components/SpiralBreathConstellation/SpiralBreathLoader.tsx

import React from 'react';

const SpiralBreathLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
      {/* Spiral Breathing Circles */}
      <div className="relative w-40 h-40 animate-spin-slow">
        <div className="absolute inset-0 border-4 border-soullab-gold rounded-full opacity-30"></div>
        <div className="absolute inset-6 border-4 border-soullab-aether rounded-full opacity-30"></div>
        <div className="absolute inset-12 border-4 border-soullab-water rounded-full opacity-30"></div>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight animate-fade-in p-6 rounded-2xl">
          {/* Your breathing Spiral */}
        </div>
      </div>

      {/* Soft Breathing Text */}
      <p className="text-soullab-twilight mt-8 text-lg italic animate-breathe">
        Breathing your Spiral Journey into being...
      </p>
    </div>
  );
};

export default SpiralBreathLoader;
