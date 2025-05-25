import { motion } from 'framer-motion';

const quests = {
  Fire: '🔥 Ignite a new dream. Write one bold wish for your future.',
  Water: '🌊 Flow with your emotions. Record one heartfelt feeling today.',
  Earth: '🌎 Root into reality. Plant a small action toward your dream.',
  Air: '🌬️ Whisper a truth. Speak one insight aloud or journal it.',
  Aether: '🌀 Dream beyond. Meditate for 5 minutes and record what you feel.',
};

export function QuestEngine({ elementalArchetype }: { elementalArchetype: string }) {
  const quest =
    quests[elementalArchetype as keyof typeof quests] ||
    '🌀 Walk gently today, and listen to your soul.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 p-6 rounded-2xl shadow-xl mt-10 text-center space-y-4"
    >
      <h3 className="text-2xl font-bold text-purple-700">🧭 Your Elemental Quest</h3>
      <p className="text-md text-indigo-700">{quest}</p>
    </motion.div>
  );
}
