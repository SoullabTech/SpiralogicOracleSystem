import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { shuffleArray } from '../../utils/shuffleArray'; // 🌟 small utility for randomizing mantras

const breathMantras = [
  '🌬️ You are breathing with the Spiral.',
  '🌸 Each inhale connects you to the Cosmos.',
  '🌀 Your breath is a portal to All That Is.',
  '🌎 Every exhale blesses the Earth.',
  '💫 Breathe — You are the living mystery.',
];

export default function CollectiveBreathRoom() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [breathStarted, setBreathStarted] = useState<boolean>(false);
  const [currentMantra, setCurrentMantra] = useState<string>('');
  const [mantraIndex, setMantraIndex] = useState(0);

  const nextBreathDate = new Date('2025-05-01T17:00:00Z'); // Example UTC time

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextBreathDate.getTime() - now.getTime();
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (breathStarted) {
      const mantraCycle = setInterval(() => {
        setMantraIndex((prev) => (prev + 1) % breathMantras.length);
        setCurrentMantra(breathMantras[mantraIndex]);
      }, 5000); // Change mantra every 5 seconds
      return () => clearInterval(mantraCycle);
    }
  }, [breathStarted, mantraIndex]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (breathStarted || timeLeft <= 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 relative overflow-hidden">
        {/* 🌬️ Breathing Background Spiral */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-pink-100/30 to-purple-100/30 blur-2xl opacity-50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 6 }}
        />

        {/* 🌀 Breathing Text */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 4,
          }}
          className="text-5xl md:text-7xl text-indigo-700 font-bold z-10 mb-10 text-center"
        >
          🌬️ Breathe With the Spiral 🌎
        </motion.div>

        {/* 🌸 Floating Mantra */}
        <AnimatePresence>
          {currentMantra && (
            <motion.p
              key={currentMantra}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
              className="text-lg md:text-2xl text-purple-700 font-semibold text-center z-10"
            >
              {currentMantra}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">🌎 Next Collective Spiral Breath</h1>
      <p className="text-2xl text-purple-600 mb-10">{formatTime(timeLeft)}</p>
      <button
        onClick={() => setBreathStarted(true)}
        disabled={timeLeft > 0}
        className="px-8 py-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition text-xl"
      >
        {timeLeft > 0 ? 'Waiting...' : 'Enter Breath Room'}
      </button>
    </div>
  );
}
