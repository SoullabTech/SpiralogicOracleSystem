'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ChevronUp, ChevronDown,
  Heart, Sparkles, BookOpen, Calendar, Settings,
  Sun, Moon, Star, Compass, User, Volume2
} from 'lucide-react';

// Import components
import MayaChatInterface from '@/app/maya/chat/page';
import PersonalizationField from '@/components/fields/PersonalizationField';

interface SlidingFieldsState {
  currentView: 'center' | 'left' | 'right' | 'bottom' | 'settings';
  isTransitioning: boolean;
  oracleName: string;
}

export default function SlidingFieldsRefined() {
  const [state, setState] = useState<SlidingFieldsState>({
    currentView: 'center',
    isTransitioning: false,
    oracleName: 'Maya'
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Load personalization
  useEffect(() => {
    const saved = localStorage.getItem('oracle_personalization');
    if (saved) {
      const settings = JSON.parse(saved);
      setState(prev => ({ ...prev, oracleName: settings.oracleName }));
    }
  }, []);

  // Navigation with improved gesture detection
  const navigateToView = (view: 'center' | 'left' | 'right' | 'bottom' | 'settings') => {
    if (state.isTransitioning) return;
    
    setState(prev => ({ ...prev, currentView: view, isTransitioning: true }));
    
    // Subtle haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => {
      setState(prev => ({ ...prev, isTransitioning: false }));
    }, 400);
  };

  // Enhanced swipe detection with velocity consideration
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 30; // Lower threshold for better responsiveness
    const velocityThreshold = 300; // Lower velocity threshold
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    
    // Determine swipe direction based on current view
    if (state.currentView === 'center') {
      // From center, can go any direction
      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        // Horizontal swipe
        if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
          navigateToView('left'); // Swipe right → Check-in
        } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
          navigateToView('right'); // Swipe left → Insights
        }
      } else {
        // Vertical swipe
        if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
          navigateToView('bottom'); // Swipe up → Timeline
        } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
          navigateToView('settings'); // Swipe down → Settings
        }
      }
    } else {
      // From any field, swipe opposite direction returns to center
      const returnThreshold = 20; // Even more sensitive for returning
      
      switch (state.currentView) {
        case 'left':
          if (offset.x < -returnThreshold) navigateToView('center');
          break;
        case 'right':
          if (offset.x > returnThreshold) navigateToView('center');
          break;
        case 'bottom':
          if (offset.y > returnThreshold) navigateToView('center');
          break;
        case 'settings':
          if (offset.y < -returnThreshold) navigateToView('center');
          break;
      }
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(true);
    setDragOffset(info.offset);
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
          else if (state.currentView === 'settings') navigateToView('center');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (state.currentView === 'center') navigateToView('settings');
          else if (state.currentView === 'bottom') navigateToView('center');
          break;
        case 'Escape':
          e.preventDefault();
          navigateToView('center');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.currentView, state.isTransitioning]);

  // Get transform for current view with drag offset
  const getTransform = () => {
    let baseTransform = { x: 0, y: 0 };
    
    switch (state.currentView) {
      case 'left':
        baseTransform.x = 100;
        break;
      case 'right':
        baseTransform.x = -100;
        break;
      case 'bottom':
        baseTransform.y = -100;
        break;
      case 'settings':
        baseTransform.y = 100;
        break;
    }
    
    // Add drag offset for visual feedback
    if (isDragging && state.currentView === 'center') {
      baseTransform.x += dragOffset.x * 0.2; // Reduced multiplier for subtler feedback
      baseTransform.y += dragOffset.y * 0.2;
    }
    
    return `translateX(${baseTransform.x}%) translateY(${baseTransform.y}%)`;
  };

  // Enhanced navigation indicators with settings
  const renderNavigationIndicators = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Settings access */}
      <button
        onClick={() => navigateToView(state.currentView === 'settings' ? 'center' : 'settings')}
        className={`p-2 rounded-full transition-all ${
          state.currentView === 'settings' 
            ? 'bg-amber-600 text-white' 
            : 'bg-black/20 text-white/60 hover:text-white'
        }`}
        title="Personalize"
      >
        <User className="w-4 h-4" />
      </button>
      
      {/* Field indicators */}
      <div className="flex flex-col items-center gap-1">
        {/* Top indicator (Timeline) */}
        <button
          onClick={() => navigateToView(state.currentView === 'bottom' ? 'center' : 'bottom')}
          className={`w-2 h-4 rounded-full transition-all ${
            state.currentView === 'bottom' ? 'bg-amber-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Timeline"
        />
        
        {/* Horizontal indicators */}
        <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
          <button
            onClick={() => navigateToView(state.currentView === 'left' ? 'center' : 'left')}
            className={`w-2 h-2 rounded-full transition-all ${
              state.currentView === 'left' ? 'bg-green-400' : 'bg-white/40 hover:bg-white/60'
            }`}
            title="Check-in"
          />
          <button
            onClick={() => navigateToView('center')}
            className={`w-3 h-3 rounded-full transition-all ${
              state.currentView === 'center' ? 'bg-amber-400' : 'bg-white/40 hover:bg-white/60'
            }`}
            title={state.oracleName}
          />
          <button
            onClick={() => navigateToView(state.currentView === 'right' ? 'center' : 'right')}
            className={`w-2 h-2 rounded-full transition-all ${
              state.currentView === 'right' ? 'bg-blue-400' : 'bg-white/40 hover:bg-white/60'
            }`}
            title="Insights"
          />
        </div>
        
        {/* Bottom indicator (Settings) */}
        <button
          onClick={() => navigateToView(state.currentView === 'settings' ? 'center' : 'settings')}
          className={`w-2 h-4 rounded-full transition-all ${
            state.currentView === 'settings' ? 'bg-amber-400' : 'bg-white/40 hover:bg-white/60'
          }`}
          title="Settings"
        />
      </div>
    </div>
  );

  // Center view - Maya Chat with personalized name
  const renderCenterView = () => (
    <div className="w-full h-full relative">
      {/* Replace Maya's name in the interface */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-light">{state.oracleName}</h1>
              <p className="text-white/60 text-xs">Your personal oracle</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-16">
        <MayaChatInterface />
      </div>
      
      {/* Refined slide hints */}
      <AnimatePresence>
        {state.currentView === 'center' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 3 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
              <div className="flex items-center justify-center gap-6 text-white/50 text-xs">
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ x: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Check-in</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ x: [2, -2, 2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span>Insights</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Timeline</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Left view - Daily Check-in (unchanged)
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
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Check-in content */}
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Quick mood */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-white text-lg mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-4 gap-3">
              {['🌱', '🌞', '🌙', '⚡'].map((emoji, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <span className="text-2xl">{emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Elemental resonance */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-white text-lg mb-4">Today's Element</h3>
            <div className="flex gap-2">
              {[
                { element: 'Fire', color: 'from-red-500 to-orange-500', emoji: '🔥' },
                { element: 'Water', color: 'from-blue-500 to-cyan-500', emoji: '💧' },
                { element: 'Earth', color: 'from-green-500 to-emerald-500', emoji: '🌍' },
                { element: 'Air', color: 'from-gray-400 to-blue-400', emoji: '💨' },
                { element: 'Aether', color: 'from-amber-500 to-pink-500', emoji: '✨' }
              ].map((el) => (
                <motion.button
                  key={el.element}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <div className="text-center">
                    <span className="text-xl">{el.emoji}</span>
                    <p className="text-white/80 text-xs mt-1">{el.element}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick journal */}
          <div className="bg-white/5 rounded-2xl p-6">
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
              >
                Save to {state.oracleName}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Right view - Insights (unchanged but with oracle name)
  const renderRightView = () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-cyan-900 relative">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateToView('center')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white text-2xl font-light text-right">Insights</h1>
              <p className="text-white/60 text-sm text-right">Wisdom from {state.oracleName}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Insights content (rest unchanged) */}
        <div className="flex-1 space-y-4 overflow-y-auto">
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
              <Moon className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-white text-lg">Oracle Card</h3>
                <p className="text-white/60 text-sm">Trust • Inner Knowing</p>
              </div>
            </div>
            <p className="text-white/80">
              {state.oracleName} draws this card for you: You already know the answer. 
              Trust the quiet voice within that has been guiding you all along.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white text-sm transition-colors"
            >
              Draw New Card
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  // Bottom view - Timeline (unchanged)
  const renderBottomView = () => (
    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-indigo-900 relative">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-light">Timeline</h1>
              <p className="text-white/60 text-sm">Your journey with {state.oracleName}</p>
            </div>
          </div>
          
          <button
            onClick={() => navigateToView('center')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Timeline content */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {[
            { date: 'Today', content: 'Reflected on gratitude and new possibilities opening...', type: 'journal' },
            { date: 'Yesterday', content: 'Dreamed of flowing water and felt called to be more flexible...', type: 'dream' },
            { date: '3 days ago', content: `Breakthrough conversation with ${state.oracleName} about creative blocks...`, type: 'insight' },
            { date: '1 week ago', content: 'Started daily meditation practice, feeling more centered...', type: 'ritual' }
          ].map((entry, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
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
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // Settings view - Personalization
  const renderSettingsView = () => (
    <div className="w-full h-full bg-gradient-to-br from-amber-950 via-yellow-950 to-black relative overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-light">Personalize Your Oracle</h1>
              <p className="text-white/60 text-sm">Make {state.oracleName} uniquely yours</p>
            </div>
          </div>
          
          <button
            onClick={() => navigateToView('center')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Personalization component */}
        <PersonalizationField />
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden relative">
      {/* Navigation indicators */}
      {renderNavigationIndicators()}

      {/* Main sliding container */}
      <motion.div
        className="w-full h-full"
        style={{
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
        drag={state.currentView === 'center'}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      >
        {/* All views rendered but positioned off-screen */}
        <div className="relative w-full h-full">
          {/* Center - Maya */}
          <div className="absolute inset-0">
            {renderCenterView()}
          </div>
          
          {/* Left - Check-in */}
          <div className="absolute inset-0 -translate-x-full">
            {state.currentView === 'left' && renderLeftView()}
          </div>
          
          {/* Right - Insights */}
          <div className="absolute inset-0 translate-x-full">
            {state.currentView === 'right' && renderRightView()}
          </div>
          
          {/* Bottom - Timeline */}
          <div className="absolute inset-0 translate-y-full">
            {state.currentView === 'bottom' && renderBottomView()}
          </div>
          
          {/* Top - Settings */}
          <div className="absolute inset-0 -translate-y-full">
            {state.currentView === 'settings' && renderSettingsView()}
          </div>
        </div>
      </motion.div>

      {/* Visual feedback for dragging */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white pointer-events-none z-30"
          />
        )}
      </AnimatePresence>
    </div>
  );
}