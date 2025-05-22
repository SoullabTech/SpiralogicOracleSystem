import { motion } from 'framer-motion';
import { useSoundEffect } from '../../hooks/useSoundEffect';

export default function WildPetalMessage({ message }: { message: string }) {
  const playWildMessageSound = useSoundEffect('/sounds/wild-message.mp3');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      onAnimationStart={playWildMessageSound}
      className="mt-8 p-6 rounded-lg bg-white shadow-xl text-center text-xl max-w-lg text-indigo-700 animate-pulse"
    >
      {message}
    </motion.div>
  );
}
