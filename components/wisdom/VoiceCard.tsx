'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { WisdomFacet, Element } from '@/lib/wisdom/WisdomFacets';

interface VoiceCardProps {
  facet: WisdomFacet;
  isSelected?: boolean;
  onToggle?: (facetId: string) => void;
  expandedByDefault?: boolean;
  showSelection?: boolean;
}

const ELEMENT_EMOJIS = {
  earth: '🜃',
  water: '🜄',
  fire: '🜂',
  air: '🜁',
  aether: '🜀'
};

const ELEMENT_COLORS = {
  earth: 'amber-600',
  water: 'blue-500',
  fire: 'red-500',
  air: 'cyan-400',
  aether: 'purple-500'
};

export function VoiceCard({
  facet,
  isSelected = false,
  onToggle,
  expandedByDefault = false,
  showSelection = true
}: VoiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);

  const getFacetEmoji = (id: string): string => {
    const emojiMap: Record<string, string> = {
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
    return emojiMap[id] || '⭐';
  };

  return (
    <motion.div
      layout
      className={`
        border rounded-xl overflow-hidden transition-all
        ${isSelected
          ? 'bg-amber-500/10 border-amber-500/40'
          : 'bg-black/20 border-amber-500/20 hover:border-amber-500/30'
        }
      `}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3 flex-1">
          {/* Emoji icon */}
          <div className="text-2xl mt-0.5 flex-shrink-0">
            {getFacetEmoji(facet.id)}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                <h3 className="text-base font-medium text-amber-100 mb-0.5">
                  {facet.name}
                </h3>
                <p className="text-xs text-amber-200/60">
                  {facet.tradition}
                </p>
              </div>

              {showSelection && onToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(facet.id);
                  }}
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    transition-all flex-shrink-0
                    ${isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-amber-500/30 hover:border-amber-500/50'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Core question (always visible) */}
            <p className="text-xs text-amber-200/70 italic mb-2">
              &ldquo;{facet.coreQuestion}&rdquo;
            </p>

            {/* Elements */}
            <div className="flex flex-wrap gap-1.5">
              {facet.primaryElements.map(element => (
                <span
                  key={element}
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    bg-${ELEMENT_COLORS[element]}/10
                    border border-${ELEMENT_COLORS[element]}/30
                    text-amber-200/70
                  `}
                >
                  {ELEMENT_EMOJIS[element]} {element}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expand indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-amber-400/60 flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-3 border-t border-amber-500/10 pt-3">
          {/* Description */}
          <div>
            <p className="text-sm text-amber-200/80 leading-relaxed">
              {facet.description}
            </p>
          </div>

          {/* When to use */}
          <div>
            <p className="text-xs font-medium text-amber-300 mb-1">
              When to use this lens:
            </p>
            <p className="text-xs text-amber-200/70">
              {facet.when}
            </p>
          </div>

          {/* Voice example */}
          {facet.voiceExample && (
            <div>
              <p className="text-xs font-medium text-amber-300 mb-1">
                Voice example:
              </p>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
                <p className="text-xs text-amber-200/80 italic">
                  &ldquo;{facet.voiceExample}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Key themes */}
          <div>
            <p className="text-xs font-medium text-amber-300 mb-2">
              Key themes:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {facet.keyThemes.map(theme => (
                <span
                  key={theme}
                  className="px-2 py-1 text-xs bg-amber-500/5 border border-amber-500/20 rounded-md text-amber-200/70"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Resonant phases */}
          <div>
            <p className="text-xs font-medium text-amber-300 mb-2">
              Resonant spiral phases:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {facet.resonantPhases.map(phase => (
                <span
                  key={phase}
                  className="px-2 py-0.5 text-xs bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-200/80 capitalize"
                >
                  {phase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}