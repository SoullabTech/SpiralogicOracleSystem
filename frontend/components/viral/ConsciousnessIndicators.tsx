'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Sparkles, Sun, Moon, Leaf } from 'lucide-react';

interface ConsciousnessIndicatorsProps {
  journeyMilestones?: string[];
  practiceStreaks?: { name: string; days: number; icon: string }[];
  consciousnessLevel?: {
    name: string;
    description: string;
    progress: number;
  };
  showCelebration?: boolean;
}

export const ConsciousnessIndicators: React.FC<ConsciousnessIndicatorsProps> = ({
  journeyMilestones = [],
  practiceStreaks = [],
  consciousnessLevel,
  showCelebration = false
}) => {

  const milestoneIcons = {
    'First Insight': '💡',
    'Present Moment': '🌿', 
    'Shadow Integration': '🌑',
    'Heart Opening': '💖',
    'Authentic Expression': '✨',
    'Soul Recognition': '🌟'
  };

  const levelColors = {
    'Awakening Soul': 'from-purple-400 to-pink-400',
    'Growing Heart': 'from-green-400 to-emerald-400', 
    'Authentic Being': 'from-blue-400 to-cyan-400',
    'Loving Presence': 'from-rose-400 to-pink-400',
    'Radiant Soul': 'from-yellow-400 to-orange-400',
    'Wise Heart': 'from-indigo-400 to-purple-400'
  };

  return (
    <div className="space-y-6">
      {/* Consciousness Level */}
      {consciousnessLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-sacred-card p-6"
        >
          <div className="text-center mb-4">
            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${levelColors[consciousnessLevel.name] || 'from-soullab-fire to-soullab-water'} rounded-full flex items-center justify-center`}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="premium-heading-3 mb-2">{consciousnessLevel.name}</h3>
            <p className="premium-body text-sm">{consciousnessLevel.description}</p>
          </div>

          {/* Progress Visualization */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${levelColors[consciousnessLevel.name] || 'from-soullab-fire to-soullab-water'}`}
                initial={{ width: 0 }}
                animate={{ width: `${consciousnessLevel.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="text-center">
              <span className="premium-body text-xs">Embodying this consciousness level</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Journey Milestones */}
      {journeyMilestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-sacred-card p-6"
        >
          <h3 className="premium-heading-3 mb-4 text-center">
            <Star className="w-5 h-5 inline mr-2 text-soullab-fire" />
            Journey Milestones
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {journeyMilestones.map((milestone, index) => (
              <motion.div
                key={milestone}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-4 bg-gradient-to-br from-soullab-fire/10 to-soullab-water/10 rounded-lg"
              >
                <div className="text-2xl mb-2">{milestoneIcons[milestone] || '✨'}</div>
                <div className="premium-body text-sm font-medium">{milestone}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Practice Streaks */}
      {practiceStreaks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-sacred-card p-6"
        >
          <h3 className="premium-heading-3 mb-4 text-center">
            <Heart className="w-5 h-5 inline mr-2 text-soullab-fire" />
            Sacred Practices
          </h3>
          
          <div className="space-y-4">
            {practiceStreaks.map((streak, index) => (
              <motion.div
                key={streak.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-transparent to-soullab-fire/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">{streak.icon}</div>
                  <div>
                    <div className="premium-body font-medium">{streak.name}</div>
                    <div className="premium-body text-sm text-gray-600">{streak.days} day streak</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(streak.days, 7) }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="w-2 h-2 bg-soullab-fire rounded-full"
                    />
                  ))}
                  {streak.days > 7 && (
                    <span className="premium-body text-xs ml-1 text-soullab-fire">
                      +{streak.days - 7}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <div className="relative">
            {/* Celebration Sparkles */}
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 0 
                }}
                animate={{ 
                  x: Math.cos(i * 30 * Math.PI / 180) * 100,
                  y: Math.sin(i * 30 * Math.PI / 180) * 100,
                  opacity: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
            
            {/* Central Heart */}
            <motion.div
              className="text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              💖
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Community Resonance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="premium-sacred-card p-6 text-center"
      >
        <h3 className="premium-heading-3 mb-4">
          <Sparkles className="w-5 h-5 inline mr-2 text-soullab-fire" />
          Community Resonance
        </h3>
        
        <div className="space-y-3">
          <div className="premium-body text-sm">
            <span className="font-semibold text-soullab-fire">2,341</span> souls found peace today
          </div>
          <div className="premium-body text-sm">
            <span className="font-semibold text-soullab-water">847</span> hearts opened to self-love
          </div>
          <div className="premium-body text-sm">
            <span className="font-semibold text-soullab-earth">5,623</span> beings chose conscious living
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="premium-body text-xs italic">
            Your consciousness journey contributes to the awakening of all beings
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsciousnessIndicators;