// src/pages/DreamOraclePage.tsx
import React, { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import DreamEntryForm from '@/components/dreams/DreamEntryForm';
import DreamInsight from '@/components/dreams/DreamInsight';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementalFrame } from '@/components/ui/ElementalFrame';
import { OracleTitle } from '@/components/ui/OracleTitle';
import DreamSymbolHint from '@/components/dreams/DreamSymbolHint';
import { useVoicePlayback } from '@/hooks/useVoicePlayback';
import { useElementalMood } from '@/hooks/useElementalMood';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function DreamOraclePage() {
  const [dreamSubmitted, setDreamSubmitted] = useState(false);
  const [dreamData, setDreamData] = useState<any>(null);

  const { playVoice } = useVoicePlayback();
  const { setMood } = useElementalMood();
  const { profile } = useUserProfile();

  const handleDreamSubmit = (data: any) => {
    setDreamData(data);
    setDreamSubmitted(true);
    playVoice('water', 'Your dream has been received. Symbols are aligning.');
    setMood('Water');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-300 dark:from-gray-800 dark:via-gray-900 dark:to-black transition-colors duration-1000 p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          <ElementalFrame element="Water">
            <OracleTitle
              title="🌙 Dream Oracle"
              subtitle="Decode the whispers of your soul through symbol and archetype"
            />
            <div className="mt-8 space-y-6">
              <AnimatePresence mode="wait">
                {!dreamSubmitted ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <DreamSymbolHint />
                    <DreamEntryForm onSubmit={handleDreamSubmit} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="insight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <DreamInsight data={dreamData} userId={profile?.id || ''} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ElementalFrame>
        </motion.div>
      </div>
    </PageTransition>
  );
}
