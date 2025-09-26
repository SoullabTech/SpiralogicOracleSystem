'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { WisdomQuote } from '@/lib/wisdom/WisdomQuotes';

interface WisdomQuoteCardProps {
  quote: WisdomQuote;
  showSource?: boolean;
  compact?: boolean;
}

const VOICE_EMOJIS: Record<string, string> = {
  maslow: '🏔️',
  frankl: '✨',
  jung: '🌙',
  nietzsche: '⚡',
  hesse: '🎭',
  tolstoy: '🌾',
  brown: '💛',
  somatic: '🌿',
  buddhist: '🧘',
  integral: '🌐'
};

export function WisdomQuoteCard({
  quote,
  showSource = true,
  compact = false
}: WisdomQuoteCardProps) {
  const voiceEmoji = VOICE_EMOJIS[quote.voice] || '⭐';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/5 to-purple-500/5 border border-amber-500/20 rounded-lg p-3"
      >
        <p className="text-xs text-amber-200/80 italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gradient-to-br from-amber-500/5 to-purple-500/5 border border-amber-500/20 rounded-xl p-5 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 opacity-50" />

      {/* Quote icon */}
      <div className="absolute top-3 right-3 opacity-10">
        <Quote className="w-12 h-12 text-amber-400" />
      </div>

      <div className="relative z-10">
        {/* Voice indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{voiceEmoji}</span>
          <span className="text-xs text-amber-200/60 capitalize">
            {quote.voice}
          </span>
        </div>

        {/* Quote text */}
        <blockquote className="mb-3">
          <p className="text-sm text-amber-100 leading-relaxed italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        {/* Source */}
        {showSource && quote.source && (
          <p className="text-xs text-amber-200/50">
            — {quote.source}
          </p>
        )}

        {/* Themes (optional) */}
        {quote.themes && quote.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-amber-500/10">
            {quote.themes.slice(0, 3).map(theme => (
              <span
                key={theme}
                className="px-2 py-0.5 text-xs bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-200/60"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}