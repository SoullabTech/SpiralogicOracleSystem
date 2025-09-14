'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const BetaBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gold-divine/20"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-divine animate-pulse" />
          <p className="text-gold-divine text-sm font-light tracking-wide">
            Beta Access • You&apos;re among the first consciousness pioneers
          </p>
          <Sparkles className="w-4 h-4 text-gold-divine animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};