import { SpiralParticles } from '@/components/SpiralParticles';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SpiralogicPath() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SpiralParticles element="Aether" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center space-y-6 text-center"
      >
        <h1 className="text-4xl font-extrabold text-indigo-700">
          🌀 Welcome to Your Spiralogic Journey
        </h1>
        <p className="text-lg text-purple-600">
          You are now walking the Sacred Spiral — the path of vision, grounding, transformation, and rebirth.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {[
            { phase: 'Fire', meaning: 'Inspiration, Vision, Initiation' },
            { phase: 'Earth', meaning: 'Stability, Structure, Growth' },
            { phase: 'Air', meaning: 'Communication, Insight, Collaboration' },
            { phase: 'Water', meaning: 'Transformation, Healing, Rebirth' },
            { phase: 'Aether', meaning: 'Integration, Unity, Completion' },
          ].map(({ phase, meaning }) => (
            <div key={phase} className="bg-white bg-opacity-80 p-6 rounded-xl shadow-md text-indigo-700">
              <h2 className="text-2xl font-bold">{phase}</h2>
              <p className="mt-2 text-md italic">{meaning}</p>
            </div>
          ))}
        </div>

        <Link
          to="/dashboard"
          className="mt-8 px-8 py-4 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
        >
          🌸 Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
