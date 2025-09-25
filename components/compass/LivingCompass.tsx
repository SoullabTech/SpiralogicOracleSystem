'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Brain, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Compass, Stars, Sun, Moon, Sparkles, Book,
  Calendar, Heart, Wind
} from 'lucide-react';

// Import existing Maya chat interface
import MayaChatInterface from '@/app/maya/chat/page';

interface CompassField {
  id: 'north' | 'south' | 'east' | 'west';
  name: string;
  description: string;
  element: string;
  color: string;
  icon: React.ReactNode;
  active: boolean;
}

interface CompassState {
  currentField: 'center' | 'north' | 'south' | 'east' | 'west';
  isTransitioning: boolean;
}

export default function LivingCompass() {
  const [compassState, setCompassState] = useState<CompassState>({
    currentField: 'center',
    isTransitioning: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Define the four cardinal fields
  const compassFields: CompassField[] = [
    {
      id: 'north',
      name: 'Stories & Memory',
      description: 'Journals, past conversations, relived moments',
      element: 'aether',
      color: 'from-amber-900 to-indigo-900',
      icon: <Book className="w-6 h-6" />,
      active: true
    },
    {
      id: 'south', 
      name: 'Daily Check-In',
      description: 'Mood, elemental state, what\'s alive today',
      element: 'earth',
      color: 'from-green-900 to-emerald-900',
      icon: <Heart className="w-6 h-6" />,
      active: true
    },
    {
      id: 'east',
      name: 'Astrology',
      description: 'Daily transits, natal chart, sky mirror',
      element: 'air',
      color: 'from-cyan-900 to-blue-900',
      icon: <Sun className="w-6 h-6" />,
      active: true
    },
    {
      id: 'west',
      name: 'Divination',
      description: 'Tarot, I Ching, oracle cards',
      element: 'water',
      color: 'from-blue-900 to-amber-900',
      icon: <Moon className="w-6 h-6" />,
      active: true
    }
  ];

  // Navigation functions
  const navigateToField = (fieldId: 'center' | 'north' | 'south' | 'east' | 'west') => {
    if (compassState.isTransitioning) return;
    
    setCompassState({
      currentField: fieldId,
      isTransitioning: true
    });

    // Add micro-ritual sound/vibration here
    playTransitionRitual(fieldId);
    
    setTimeout(() => {
      setCompassState(prev => ({ ...prev, isTransitioning: false }));
    }, 500);
  };

  const playTransitionRitual = (fieldId: string) => {
    // Different subtle sounds for different fields
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Different frequencies for different elements
    const frequencies = {
      center: 432, // Maya's frequency
      north: 528,  // Stories (love frequency)  
      south: 396,  // Grounding
      east: 741,   // Awakening
      west: 639    // Connection
    };
    
    oscillator.frequency.setValueAtTime(frequencies[fieldId as keyof typeof frequencies] || 432, context.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > minSwipeDistance) {
        // Swipe right - go to East field
        navigateToField('east');
      } else if (deltaX < -minSwipeDistance) {
        // Swipe left - go to West field  
        navigateToField('west');
      }
    } else {
      // Vertical swipe
      if (deltaY > minSwipeDistance) {
        // Swipe down - go to South field
        navigateToField('south');
      } else if (deltaY < -minSwipeDistance) {
        // Swipe up - go to North field
        navigateToField('north');
      }
    }
    
    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (compassState.isTransitioning) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateToField('north');
          break;
        case 'ArrowDown':
          e.preventDefault();  
          navigateToField('south');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToField('west');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToField('east');
          break;
        case 'Escape':
          e.preventDefault();
          navigateToField('center');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [compassState.isTransitioning]);

  // Get current field data
  const getCurrentField = () => {
    return compassFields.find(f => f.id === compassState.currentField);
  };

  const renderCompassIndicator = () => (
    <motion.div 
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="relative">
        {/* Compass rose */}
        <div className="w-16 h-16 relative">
          {/* Center dot (Maya) */}
          <div 
            onClick={() => navigateToField('center')}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              compassState.currentField === 'center' 
                ? 'bg-amber-400 shadow-lg shadow-amber-400/50' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
          />
          
          {/* Cardinal direction indicators */}
          {compassFields.map((field) => {
            const positions = {
              north: 'top-0 left-1/2 transform -translate-x-1/2',
              south: 'bottom-0 left-1/2 transform -translate-x-1/2', 
              east: 'right-0 top-1/2 transform -translate-y-1/2',
              west: 'left-0 top-1/2 transform -translate-y-1/2'
            };
            
            return (
              <div
                key={field.id}
                onClick={() => navigateToField(field.id)}
                className={`absolute w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${positions[field.id]} ${
                  compassState.currentField === field.id
                    ? 'bg-white shadow-lg shadow-white/50' 
                    : field.active 
                    ? 'bg-white/40 hover:bg-white/60' 
                    : 'bg-white/20'
                }`}
                title={field.name}
              />
            );
          })}
        </div>
        
        {/* Current field label */}
        <div className="mt-2 text-center">
          <p className="text-white/80 text-xs font-light">
            {compassState.currentField === 'center' ? 'Maya' : getCurrentField()?.name}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderMayaCenter = () => (
    <motion.div
      key="maya-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <MayaChatInterface />
      
      {/* Subtle swipe hints */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="text-white/40 text-xs text-center"
        >
          <p>Swipe or use arrow keys to explore fields</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <ArrowLeft className="w-3 h-3" />
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            <ArrowRight className="w-3 h-3" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderField = (field: CompassField) => (
    <motion.div
      key={field.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`w-full h-full bg-gradient-to-br ${field.color}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {/* Field header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              {field.icon}
            </div>
            <div>
              <h1 className="text-white text-2xl font-light">{field.name}</h1>
              <p className="text-white/60 text-sm">{field.description}</p>
            </div>
          </div>
          
          {/* Element indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <Wind className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm capitalize">{field.element} field</span>
          </div>
        </div>

        {/* Field content placeholder */}
        <div className="px-6 py-4">
          <div className="bg-white/5 rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center">
            <Sparkles className="w-12 h-12 text-white/40 mb-4" />
            <h3 className="text-white/80 text-xl mb-2">Coming Soon</h3>
            <p className="text-white/60 text-center max-w-md">
              This sacred field is being lovingly crafted. Soon you'll be able to explore {field.name.toLowerCase()} with Maya's guidance.
            </p>
          </div>
        </div>

        {/* Return to center hint */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <motion.button
            onClick={() => navigateToField('center')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm transition-colors"
          >
            <Brain className="w-4 h-4" />
            Return to Maya
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-amber-950 via-yellow-950 to-black"
    >
      {/* Compass indicator */}
      {renderCompassIndicator()}
      
      {/* Field content */}
      <AnimatePresence mode="wait">
        {compassState.currentField === 'center' && renderMayaCenter()}
        {compassState.currentField !== 'center' && (
          renderField(compassFields.find(f => f.id === compassState.currentField)!)
        )}
      </AnimatePresence>

      {/* Ambient presence shifts */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Subtle animated stars for north field */}
        {compassState.currentField === 'north' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 text-white/40 text-xs">
          <p>Current: {compassState.currentField}</p>
          <p>Transitioning: {compassState.isTransitioning ? 'Yes' : 'No'}</p>
          <p>Use arrow keys or swipe to navigate</p>
        </div>
      )}
    </div>
  );
}