'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useGesture } from '@use-gesture/react';
import { HoloflowerCore } from '../holoflower/HoloflowerCore';
import HigherSelfSystemPanel from '../consciousness/HigherSelfSystemPanel';
import SubconsciousOperationsPanel from '../consciousness/SubconsciousOperationsPanel';
import LeftAnalyticsPanel from '../panels/LeftAnalyticsPanel';
import RightVisualizationPanel from '../panels/RightVisualizationPanel';

/**
 * FIVE-FOLD INTERFACE
 * Central holoflower with sliding petals, surrounded by four pages/fields
 * User can slide between center and any of the four surrounding fields
 *
 * Navigation:
 * - Swipe or click arrows to slide to adjacent fields
 * - Petals in holoflower activate corresponding field combinations
 * - Return to center button always visible
 * - Smooth transitions between all five spaces
 */

type ActiveView = 'center' | 'top' | 'bottom' | 'left' | 'right';

interface ViewState {
  current: ActiveView;
  previous: ActiveView;
  transitioning: boolean;
}

const FiveFoldInterface: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({
    current: 'center',
    previous: 'center',
    transitioning: false
  });

  const [holoflowerEnergy, setHoloflowerEnergy] = useState<'dense' | 'emerging' | 'radiant'>('emerging');
  const [selectedPetal, setSelectedPetal] = useState<any>(null);
  const [fieldResonance, setFieldResonance] = useState({
    top: 0.3,
    bottom: 0.3,
    left: 0.3,
    right: 0.3
  });

  // Navigation functions
  const navigateTo = useCallback((destination: ActiveView) => {
    if (destination === viewState.current || viewState.transitioning) return;

    setViewState({
      current: destination,
      previous: viewState.current,
      transitioning: true
    });

    // Update field resonance
    if (destination !== 'center') {
      setFieldResonance(prev => ({
        ...prev,
        [destination]: Math.min(1, prev[destination as keyof typeof prev] + 0.2)
      }));
    }

    // Complete transition
    setTimeout(() => {
      setViewState(prev => ({ ...prev, transitioning: false }));
    }, 500);
  }, [viewState.current, viewState.transitioning]);

  // Handle petal selection - activates corresponding fields
  const handlePetalSelect = useCallback((petal: any) => {
    setSelectedPetal(petal);

    // Navigate based on element
    // Fire/Water = Right, Earth/Air = Left, Air/Fire = Top, Water/Earth = Bottom
    const elementNavigation: Record<string, ActiveView> = {
      'fire': 'right',  // Fire primary = right hemisphere
      'water': 'right', // Water primary = right hemisphere
      'air': 'left',    // Air primary = left hemisphere
      'earth': 'left'   // Earth primary = left hemisphere
    };

    const destination = elementNavigation[petal.element];
    if (destination) {
      navigateTo(destination);
    }
  }, [navigateTo]);

  // Gesture controls for sliding
  const bind = useGesture({
    onDrag: ({ direction: [dx, dy], distance, cancel }) => {
      if (distance > 50 && !viewState.transitioning) {
        cancel();

        // Determine navigation based on swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 0 && viewState.current === 'center') navigateTo('left');
          else if (dx < 0 && viewState.current === 'center') navigateTo('right');
          else if (dx > 0 && viewState.current === 'right') navigateTo('center');
          else if (dx < 0 && viewState.current === 'left') navigateTo('center');
        } else {
          // Vertical swipe
          if (dy > 0 && viewState.current === 'center') navigateTo('top');
          else if (dy < 0 && viewState.current === 'center') navigateTo('bottom');
          else if (dy > 0 && viewState.current === 'bottom') navigateTo('center');
          else if (dy < 0 && viewState.current === 'top') navigateTo('center');
        }
      }
    }
  });

  // Get slide transform based on current view
  const getTransform = (view: ActiveView) => {
    const transforms: Record<ActiveView, string> = {
      'center': 'translate(0, 0)',
      'top': 'translate(0, -100%)',
      'bottom': 'translate(0, 100%)',
      'left': 'translate(-100%, 0)',
      'right': 'translate(100%, 0)'
    };
    return transforms[view];
  };

  // Navigation arrows
  const NavigationArrows = () => (
    <>
      {/* Return to center button - always visible when not at center */}
      {viewState.current !== 'center' && (
        <motion.button
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-600/20 backdrop-blur-md rounded-full text-white text-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigateTo('center')}
        >
          ◉ Return to Center
        </motion.button>
      )}

      {/* Directional arrows when at center */}
      {viewState.current === 'center' && (
        <>
          {/* Top arrow */}
          <motion.button
            className="absolute top-8 left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={() => navigateTo('top')}
          >
            <div className="w-12 h-12 rounded-full bg-amber-600/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xl">↑</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Higher Self</span>
          </motion.button>

          {/* Bottom arrow */}
          <motion.button
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={() => navigateTo('bottom')}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xl">↓</span>
            </div>
            <span className="text-xs text-gray-400 mt-1 block">Deep Psyche</span>
          </motion.button>

          {/* Left arrow */}
          <motion.button
            className="absolute left-8 top-1/2 -translate-y-1/2 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={() => navigateTo('left')}
          >
            <div className="w-12 h-12 rounded-full bg-blue-600/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xl">←</span>
            </div>
            <span className="text-xs text-gray-400 ml-2 block">Analytics</span>
          </motion.button>

          {/* Right arrow */}
          <motion.button
            className="absolute right-8 top-1/2 -translate-y-1/2 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={() => navigateTo('right')}
          >
            <div className="w-12 h-12 rounded-full bg-amber-600/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
            <span className="text-xs text-gray-400 mr-2 block">Intuition</span>
          </motion.button>
        </>
      )}
    </>
  );

  // Mini-map indicator
  const MiniMap = () => (
    <div className="absolute bottom-4 right-4 z-50">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-lg p-3">
        <div className="grid grid-cols-3 gap-1">
          {/* Top */}
          <div className="col-start-2">
            <div className={`w-6 h-6 rounded ${viewState.current === 'top' ? 'bg-amber-500' : 'bg-gray-700'}`} />
          </div>
          {/* Middle row */}
          <div className={`w-6 h-6 rounded ${viewState.current === 'left' ? 'bg-blue-500' : 'bg-gray-700'}`} />
          <div className={`w-6 h-6 rounded ${viewState.current === 'center' ? 'bg-white' : 'bg-gray-700'}`} />
          <div className={`w-6 h-6 rounded ${viewState.current === 'right' ? 'bg-amber-500' : 'bg-gray-700'}`} />
          {/* Bottom */}
          <div className="col-start-2">
            <div className={`w-6 h-6 rounded ${viewState.current === 'bottom' ? 'bg-indigo-500' : 'bg-gray-700'}`} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black" {...bind()}>
      {/* Sliding container */}
      <motion.div
        className="absolute inset-0 w-[300vw] h-[300vh] grid grid-cols-3 grid-rows-3"
        animate={{
          transform: getTransform(viewState.current)
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        style={{
          gridTemplateColumns: '100vw 100vw 100vw',
          gridTemplateRows: '100vh 100vh 100vh',
          left: '-100vw',
          top: '-100vh'
        }}
      >
        {/* Row 1 */}
        <div /> {/* Empty */}
        <div className="relative">
          {/* Top Field - Higher Self Systems */}
          <HigherSelfSystemPanel viewMode="integrated" />
        </div>
        <div /> {/* Empty */}

        {/* Row 2 */}
        <div className="relative">
          {/* Left Field - Emissary Analytics */}
          <LeftAnalyticsPanel />
        </div>

        <div className="relative">
          {/* Center - Holoflower */}
          <div className="w-full h-full">
            <HoloflowerCore
              onPetalSelect={handlePetalSelect}
              energyState={holoflowerEnergy}
            />
          </div>
        </div>

        <div className="relative">
          {/* Right Field - Master Intuition */}
          <RightVisualizationPanel />
        </div>

        {/* Row 3 */}
        <div /> {/* Empty */}
        <div className="relative">
          {/* Bottom Field - Subconscious Operations */}
          <SubconsciousOperationsPanel viewMode="integrated" />
        </div>
        <div /> {/* Empty */}
      </motion.div>

      {/* Navigation UI */}
      <NavigationArrows />
      <MiniMap />

      {/* Field transition overlay */}
      <AnimatePresence>
        {viewState.transitioning && (
          <motion.div
            className="absolute inset-0 bg-black/50 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Current view indicator */}
      <div className="absolute top-4 right-4 z-50">
        <motion.div
          className="bg-slate-900/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-gray-500">Current Field:</span>
          <span className="ml-2 text-white font-medium">
            {viewState.current === 'center' ? 'Pure Presence' :
             viewState.current === 'top' ? 'Higher Self' :
             viewState.current === 'bottom' ? 'Deep Psyche' :
             viewState.current === 'left' ? 'Emissary Mind' :
             'Master Wisdom'}
          </span>
        </motion.div>
      </div>

      {/* Petal selection info */}
      <AnimatePresence>
        {selectedPetal && (
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl px-6 py-3">
              <div className="text-sm text-amber-400">
                {selectedPetal.element} • {selectedPetal.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedPetal.message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FiveFoldInterface;