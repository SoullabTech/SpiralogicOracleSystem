import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const targetDate = new Date("2025-06-01T17:00:00Z"); // Set your ceremony time here

function formatTime(diff: number) {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export const CeremonyCountdownWidget = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetDate.getTime() - new Date().getTime();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = targetDate.getTime() - new Date().getTime();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="bg-white bg-opacity-80 border border-indigo-200 rounded-xl shadow-md p-6 text-center max-w-md mx-auto mt-6"
    >
      <h2 className="text-xl font-bold text-indigo-700 mb-2">⏳ Countdown to the Ceremony</h2>
      {timeLeft > 0 ? (
        <div className="flex justify-center space-x-6 text-pink-600 text-lg font-mono">
          <div>
            <span className="block text-2xl">{days}</span>
            <span className="text-sm">days</span>
          </div>
          <div>
            <span className="block text-2xl">{hours}</span>
            <span className="text-sm">hours</span>
          </div>
          <div>
            <span className="block text-2xl">{minutes}</span>
            <span className="text-sm">min</span>
          </div>
          <div>
            <span className="block text-2xl">{seconds}</span>
            <span className="text-sm">sec</span>
          </div>
        </div>
      ) : (
        <p className="text-indigo-500 font-semibold mt-4">✨ The Ceremony Has Begun ✨</p>
      )}
    </motion.div>
  );
};

export default CeremonyCountdownWidget;
