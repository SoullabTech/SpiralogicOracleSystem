'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { HoloflowerMotion } from './HoloflowerMotion';
import { HoloflowerTimeline } from './HoloflowerTimeline';
import { ChevronUp, ChevronDown, Calendar, Sparkles, Heart, TrendingUp } from 'lucide-react';

// ============================================
// Types
// ============================================

interface MobileFlowProps {
  userId: string;
  sessions?: any[];
  onCheckInComplete?: (data: any) => void;
  onJournalSubmit?: (text: string) => void;
}

type ViewMode = 'checkin' | 'journal' | 'timeline' | 'overview';

interface CheckInData {
  petalIntensities: Record<string, number>;
  aetherStage?: 1 | 2 | 3;
  timestamp: string;
  mood?: string;
}

// ============================================
// Mobile Check-In Screen
// ============================================

interface CheckInScreenProps {
  onComplete: (data: CheckInData) => void;
  onSwipeUp: () => void;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ onComplete, onSwipeUp }) => {
  const [petalIntensities, setPetalIntensities] = useState<Record<string, number>>({});
  const [aetherStage, setAetherStage] = useState<1 | 2 | 3 | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [mood, setMood] = useState<string>('');

  const handlePetalChange = (intensities: Record<string, number>) => {
    setPetalIntensities(intensities);
  };

  const handleAetherChange = (stage: 1 | 2 | 3) => {
    setAetherStage(stage);
  };

  const handleSave = () => {
    const data: CheckInData = {
      petalIntensities,
      aetherStage,
      timestamp: new Date().toISOString(),
      mood
    };
    onComplete(data);
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-b from-indigo-950 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-xl font-light">How are you feeling?</h1>
        <p className="text-sm opacity-60 mt-1">Drag petals to express your inner state</p>
      </div>

      {/* Interactive Holoflower */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-square">
          <HoloflowerMotion
            petalIntensities={petalIntensities}
            aetherStage={aetherStage}
            size={320}
            showCoherenceRings={false}
            className="w-full h-full"
          />
          
          {/* Petal intensity helper */}
          <motion.div
            className="absolute top-0 left-0 text-xs text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: Object.keys(petalIntensities).length > 0 ? 1 : 0 }}
          >
            <div className="bg-black/30 backdrop-blur-sm rounded p-2">
              {Object.keys(petalIntensities).length} petals active
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Mood Selector */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 justify-center mb-4">
          {['calm', 'energized', 'contemplative', 'uncertain', 'transcendent'].map(m => (
            <motion.button
              key={m}
              onClick={() => setMood(m)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                mood === m 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/50'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {m}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice Note Option */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
            isRecording 
              ? 'bg-red-500/20 text-red-300' 
              : 'bg-white/10 text-white/70'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/50'}`} />
          {isRecording ? 'Recording voice note...' : 'Add voice note'}
        </motion.button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-6 space-y-2">
        <motion.button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-blue-600 text-white rounded-lg font-medium"
          whileTap={{ scale: 0.98 }}
        >
          Save Check-In
        </motion.button>
        
        {/* Swipe Indicator */}
        <motion.div
          className="flex items-center justify-center gap-2 text-white/40 text-sm py-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={onSwipeUp}
        >
          <ChevronUp size={16} />
          <span>Swipe up for journal</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// Journal Screen
// ============================================

interface JournalScreenProps {
  onSubmit: (text: string) => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

const JournalScreen: React.FC<JournalScreenProps> = ({ onSubmit, onSwipeUp, onSwipeDown }) => {
  const [journalText, setJournalText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const prompts = [
    "What's alive in you today?",
    "What pattern is ready to shift?",
    "Where do you feel expansion?",
    "What needs witnessing?",
    "What's emerging?"
  ];

  const handleSubmit = async () => {
    setIsProcessing(true);
    await onSubmit(journalText);
    setIsProcessing(false);
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-b from-black to-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-xl font-light">Journal Reflection</h1>
        <p className="text-sm opacity-60 mt-1">What wants to be expressed?</p>
      </div>

      {/* Prompts Carousel */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {prompts.map((prompt, idx) => (
            <motion.button
              key={idx}
              onClick={() => setJournalText(prompt + ' ')}
              className="whitespace-nowrap px-3 py-2 bg-white/5 text-white/70 rounded-lg text-sm"
              whileTap={{ scale: 0.95 }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Journal Textarea */}
      <div className="flex-1 px-4">
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write freely..."
          className="w-full h-full bg-white/5 text-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          style={{ minHeight: '200px' }}
        />
      </div>

      {/* Word Count */}
      <div className="px-4 py-2 text-right text-white/40 text-xs">
        {journalText.split(' ').filter(w => w).length} words
      </div>

      {/* Submit Button */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={handleSubmit}
          disabled={!journalText.trim() || isProcessing}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </span>
          ) : (
            'Submit to Oracle'
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex justify-between text-white/40 text-sm">
        <motion.div
          className="flex items-center gap-1"
          onClick={onSwipeDown}
        >
          <ChevronDown size={16} />
          <span>Check-in</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          onClick={onSwipeUp}
        >
          <span>Timeline</span>
          <ChevronUp size={16} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// Timeline Screen
// ============================================

interface TimelineScreenProps {
  sessions: any[];
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

const TimelineScreen: React.FC<TimelineScreenProps> = ({ sessions, onSwipeUp, onSwipeDown }) => {
  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-b from-blue-950 to-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-xl font-light">Your Journey</h1>
        <p className="text-sm opacity-60 mt-1">Tap flowers to explore past sessions</p>
      </div>

      {/* Timeline Component */}
      <div className="flex-1 overflow-auto px-4">
        <HoloflowerTimeline
          sessions={sessions}
          viewMode="weekly"
          className="pb-4"
        />
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex justify-between text-white/40 text-sm">
        <motion.div
          className="flex items-center gap-1"
          onClick={onSwipeDown}
        >
          <ChevronDown size={16} />
          <span>Journal</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          onClick={onSwipeUp}
        >
          <span>Overview</span>
          <ChevronUp size={16} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// Overview Screen (Aggregate Blossom)
// ============================================

interface OverviewScreenProps {
  sessions: any[];
  onSwipeDown: () => void;
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({ sessions, onSwipeDown }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Calculate aggregate stats
  const calculateAggregates = () => {
    const elementCounts: Record<string, number> = {};
    let aetherCount = 0;
    let totalCoherence = 0;
    
    sessions.forEach(session => {
      if (session.oracleReading?.spiralStage) {
        const element = session.oracleReading.spiralStage.element;
        elementCounts[element] = (elementCounts[element] || 0) + 1;
        
        if (element === 'aether') aetherCount++;
      }
      
      if (session.coherence) {
        totalCoherence += session.coherence;
      }
    });
    
    return {
      elementCounts,
      aetherCount,
      avgCoherence: totalCoherence / (sessions.length || 1),
      totalSessions: sessions.length
    };
  };
  
  const stats = calculateAggregates();

  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-b from-indigo-950 via-purple-950 to-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-xl font-light">Soul Fingerprint</h1>
        <p className="text-sm opacity-60 mt-1">Your cumulative pattern</p>
      </div>

      {/* Time Range Selector */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 justify-center">
          {(['7d', '30d', '90d'] as const).map(range => (
            <motion.button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                timeRange === range 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/50'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {range === '7d' ? 'Week' : range === '30d' ? 'Month' : 'Season'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Aggregate Blossom */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-square">
          <HoloflowerMotion
            elementalBalance={{
              fire: (stats.elementCounts.fire || 0) / stats.totalSessions,
              water: (stats.elementCounts.water || 0) / stats.totalSessions,
              earth: (stats.elementCounts.earth || 0) / stats.totalSessions,
              air: (stats.elementCounts.air || 0) / stats.totalSessions
            }}
            aetherStage={stats.aetherCount > 0 ? 1 : undefined}
            coherenceLevel={stats.avgCoherence}
            size={300}
            showCoherenceRings={true}
            className="w-full h-full"
          />
          
          {/* Aggregate Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-white/80 text-sm">{stats.totalSessions} sessions</div>
            {stats.aetherCount > 0 && (
              <div className="text-amber-300 text-xs mt-1">
                ✨ {stats.aetherCount} transcendent moments
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <motion.div 
            className="bg-white/5 rounded-lg p-3 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-white/80 text-xs">Coherence</div>
            <div className="text-white text-sm font-medium">
              {Math.round(stats.avgCoherence * 100)}%
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 rounded-lg p-3 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-white/80 text-xs">Growth</div>
            <div className="text-white text-sm font-medium">Active</div>
          </motion.div>
          
          <motion.div 
            className="bg-white/5 rounded-lg p-3 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-white/80 text-xs">Insights</div>
            <div className="text-white text-sm font-medium">
              {stats.totalSessions * 3}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Insight Message */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-amber-900/30 to-blue-900/30 rounded-lg p-4">
          <p className="text-white/90 text-sm">
            {stats.avgCoherence > 0.7 
              ? "Your field is highly coherent. Trust the flow emerging."
              : stats.avgCoherence > 0.4
              ? "You're finding balance between elements. Keep exploring."
              : "Your journey is unfolding. Each session adds to your pattern."}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6">
        <motion.div
          className="flex items-center justify-center gap-1 text-white/40 text-sm"
          onClick={onSwipeDown}
        >
          <ChevronDown size={16} />
          <span>Back to Timeline</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// Main Mobile Flow Container
// ============================================

export const HoloflowerMobileFlow: React.FC<MobileFlowProps> = ({
  userId,
  sessions = [],
  onCheckInComplete,
  onJournalSubmit
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('checkin');
  const [sessionData, setSessionData] = useState(sessions);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle view transitions
  const handleSwipe = (direction: 'up' | 'down') => {
    const viewOrder: ViewMode[] = ['checkin', 'journal', 'timeline', 'overview'];
    const currentIndex = viewOrder.indexOf(currentView);
    
    if (direction === 'up' && currentIndex < viewOrder.length - 1) {
      setCurrentView(viewOrder[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentView(viewOrder[currentIndex - 1]);
    }
  };
  
  // Handle drag gestures
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.y < -threshold) {
      handleSwipe('up');
    } else if (info.offset.y > threshold) {
      handleSwipe('down');
    }
  };
  
  // Handle check-in completion
  const handleCheckInComplete = async (data: CheckInData) => {
    // Save to backend
    if (onCheckInComplete) {
      await onCheckInComplete(data);
    }
    
    // Update local sessions
    const newSession = {
      sessionId: `session-${Date.now()}`,
      timestamp: data.timestamp,
      userCheckin: Object.entries(data.petalIntensities).map(([petal, intensity]) => ({
        petal,
        intensity
      })),
      mood: data.mood
    };
    
    setSessionData([newSession, ...sessionData]);
    
    // Transition to journal
    setCurrentView('journal');
  };
  
  // Handle journal submission
  const handleJournalSubmit = async (text: string) => {
    if (onJournalSubmit) {
      await onJournalSubmit(text);
    }
    
    // Transition to timeline
    setCurrentView('timeline');
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-black relative"
    >
      {/* View Indicator Dots */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {(['checkin', 'journal', 'timeline', 'overview'] as ViewMode[]).map(view => (
          <div
            key={view}
            className={`w-2 h-2 rounded-full transition-all ${
              currentView === view 
                ? 'bg-white w-6' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* Swipeable Container */}
      <motion.div
        className="h-full w-full"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          {currentView === 'checkin' && (
            <CheckInScreen
              key="checkin"
              onComplete={handleCheckInComplete}
              onSwipeUp={() => handleSwipe('up')}
            />
          )}
          
          {currentView === 'journal' && (
            <JournalScreen
              key="journal"
              onSubmit={handleJournalSubmit}
              onSwipeUp={() => handleSwipe('up')}
              onSwipeDown={() => handleSwipe('down')}
            />
          )}
          
          {currentView === 'timeline' && (
            <TimelineScreen
              key="timeline"
              sessions={sessionData}
              onSwipeUp={() => handleSwipe('up')}
              onSwipeDown={() => handleSwipe('down')}
            />
          )}
          
          {currentView === 'overview' && (
            <OverviewScreen
              key="overview"
              sessions={sessionData}
              onSwipeDown={() => handleSwipe('down')}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HoloflowerMobileFlow;