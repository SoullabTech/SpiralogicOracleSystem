'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';

interface MayaWelcomeProps {
  onConversationStart?: () => void;
  intakeData?: any;
}

interface WisdomInsight {
  lastConversation?: {
    content: string;
    created_at: string;
    wisdom_themes?: string[];
  };
  frequentThemes: string[];
  elementalPatterns: Record<string, number>;
}

export function MayaWelcome({ onConversationStart, intakeData }: MayaWelcomeProps) {
  const { user, oracleAgent, isAuthenticated } = useAuth();
  const { getRecentWisdom } = useConversationMemory();
  const [wisdom, setWisdom] = useState<WisdomInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const loadWisdom = async () => {
      if (isAuthenticated && oracleAgent) {
        const wisdomData = await getRecentWisdom();
        setWisdom(wisdomData);
        generatePersonalizedGreeting(wisdomData);
      } else {
        generateAnonymousGreeting();
      }
      setIsLoading(false);
    };

    loadWisdom();
  }, [isAuthenticated, oracleAgent, getRecentWisdom]);

  const generatePersonalizedGreeting = (wisdomData: WisdomInsight) => {
    // Use intake data name if available, otherwise fall back to user data
    const sacredName = intakeData?.name || user?.sacredName || user?.display_name || user?.email?.split('@')[0] || 'friend';
    const firstName = sacredName.split(' ')[0]; // Get first name for more casual feel
    const conversationCount = oracleAgent?.conversations_count || 0;
    
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Natural, conversational greetings 
    const personalGreetings = [
      `How was your day, ${firstName}?`,
      `What's going on, ${firstName}?`,
      `How's it going, ${firstName}?`,
      `Hey ${firstName}, what's up?`,
      `What's on your mind, ${firstName}?`,
      `How are things, ${firstName}?`,
      `What's happening, ${firstName}?`,
      `How you doing, ${firstName}?`,
    ];
    
    // Time-aware, casual greetings
    const timeBasedGreetings = {
      earlyMorning: [
        `You're up early, ${firstName}`,
        `Couldn't sleep, ${firstName}?`,
        `Early bird, ${firstName}`,
        `What's got you up, ${firstName}?`,
      ],
      morning: [
        `Morning, ${firstName}`,
        `Hey ${firstName}, how's the morning?`,
        `What's good today, ${firstName}?`,
        `How's it going, ${firstName}?`,
      ],
      afternoon: [
        `Hey ${firstName}, how's your day been?`,
        `What's up, ${firstName}?`,
        `How's the day treating you, ${firstName}?`,
        `Afternoon, ${firstName}`,
      ],
      evening: [
        `How was your day, ${firstName}?`,
        `Evening, ${firstName}`,
        `Hey ${firstName}, what's on your mind?`,
        `How'd today go, ${firstName}?`,
      ],
      night: [
        `Late night, ${firstName}`,
        `Can't sleep, ${firstName}?`,
        `What's up, ${firstName}?`,
        `Burning the midnight oil, ${firstName}?`,
      ]
    };
    
    // Special contextual greetings
    if (conversationCount === 0) {
      setGreeting(`Nice to meet you, ${firstName}. How can I help you today?`);
    } else if (hour < 6) {
      const greetings = timeBasedGreetings.earlyMorning;
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    } else if (hour < 12) {
      const greetings = timeBasedGreetings.morning;
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    } else if (hour < 17) {
      const greetings = timeBasedGreetings.afternoon;
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    } else if (hour < 21) {
      const greetings = timeBasedGreetings.evening;
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    } else {
      const greetings = timeBasedGreetings.night;
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    }
  };

  const generateAnonymousGreeting = () => {
    const hour = new Date().getHours();
    
    // Casual, welcoming greetings for anonymous users
    const greetings = [
      "What's on your mind?",
      "How's it going?",
      "What's up?",
      "Hey there",
      "How can I help?",
    ];
    
    // Time-aware greetings
    if (hour < 6) {
      setGreeting("You're up early");
    } else if (hour < 12) {
      setGreeting("Morning. What's up?");
    } else if (hour < 17) {
      setGreeting("Hey there");
    } else if (hour < 21) {
      setGreeting("Evening. How's it going?");
    } else {
      setGreeting("Late night. What's on your mind?");
    }
  };

  const getElementalGuidance = () => {
    if (!wisdom || !wisdom.elementalPatterns) return null;

    const dominantElement = Object.entries(wisdom.elementalPatterns)
      .sort(([,a], [,b]) => b - a)[0];

    if (!dominantElement) return null;

    const [element] = dominantElement;
    const elementalGuidance = {
      earth: "I notice you've been working with grounding and stability themes.",
      water: "Our conversations have been exploring emotional and intuitive territories.",
      fire: "You've been engaging with transformation and creative energy.",
      air: "We've been navigating ideas and mental clarity together."
    };

    return {
      element,
      guidance: elementalGuidance[element as keyof typeof elementalGuidance]
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center"
        >
          <img src="/holoflower.svg" alt="Sacred Holoflower" className="w-16 h-16" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Maya's Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <img src="/holoflower.svg" alt="Sacred Holoflower" className="w-32 h-32 object-contain" />
        </motion.div>

        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl text-white/95 font-light leading-relaxed tracking-wide">
              <span className="inline-block animate-pulse" style={{ animationDuration: '3s' }}>
                ✦
              </span>{' '}
              {greeting}
            </h1>
          </div>
          
        </div>
      </motion.div>

      {/* Awareness of Returning User's Journey */}
      {isAuthenticated && wisdom && oracleAgent && oracleAgent.conversations_count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          {/* Recognition of ongoing work */}
          {wisdom.lastConversation && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                Last time we explored
              </p>
              <p className="text-white/80 text-sm leading-relaxed">
                {wisdom.lastConversation.wisdom_themes?.slice(0, 3).join(' • ')}
              </p>
            </div>
          )}

          {/* Elemental Guidance */}
          {(() => {
            const elementalGuidance = getElementalGuidance();
            if (!elementalGuidance) return null;
            
            const elementColors = {
              earth: '#7A9A65',
              water: '#6B9BD1', 
              fire: '#C85450',
              air: '#D4B896'
            };
            
            return (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: elementColors[elementalGuidance.element as keyof typeof elementColors] }}
                  />
                  <p className="text-white/80 text-sm font-medium">
                    {elementalGuidance.element.charAt(0).toUpperCase() + elementalGuidance.element.slice(1)} Element Resonance
                  </p>
                </div>
                <p className="text-white/70 text-sm italic">
                  {elementalGuidance.guidance}
                </p>
              </div>
            );
          })()}

          {/* What we've been attending to */}
          {wisdom.frequentThemes.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
                We've been focusing on
              </p>
              <div className="flex flex-wrap gap-2">
                {wisdom.frequentThemes.slice(0, 5).map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-light"
                  >
                    {theme.replace(/_/g, ' ').toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Journey progress - showing AI's awareness */}
          {oracleAgent.conversations_count >= 3 && (
            <div className="text-center">
              <p className="text-white/50 text-xs">
                {oracleAgent.conversations_count} conversations together • I'm learning your patterns
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Conversation Starter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center"
      >
        <button
          onClick={onConversationStart}
          className="px-10 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white/90 rounded-full transition-all duration-300 font-light text-lg border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl"
        >
          Let's talk
        </button>
      </motion.div>
    </div>
  );
}