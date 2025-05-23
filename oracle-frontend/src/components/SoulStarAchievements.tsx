import { motion } from 'framer-motion';

export function SoulStarAchievements({ stars }: { stars: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center mt-8"
    >
      <h3 className="text-2xl font-bold text-yellow-500">⭐ Your Soul Stars: {stars}</h3>
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: stars }).map((_, idx) => (
          <span key={idx} className="text-3xl animate-pulse">
            ⭐
          </span>
        ))}
      </div>
    </motion.div>
  );
}
