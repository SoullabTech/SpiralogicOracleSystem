'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

interface UniversalWelcomeProps {
  onComplete: (intentions: string[]) => void;
  onBack?: () => void;
}

export const UniversalWelcome: React.FC<UniversalWelcomeProps> = ({
  onComplete,
  onBack
}) => {
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>([]);

  const intentions = [
    {
      id: 'self-knowing',
      icon: '🔍',
      title: 'To know myself deeply',
      description: 'Explore the depths of who you really are'
    },
    {
      id: 'conscious-living',
      icon: '🌿',
      title: 'To live more consciously',
      description: 'Bring awareness to every moment'
    },
    {
      id: 'essence-service',
      icon: '💝',
      title: 'To serve from my essence',
      description: 'Offer your gifts from your authentic self'
    },
    {
      id: 'true-nature',
      icon: '✨',
      title: 'To awaken to my true nature',
      description: 'Discover the timeless essence within'
    },
    {
      id: 'present-love',
      icon: '💖',
      title: 'To be present for those I love',
      description: 'Show up fully in your relationships'
    },
    {
      id: 'all-above',
      icon: '🌟',
      title: 'All of the above',
      description: 'I\'m here for the full journey of awakening'
    }
  ];

  const toggleIntention = (intentionId: string) => {
    if (intentionId === 'all-above') {
      // If "All of the above" is selected, select all or deselect all
      setSelectedIntentions(
        selectedIntentions.includes('all-above') 
          ? [] 
          : intentions.map(i => i.id)
      );
    } else {
      // Regular intention selection
      setSelectedIntentions(prev => {
        const newSelection = prev.includes(intentionId)
          ? prev.filter(id => id !== intentionId)
          : [...prev.filter(id => id !== 'all-above'), intentionId];
        
        // If all individual items are selected, also select "all of the above"
        const individualIntentions = intentions.filter(i => i.id !== 'all-above').map(i => i.id);
        if (individualIntentions.every(id => newSelection.includes(id))) {
          return [...newSelection, 'all-above'];
        }
        
        return newSelection;
      });
    }
  };

  const handleContinue = () => {
    onComplete(selectedIntentions);
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
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-soullab-fire" />
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="premium-heading-1 mb-4"
          >
            Welcome, <span className="sacred-text">Conscious Soul</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="premium-body-large mb-8 max-w-2xl mx-auto"
          >
            Before we begin this sacred journey together, help us understand your heart's calling.
          </motion.p>

          {/* The Sacred Question */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="premium-heading-2 mb-8 sacred-text"
          >
            What calls you here?
          </motion.h2>

          {/* Intention Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {intentions.map((intention, index) => (
              <motion.div
                key={intention.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                onClick={() => toggleIntention(intention.id)}
                className={`
                  premium-sacred-card cursor-pointer transition-all duration-300 p-6 text-left
                  ${selectedIntentions.includes(intention.id) 
                    ? 'ring-2 ring-soullab-fire/50 bg-soullab-fire/5' 
                    : 'hover:bg-soullab-fire/2'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0 mt-1">
                    {intention.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="premium-heading-3 mb-2">
                      {intention.title}
                    </h3>
                    <p className="premium-body text-sm">
                      {intention.description}
                    </p>
                  </div>
                  {selectedIntentions.includes(intention.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0"
                    >
                      <Heart className="w-5 h-5 text-soullab-fire fill-current" />
                    </motion.div>
                  )}
                </div>
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
            <span className="sacred-text">Sacred note:</span> There is no hierarchy here. 
            Every path of awakening is honored equally. Your journey is perfect as it is.
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
              disabled={selectedIntentions.length === 0}
              className={`
                premium-sacred-button
                ${selectedIntentions.length === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105'
                }
              `}
            >
              <span>Continue with {selectedIntentions.length} intention{selectedIntentions.length !== 1 ? 's' : ''}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UniversalWelcome;