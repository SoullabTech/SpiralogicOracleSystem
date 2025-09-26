'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, User, Sparkles, RefreshCw } from 'lucide-react';
import { ConstellationMap } from '@/components/wisdom/ConstellationMap';
import { PersonalConstellation } from '@/components/wisdom/PersonalConstellation';
import { WisdomQuoteCard } from '@/components/wisdom/WisdomQuoteCard';
import { getAllFacets } from '@/lib/wisdom/WisdomFacets';
import { getQuotesFromConstellation, getContextualQuote } from '@/lib/wisdom/WisdomQuotes';
import { Holoflower } from '@/components/ui/Holoflower';

type View = 'map' | 'personal';

export default function WisdomConstellationPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('map');
  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);
  const [currentQuote, setCurrentQuote] = useState<any>(null);

  // Load saved facets from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('onboardingData');
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data.wisdomFacets) {
        setSelectedFacets(data.wisdomFacets);
      }
    }
  }, []);

  // Get a contextual quote when facets change
  useEffect(() => {
    if (selectedFacets.length > 0) {
      const quote = getContextualQuote({
        voiceIds: selectedFacets
      });
      setCurrentQuote(quote);
    }
  }, [selectedFacets]);

  const handleToggleFacet = (facetId: string) => {
    setSelectedFacets(prev => {
      const newFacets = prev.includes(facetId)
        ? prev.filter(id => id !== facetId)
        : [...prev, facetId];

      // Save to localStorage
      const storedData = localStorage.getItem('onboardingData');
      if (storedData) {
        const data = JSON.parse(storedData);
        data.wisdomFacets = newFacets;
        localStorage.setItem('onboardingData', JSON.stringify(data));
      }

      return newFacets;
    });
  };

  const refreshQuote = () => {
    if (selectedFacets.length > 0) {
      const quote = getContextualQuote({
        voiceIds: selectedFacets
      });
      setCurrentQuote(quote);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] px-4 py-8">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-200/60 hover:text-amber-200/80 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Holoflower size="lg" glowIntensity="medium" />
              <div>
                <h1 className="text-3xl font-light text-amber-50 mb-2">
                  Wisdom Constellation
                </h1>
                <p className="text-sm text-amber-200/60">
                  Explore the voices that illuminate different aspects of your journey
                </p>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex gap-2 bg-black/30 border border-amber-500/20 rounded-lg p-1">
              <button
                onClick={() => setView('map')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm
                  ${view === 'map'
                    ? 'bg-amber-500/20 text-amber-100'
                    : 'text-amber-200/60 hover:text-amber-200/80'
                  }
                `}
              >
                <Map className="w-4 h-4" />
                <span>Constellation Map</span>
              </button>
              <button
                onClick={() => setView('personal')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm
                  ${view === 'personal'
                    ? 'bg-amber-500/20 text-amber-100'
                    : 'text-amber-200/60 hover:text-amber-200/80'
                  }
                `}
              >
                <User className="w-4 h-4" />
                <span>Your Constellation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quote of the moment */}
        <AnimatePresence mode="wait">
          {currentQuote && (
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="text-sm text-amber-200/70">
                    A voice from your constellation
                  </p>
                </div>
                <button
                  onClick={refreshQuote}
                  className="text-amber-200/60 hover:text-amber-200/80 transition-colors"
                  title="New quote"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <WisdomQuoteCard quote={currentQuote} showSource={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {view === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ConstellationMap
                selectedFacets={selectedFacets}
                onFacetClick={handleToggleFacet}
                showConnections={true}
              />

              {/* Legend / Instructions */}
              <div className="mt-6 bg-black/30 border border-amber-500/20 rounded-xl p-5">
                <h3 className="text-sm font-medium text-amber-200/80 mb-3">
                  How to use the constellation map
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-200/60">
                  <div>
                    <span className="text-amber-300 font-medium">✨ Stars:</span> Each star represents
                    a wisdom voice. Hover to see details, click to select/deselect.
                  </div>
                  <div>
                    <span className="text-amber-300 font-medium">🎨 Colors:</span> Stars are colored
                    by their primary element - Earth, Water, Fire, Air, or Aether.
                  </div>
                  <div>
                    <span className="text-amber-300 font-medium">🔗 Connections:</span> Lines show
                    shared elemental resonance between different voices.
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-6">
                <PersonalConstellation
                  selectedFacetIds={selectedFacets}
                  onToggleFacet={handleToggleFacet}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coming soon section */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/5 to-amber-500/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-medium text-amber-100 mb-2">
                Coming Soon: Ask Maia
              </h3>
              <p className="text-sm text-amber-200/70 leading-relaxed mb-3">
                Soon you&apos;ll be able to ask Maia to channel specific wisdom voices:
                &ldquo;What would Jung say about this?&rdquo; or &ldquo;How would Rumi see this situation?&rdquo;
              </p>
              <p className="text-xs text-amber-200/50">
                We&apos;re also expanding the constellation to include voices like David Bohm, Maya Angelou,
                Rumi, Ibn Al-Arabi, and many more sacred teachers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}