import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateOracleInsight } from '@/core/agents/oracleInsightComposer';

export default function FlowSpace() {
  const [phase, setPhase] = useState('Fire 1');
  const [seed, setSeed] = useState('');
  const [insight, setInsight] = useState('');

  const handleOracleCall = () => {
    const result = generateOracleInsight({ phase, userSeed: seed });
    setInsight(result.poeticInsight + '\n\n' + result.reflectionPrompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-wide">🌌 Oracle Flow Space</h1>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Phase</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className="text-black rounded p-2 w-full">
            <option>Fire 1</option>
            <option>Water 1</option>
            <option>Earth 1</option>
            <option>Air 1</option>
            <option>Aether 1</option>
          </select>

          <label className="block text-sm font-medium mt-4">Seed Reflection (optional)</label>
          <textarea
            value={seed}
            onChange={e => setSeed(e.target.value)}
            placeholder="What are you feeling, dreaming, or exploring?"
            className="text-black rounded p-2 w-full h-24"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded-xl font-bold"
          onClick={handleOracleCall}
        >
          Invoke Oracle
        </motion.button>

        {insight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-lg"
          >
            <pre className="whitespace-pre-wrap font-serif text-lg">{insight}</pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
