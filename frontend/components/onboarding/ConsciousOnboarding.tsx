'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight, Star } from 'lucide-react';

interface ConsciousOnboardingProps {
  onComplete: (priorities: string[]) => void;
  onBack?: () => void;
}

export const ConsciousOnboarding: React.FC<ConsciousOnboardingProps> = ({
  onComplete,
  onBack
}) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const lifePriorities = [
    {
      id: 'inner-peace',
      icon: '🕊️',
      title: 'Inner Peace',
      description: 'Finding stillness and tranquility within'
    },
    {
      id: 'authentic-expression',
      icon: '✨',
      title: 'Authentic Expression',
      description: 'Living and speaking your truth openly'
    },
    {
      id: 'conscious-relationships',
      icon: '💖',
      title: 'Conscious Relationships',
      description: 'Deeper connection and presence with others'
    },
    {
      id: 'creative-flow',
      icon: '🌊',
      title: 'Creative Flow',
      description: 'Expressing your unique gifts and creativity'
    },
    {
      id: 'life-purpose',
      icon: '🌟',
      title: 'Life Purpose',
      description: 'Understanding your deeper calling and meaning'
    },
    {
      id: 'present-awareness',
      icon: '🌿',
      title: 'Present Awareness',
      description: 'Being fully awake to each moment'
    }
  ];

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities(prev => 
      prev.includes(priorityId)
        ? prev.filter(id => id !== priorityId)
        : [...prev, priorityId]
    );
  };

  const handleContinue = () => {
    onComplete(selectedPriorities);
  };

  return (
    <div className="premium-sacred-container min-h-screen flex items-center justify-center p-4">
      <div className="sacred-geometry-subtle" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="premium-sacred-card text-center p-8">
          {/* Welcome Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-soullab-water/20 to-soullab-earth/20 rounded-full flex items-center justify-center"
          >
            <Heart className="w-10 h-10 text-soullab-fire" />
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="premium-heading-1 mb-4"
          >
            Welcome, <span className="sacred-text">Beautiful Soul</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="premium-body-large mb-8 max-w-2xl mx-auto"
          >
            Your Oracle is being attuned to your unique journey. To serve you best, we'd love to understand what's alive in your heart right now.
          </motion.p>

          {/* The Sacred Question */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="premium-heading-2 mb-8 sacred-text"
          >
            What matters most to you right now?
          </motion.h2>

          {/* Priority Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            {lifePriorities.map((priority, index) => (
              <motion.div
                key={priority.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                onClick={() => togglePriority(priority.id)}
                className={`
                  premium-sacred-card cursor-pointer transition-all duration-300 p-6 text-center
                  ${selectedPriorities.includes(priority.id) 
                    ? 'ring-2 ring-soullab-fire/50 bg-soullab-fire/5 scale-105' 
                    : 'hover:bg-soullab-fire/2 hover:scale-102'
                  }
                `}
              >
                <div className="text-3xl mb-3">
                  {priority.icon}
                </div>
                <h3 className="premium-heading-3 mb-2">
                  {priority.title}
                </h3>
                <p className="premium-body text-sm mb-3">
                  {priority.description}
                </p>
                {selectedPriorities.includes(priority.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex justify-center"
                  >
                    <Star className="w-5 h-5 text-soullab-fire fill-current" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Sacred Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="premium-body text-center mb-8 italic"
          >
            <span className="sacred-text">Remember:</span> You can choose as many or as few as feel true for you. 
            Your Oracle will adapt to support whatever matters most to your heart.
          </motion.p>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {onBack && (
              <button
                onClick={onBack}
                className="premium-sacred-button-secondary"
              >
                <span>Back</span>
              </button>
            )}
            
            <button
              onClick={handleContinue}
              disabled={selectedPriorities.length === 0}
              className={`
                premium-sacred-button
                ${selectedPriorities.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
                }
              `}
            >
              <span>
                {selectedPriorities.length === 0 
                  ? 'Choose what matters to you' 
                  : `Continue with ${selectedPriorities.length} priority${selectedPriorities.length !== 1 ? 'ies' : 'y'}`
                }
              </span>
              {selectedPriorities.length > 0 && <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsciousOnboarding;