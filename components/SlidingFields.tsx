'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ChevronUp,
  Heart, Sparkles, BookOpen, Calendar, 
  Sun, Moon, Star, Compass
} from 'lucide-react';

// Import Maya chat
import MayaChatInterface from '@/app/maya/chat/page';

interface SlidingFieldsState {
  currentView: 'center' | 'left' | 'right' | 'bottom';
  isTransitioning: boolean;
}

export default function SlidingFields() {
  const [state, setState] = useState<SlidingFieldsState>({
    currentView: 'center',
    isTransitioning: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Navigation functions
  const navigateToView = (view: 'center' | 'left' | 'right' | 'bottom') => {
    if (state.isTransitioning) return;
    
    setState({ currentView: view, isTransitioning: true });
    
    // Subtle haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 400);
  };

  // Swipe detection
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    
    // Horizontal swipes
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
        // Swipe right - go to left panel (Daily Check-in)
        if (state.currentView === 'center') navigateToView('left');
        else if (state.currentView === 'right') navigateToView('center');
      } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
        // Swipe left - go to right panel (Insights)
        if (state.currentView === 'center') navigateToView('right');
        else if (state.currentView === 'left') navigateToView('center');
      }
    } else {
      // Vertical swipes
      if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
        // Swipe up - go to bottom panel (Timeline)
        if (state.currentView === 'center') navigateToView('bottom');
      } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
        // Swipe down - return to center
        if (state.currentView === 'bottom') navigateToView('center');
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (state.isTransitioning) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (state.currentView === 'center') navigateToView('left');
          else if (state.currentView === 'right') navigateToView('center');
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (state.currentView === 'center') navigateToView('right');
          else if (state.currentView === 'left') navigateToView('center');
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (state.currentView === 'center') navigateToView('bottom');
          break;
        case 'ArrowDown':
        case 'Escape':
          e.preventDefault();
          navigateToView('center');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.currentView, state.isTransitioning]);

  // Get transform for current view
  const getTransform = () => {
    switch (state.currentView) {
      case 'left': return 'translateX(100%)';
      case 'right': return 'translateX(-100%)';
      case 'bottom': return 'translateY(-100%)';
      default: return 'translateX(0) translateY(0)';
    }
  };

  // Navigation indicators
  const renderNavigationIndicators = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Horizontal navigation */}
      <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
        <button
          onClick={() => navigateToView(state.currentView === 'left' ? 'center' : 'left')}
          className={`w-2 h-2 rounded-full transition-all ${
            state.currentView === 'left' ? 'bg-green-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Daily Check-in"
        />
        <button
          onClick={() => navigateToView('center')}
          className={`w-3 h-3 rounded-full transition-all ${
            state.currentView === 'center' ? 'bg-amber-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Maya"
        />
        <button
          onClick={() => navigateToView(state.currentView === 'right' ? 'center' : 'right')}
          className={`w-2 h-2 rounded-full transition-all ${
            state.currentView === 'right' ? 'bg-blue-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Insights"
        />
      </div>
      
      {/* Bottom navigation */}
      <div className="flex justify-center">
        <button
          onClick={() => navigateToView(state.currentView === 'bottom' ? 'center' : 'bottom')}
          className={`w-2 h-4 rounded-full transition-all ${
            state.currentView === 'bottom' ? 'bg-purple-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Timeline"
        />
      </div>
    </div>
  );

  // Center view - Maya Chat
  const renderCenterView = () => (
    <div className="w-full h-full relative">
      <MayaChatInterface />
      
      {/* Gentle slide hints */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-white/40 text-xs text-center"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              <span>Insights</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <span>Timeline</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Left view - Daily Check-in
  const renderLeftView = () => (
    <div className="w-full h-full bg-gradient-to-br from-green-900 to-emerald-900 relative">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-light">Daily Check-In</h1>
              <p className="text-white/60 text-sm">Ground into what's alive today</p>
            </div>
          </div>
          
          <button
            onClick={() => navigateToView('center')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Check-in content */}
        <div className="flex-1 space-y-6">
          {/* Quick mood */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-white text-lg mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-4 gap-3">
              {['🌱', '🌞', '🌙', '⚡'].map((emoji, idx) => (
                <button
                  key={idx}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <span className="text-2xl">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick journal */}
          <div className="bg-white/5 rounded-2xl p-6 flex-1">
            <h3 className="text-white text-lg mb-4">What's alive in you today?</h3>
            <textarea
              placeholder="Just a few words or a full reflection..."
              className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-green-400 resize-none"
            />
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">Dream</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">Insight</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">Gratitude</span>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Right view - Insights
  const renderRightView = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-cyan-900 relative">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateToView('center')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white text-2xl font-light text-right">Insights</h1>
              <p className="text-white/60 text-sm text-right">Wisdom from the patterns</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Insights tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { id: 'astrology', label: 'Sky', icon: Sun },
            { id: 'cards', label: 'Cards', icon: Moon },
            { id: 'patterns', label: 'Patterns', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-white text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Insight content */}
        <div className="flex-1 space-y-4">
          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-white text-lg">Today's Sky Mirror</h3>
                <p className="text-white/60 text-sm">Venus in harmonious aspect</p>
              </div>
            </div>
            <p className="text-white/80">
              The planets suggest a day for connection and creative expression. Your heart's wisdom 
              is especially clear today.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-purple-400" />
              <div>
                <h3 className="text-white text-lg">Oracle Card</h3>
                <p className="text-white/60 text-sm">Trust • Inner Knowing</p>
              </div>
            </div>
            <p className="text-white/80">
              You already know the answer. Trust the quiet voice within that has been 
              guiding you all along.
            </p>
            
            <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
              Draw New Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Bottom view - Timeline
  const renderBottomView = () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 relative">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-light">Timeline</h1>
              <p className="text-white/60 text-sm">Your journey through time</p>
            </div>
          </div>
          
          <button
            onClick={() => navigateToView('center')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline content */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Sample timeline entries */}
          {[
            { date: 'Today', content: 'Reflected on gratitude and new possibilities opening...', type: 'journal' },
            { date: 'Yesterday', content: 'Dreamed of flowing water and felt called to be more flexible...', type: 'dream' },
            { date: '3 days ago', content: 'Breakthrough conversation with Maya about creative blocks...', type: 'insight' },
            { date: '1 week ago', content: 'Started daily meditation practice, feeling more centered...', type: 'ritual' }
          ].map((entry, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/60 text-xs">{entry.date}</span>
                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60 capitalize">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{entry.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden relative">
      {/* Navigation indicators */}
      {renderNavigationIndicators()}

      {/* Main content area */}
      <motion.div
        className="w-full h-full flex"
        style={{
          width: '300%', // Accommodate left, center, right
          transform: getTransform(),
        }}
        animate={{
          transform: getTransform(),
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.4
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Left panel - Daily Check-in */}
        <div className="w-1/3 h-full flex-shrink-0">
          {state.currentView === 'left' ? renderLeftView() : null}
        </div>
        
        {/* Center panel - Maya Chat */}
        <div className="w-1/3 h-full flex-shrink-0">
          {renderCenterView()}
        </div>
        
        {/* Right panel - Insights */}
        <div className="w-1/3 h-full flex-shrink-0">
          {state.currentView === 'right' ? renderRightView() : null}
        </div>
      </motion.div>

      {/* Bottom panel - Timeline (overlay) */}
      <AnimatePresence>
        {state.currentView === 'bottom' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40"
          >
            {renderBottomView()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 text-white/40 text-xs bg-black/50 p-2 rounded">
          <p>View: {state.currentView}</p>
          <p>Swipe or arrow keys to navigate</p>
        </div>
      )}
    </div>
  );
}