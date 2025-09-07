"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Zap, Moon, Sun, Circle, 
  Calendar, Sparkles, BookOpen, 
  ChevronRight, MoreHorizontal 
} from 'lucide-react';
import { SacredNatalChart } from './astrology/SacredNatalChart';
import { SacredTarotSpread } from './divination/SacredTarotSpread';
import { SacredIChingConsultation } from './divination/SacredIChingConsultation';
import { DailyGuidance } from './divination/DailyGuidance';

type SacredTool = 'overview' | 'natal' | 'transits' | 'tarot' | 'iching' | 'daily';

interface SacredToolsHubProps {
  userId: string;
  onSessionCreate?: (sessionData: any) => void;
}

const toolsConfig = {
  natal: {
    title: 'Sacred Birth Chart',
    icon: Sun,
    color: '#fbbf24', // amber-400
    description: 'Your cosmic blueprint and elemental essence'
  },
  transits: {
    title: 'Planetary Currents',
    icon: Circle,
    color: '#8b5cf6', // violet-500
    description: 'Current cosmic influences and timing'
  },
  tarot: {
    title: 'Tarot Wisdom',
    icon: Sparkles,
    color: '#ec4899', // pink-500
    description: 'Archetypal guidance through sacred cards'
  },
  iching: {
    title: 'I Ching Oracle',
    icon: BookOpen,
    color: '#10b981', // emerald-500
    description: 'Ancient wisdom of change and transformation'
  },
  daily: {
    title: 'Daily Guidance',
    icon: Calendar,
    color: '#f59e0b', // amber-500
    description: 'Your sacred message for today'
  }
};

export default function SacredToolsHub({ 
  userId, 
  onSessionCreate 
}: SacredToolsHubProps) {
  const [activeTool, setActiveTool] = useState<SacredTool>('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleToolSelect = async (tool: SacredTool) => {
    if (activeTool === tool) return;
    
    setIsTransitioning(true);
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setActiveTool(tool);
    setIsTransitioning(false);
    
    // Haptic feedback
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleSessionComplete = (sessionData: any) => {
    // Add tool type and sacred metadata
    const sacredSession = {
      ...sessionData,
      type: 'sacred-tool',
      tool: activeTool,
      timestamp: new Date().toISOString(),
      sacredMetadata: {
        toolUsed: activeTool,
        elementalResonance: sessionData.elementalMapping || {},
        wisdomExtracted: sessionData.quotes || []
      }
    };
    
    onSessionCreate?.(sacredSession);
    
    // Return to overview with celebration
    setTimeout(() => {
      setActiveTool('overview');
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Sacred Tools Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
          Sacred Tools
        </h1>
        <p className="text-white/60 text-lg">
          Divine guidance through ancient wisdom and cosmic insight
        </p>
      </motion.div>

      {/* Tool Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {Object.entries(toolsConfig).map(([key, config], index) => {
          const Icon = config.icon;
          const isActive = activeTool === key;
          
          return (
            <motion.button
              key={key}
              onClick={() => handleToolSelect(key as SacredTool)}
              className={`
                relative flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all
                ${isActive 
                  ? 'bg-white/10 border-white/30 text-white' 
                  : 'bg-black/20 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Sacred glow effect for active tool */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, ${config.color}, transparent)`
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* Icon with color */}
              <Icon 
                className="w-5 h-5" 
                style={{ color: isActive ? config.color : undefined }}
              />
              
              {/* Title */}
              <span className="font-medium">{config.title}</span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tool Content */}
      <motion.div
        className="min-h-[600px]"
        animate={{ opacity: isTransitioning ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {activeTool === 'overview' && (
            <SacredToolsOverview 
              key="overview"
              onToolSelect={handleToolSelect}
              toolsConfig={toolsConfig}
            />
          )}
          
          {activeTool === 'natal' && (
            <SacredNatalChart
              key="natal"
              userId={userId}
              onComplete={handleSessionComplete}
            />
          )}
          
          {activeTool === 'tarot' && (
            <SacredTarotSpread
              key="tarot"
              userId={userId}
              onComplete={handleSessionComplete}
            />
          )}
          
          {activeTool === 'iching' && (
            <SacredIChingConsultation
              key="iching"
              userId={userId}
              onComplete={handleSessionComplete}
            />
          )}
          
          {activeTool === 'daily' && (
            <DailyGuidance
              key="daily"
              userId={userId}
              onComplete={handleSessionComplete}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Overview component
interface SacredToolsOverviewProps {
  onToolSelect: (tool: SacredTool) => void;
  toolsConfig: typeof toolsConfig;
}

function SacredToolsOverview({ 
  onToolSelect, 
  toolsConfig 
}: SacredToolsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {Object.entries(toolsConfig).map(([key, config], index) => {
        const Icon = config.icon;
        
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onToolSelect(key as SacredTool)}
            className="group relative p-6 bg-gradient-to-br from-black/40 to-black/20 rounded-2xl border border-white/10 hover:border-white/20 cursor-pointer transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background glow */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"
              style={{
                background: `radial-gradient(circle at center, ${config.color}, transparent)`
              }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Icon 
                  className="w-8 h-8" 
                  style={{ color: config.color }}
                />
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
              
              {/* Title & Description */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {config.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {config.description}
              </p>
              
              {/* Sacred geometry decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle 
                    cx="20" 
                    cy="20" 
                    r="15" 
                    fill="none" 
                    stroke={config.color}
                    strokeWidth="1"
                  />
                  <circle 
                    cx="20" 
                    cy="20" 
                    r="8" 
                    fill="none" 
                    stroke={config.color}
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="group relative p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 cursor-not-allowed"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <MoreHorizontal className="w-8 h-8 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">COMING SOON</span>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            More Sacred Tools
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Runes, numerology, dream interpretation, and other mystical arts
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}