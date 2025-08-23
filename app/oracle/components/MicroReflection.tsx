'use client';

import { useState, useEffect } from 'react';
import { maybeMicroReflection } from '@/lib/shared/reflectionSpeech';

interface TurnMeta {
  sacredDetected: boolean;
  shadowScore: number;
  archetypeHint?: string;
  facetHints: string[];
  soulMemoryId?: string | null;
  confidence?: number;
  turnIndex?: number;
}

interface MicroReflectionProps {
  turnMeta: TurnMeta;
  isVisible?: boolean;
}

export function MicroReflection({ turnMeta, isVisible = true }: MicroReflectionProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [reflectionText, setReflectionText] = useState<string | null>(null);

  // Check environment flags
  const showReflections = process.env.NEXT_PUBLIC_DEV_INLINE_REFLECTIONS === 'true';
  if (!showReflections || !isVisible || !turnMeta) return null;

  // Privacy guard: Don't show reflections if any redaction occurred or high shadow
  if (turnMeta.soulMemoryId?.includes('redacted') || turnMeta.shadowScore > 0.8) {
    return null; // Too sensitive for UI display
  }

  // Generate micro-reflection using speech utility
  useEffect(() => {
    const enrichment = {
      confidence: turnMeta.confidence || 0.8,
      sacred: turnMeta.sacredDetected,
      shadowScore: turnMeta.shadowScore,
      archetypeHints: turnMeta.archetypeHint ? [turnMeta.archetypeHint] : [],
    };

    const micro = maybeMicroReflection(enrichment, turnMeta.turnIndex || 1);
    setReflectionText(micro);
  }, [turnMeta]);

  const handlePin = async () => {
    if (!turnMeta.soulMemoryId || isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      const response = await fetch('/api/soul-memory/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          soulMemoryId: turnMeta.soulMemoryId,
          bookmark: true 
        }),
      });

      if (response.ok) {
        setIsPinned(true);
      }
    } catch (error) {
      console.warn('Failed to bookmark memory:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Holoflower glow nudge (confidence ≥0.7, rate limited)
  const shouldShowGlow = turnMeta.confidence >= 0.7 && 
                        turnMeta.facetHints.length > 0 &&
                        (turnMeta.sacredDetected || turnMeta.shadowScore > 0.4);

  if (!reflectionText && !shouldShowGlow) return null;

  return (
    <div className="mt-3 space-y-2">
      
      {/* Micro-Reflection Text (≤12 words) */}
      {reflectionText && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-70">
          <span className="text-gray-600 dark:text-gray-400 italic text-sm">
            {reflectionText}
          </span>
          
          {turnMeta.soulMemoryId && (
            <button
              onClick={handlePin}
              disabled={isBookmarking || isPinned}
              className={`ml-3 p-1 rounded-md transition-colors ${
                isPinned 
                  ? 'text-amber-500 bg-amber-100 dark:bg-amber-900' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isPinned ? 'Pinned' : 'Pin this moment?'}
            >
              {isBookmarking ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}

      {/* Holoflower Mini-Glow Nudges */}
      {shouldShowGlow && (
        <div className="flex items-center justify-center space-x-2">
          {turnMeta.facetHints.map((facet, index) => (
            <HoloflowerNudge 
              key={index}
              facet={facet}
              sacred={turnMeta.sacredDetected}
              shadowScore={turnMeta.shadowScore}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface HoloflowerNudgeProps {
  facet: string;
  sacred: boolean;
  shadowScore: number;
}

function HoloflowerNudge({ facet, sacred, shadowScore }: HoloflowerNudgeProps) {
  const [isGlowing, setIsGlowing] = useState(false);
  const [showDelta, setShowDelta] = useState(false);

  useEffect(() => {
    // Brief pulse effect
    setIsGlowing(true);
    const timer = setTimeout(() => setIsGlowing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdjust = (delta: number) => {
    // Apply delta logic here - placeholder for now
    console.log(`Adjusting ${facet} by ${delta}`);
    setShowDelta(false);
  };

  const facetColor = sacred ? 'text-amber-400' : shadowScore > 0.5 ? 'text-red-400' : 'text-blue-400';
  const glowClass = isGlowing ? 'animate-pulse ring-2 ring-current' : '';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDelta(!showDelta)}
        className={`px-2 py-1 text-xs rounded-full transition-all duration-300 ${facetColor} ${glowClass} hover:bg-current hover:bg-opacity-10`}
        title={`${facet} petal stirring`}
      >
        {facet}
      </button>

      {/* Delta Adjustment Chips */}
      {showDelta && (
        <div className="absolute top-full mt-1 flex space-x-1 z-10">
          <button
            onClick={() => handleAdjust(-0.1)}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            -0.1
          </button>
          <button
            onClick={() => handleAdjust(0.1)}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            +0.1
          </button>
          <button
            onClick={() => setShowDelta(false)}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-400 rounded hover:bg-gray-500"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}