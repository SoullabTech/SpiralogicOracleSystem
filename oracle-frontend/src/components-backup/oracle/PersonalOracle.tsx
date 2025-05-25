// oracle-frontend/src/components/oracle/PersonalOracle.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVoicePlayback } from '@/hooks/useVoicePlayback';

type InsightData = {
  message: string;
  archetype: string;
  tone: string;
  card: string;
  symbol: string;
  ritualId: string;
};

export default function PersonalOracle() {
  const [element, setElement] = useState('Water');
  const [oracleIntro, setOracleIntro] = useState('');
  const [reflection, setReflection] = useState('');
  const [ritual, setRitual] = useState('');
  const [archetypalInsight, setArchetypalInsight] = useState<InsightData>({
    message: '',
    archetype: '',
    tone: '',
    card: '',
    symbol: '',
    ritualId: '',
  });
  const { playVoice } = useVoicePlayback();

  useEffect(() => {
    const fetchOracleData = async () => {
      const res = await fetch(`/api/oracle/reflection?element=${element}`);
      const data = await res.json();
      setOracleIntro(data.intro);
      setReflection(data.reflection);
      setRitual(data.ritual);
      setArchetypalInsight(data.insight);
      playVoice(element.toLowerCase(), data.intro);
    };

    fetchOracleData();
  }, [element]);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-200 to-blue-100 p-6 dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Card className="w-full max-w-2xl p-8 text-center space-y-4 shadow-xl border border-indigo-200 dark:border-indigo-700">
        <CardContent>
          <h2 className="text-3xl font-extrabold tracking-tight text-indigo-800 dark:text-indigo-100">Your Personal Oracle 🜔</h2>
          <p className="text-lg italic text-indigo-700 dark:text-indigo-300 mb-4">{oracleIntro}</p>
          <p className="text-base whitespace-pre-wrap leading-relaxed text-gray-900 dark:text-gray-100">{reflection}</p>
          <p className="text-sm mt-4 text-indigo-600 dark:text-indigo-300">✨ Suggested Ritual: <strong>{ritual}</strong></p>
          <div className="mt-6 p-4 border rounded-lg bg-white/50 dark:bg-black/30">
            <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-100">Archetypal Insight</h3>
            <p className="text-md font-medium italic text-gray-800 dark:text-gray-200 mt-2">{archetypalInsight.message}</p>
            <div className="text-sm mt-3 text-gray-700 dark:text-gray-300">
              🔮 Archetype: <strong>{archetypalInsight.archetype}</strong><br/>
              🎴 Card: {archetypalInsight.card}<br/>
              🕊 Symbol: {archetypalInsight.symbol}
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={() => playVoice(element.toLowerCase(), reflection)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Replay Message
            </Button>
            <select
              className="rounded-md border border-indigo-300 dark:border-indigo-600 p-2 text-indigo-900 dark:text-white bg-white dark:bg-gray-700"
              value={element}
              onChange={(e) => setElement(e.target.value)}
            >
              {['Fire', 'Water', 'Earth', 'Air', 'Aether'].map((el) => (
                <option key={el} value={el}>{el}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
