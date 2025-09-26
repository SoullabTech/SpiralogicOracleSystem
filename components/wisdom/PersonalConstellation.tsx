'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Compass } from 'lucide-react';
import { getFacet, getRelevantFacets, type Element, type SpiralPhase } from '@/lib/wisdom/WisdomFacets';
import { VoiceCard } from './VoiceCard';

interface PersonalConstellationProps {
  selectedFacetIds: string[];
  onToggleFacet?: (facetId: string) => void;
  currentElement?: Element;
  currentPhase?: SpiralPhase;
}

const ELEMENT_EMOJIS = {
  earth: '🜃',
  water: '🜄',
  fire: '🜂',
  air: '🜁',
  aether: '🜀'
};

export function PersonalConstellation({
  selectedFacetIds,
  onToggleFacet,
  currentElement,
  currentPhase
}: PersonalConstellationProps) {
  const selectedFacets = useMemo(
    () => selectedFacetIds.map(id => getFacet(id)).filter(Boolean),
    [selectedFacetIds]
  );

  // Get element distribution
  const elementDistribution = useMemo(() => {
    const distribution: Record<Element, number> = {
      earth: 0,
      water: 0,
      fire: 0,
      air: 0,
      aether: 0
    };

    selectedFacets.forEach(facet => {
      facet?.primaryElements.forEach(element => {
        distribution[element]++;
      });
    });

    return distribution;
  }, [selectedFacets]);

  // Get suggestions based on current context
  const suggestions = useMemo(() => {
    if (selectedFacetIds.length === 0) {
      return getRelevantFacets({
        elements: currentElement ? [currentElement] : undefined,
        phase: currentPhase,
        limit: 3
      });
    }

    // Find underrepresented elements
    const underrepresented = Object.entries(elementDistribution)
      .filter(([_, count]) => count === 0)
      .map(([element]) => element as Element);

    if (underrepresented.length > 0) {
      return getRelevantFacets({
        elements: underrepresented.slice(0, 2),
        limit: 3
      }).filter(f => !selectedFacetIds.includes(f.id));
    }

    return [];
  }, [selectedFacetIds, elementDistribution, currentElement, currentPhase]);

  // Get insights
  const insights = useMemo(() => {
    const messages: string[] = [];

    if (selectedFacets.length === 0) {
      return ['Select wisdom voices that resonate with where you are right now.'];
    }

    // Element balance insights
    const dominantElement = Object.entries(elementDistribution)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as Element;

    const elementMessages: Record<Element, string> = {
      earth: 'Your constellation is grounded in practical wisdom and embodiment.',
      water: 'Your constellation flows through emotional depth and feeling.',
      fire: 'Your constellation burns with vision and transformation.',
      air: 'Your constellation soars through clarity and perspective.',
      aether: 'Your constellation reaches toward mystery and integration.'
    };

    if (elementDistribution[dominantElement] > 1) {
      messages.push(elementMessages[dominantElement]);
    }

    // Diversity insight
    const elementCount = Object.values(elementDistribution).filter(c => c > 0).length;
    if (elementCount >= 4) {
      messages.push('You\'re weaving together multiple perspectives - a truly integral approach.');
    } else if (elementCount === 1) {
      messages.push('Consider exploring other elements to bring more dimensions to your journey.');
    }

    // Specific combinations
    if (selectedFacetIds.includes('jung') && selectedFacetIds.includes('brown')) {
      messages.push('Shadow work meets vulnerability - a powerful combination for depth.');
    }

    if (selectedFacetIds.includes('nietzsche') && selectedFacetIds.includes('frankl')) {
      messages.push('Will and meaning intertwine - transformation through purpose.');
    }

    if (selectedFacetIds.includes('maslow') && selectedFacetIds.includes('buddhist')) {
      messages.push('Building capacity while releasing attachment - walking the middle path.');
    }

    return messages.length > 0 ? messages : ['Your constellation is taking shape.'];
  }, [selectedFacets, elementDistribution, selectedFacetIds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-light text-amber-50 mb-1">
            Your Constellation
          </h2>
          <p className="text-sm text-amber-200/60">
            {selectedFacets.length === 0
              ? 'Select the wisdom voices that resonate with you'
              : `${selectedFacets.length} ${selectedFacets.length === 1 ? 'voice' : 'voices'} guiding your journey`
            }
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Element distribution */}
      {selectedFacets.length > 0 && (
        <div className="bg-black/20 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-amber-200/80">
              Elemental Balance
            </h3>
          </div>
          <div className="space-y-2">
            {Object.entries(elementDistribution).map(([element, count]) => {
              const percentage = selectedFacets.length > 0
                ? (count / selectedFacets.length) * 100
                : 0;

              return (
                <div key={element} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {ELEMENT_EMOJIS[element as Element]}
                      </span>
                      <span className="text-amber-200/70 capitalize">{element}</span>
                    </div>
                    <span className="text-amber-200/60">
                      {count > 0 ? `${Math.round(percentage)}%` : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-amber-500/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400/80 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <p key={i} className="text-sm text-amber-200/80 leading-relaxed">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected voices */}
      {selectedFacets.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-200/80 mb-3">
            Your Active Voices
          </h3>
          <div className="space-y-3">
            {selectedFacets.map(facet => facet && (
              <VoiceCard
                key={facet.id}
                facet={facet}
                isSelected={true}
                onToggle={onToggleFacet}
                showSelection={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-200/80 mb-2">
            {selectedFacets.length === 0
              ? 'Recommended Starting Points'
              : 'Consider Exploring'
            }
          </h3>
          <p className="text-xs text-amber-200/50 mb-3">
            {selectedFacets.length === 0
              ? 'These voices align with your current phase and elements'
              : 'These voices could bring new dimensions to your constellation'
            }
          </p>
          <div className="space-y-3">
            {suggestions.map(facet => (
              <VoiceCard
                key={facet.id}
                facet={facet}
                isSelected={false}
                onToggle={onToggleFacet}
                showSelection={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}