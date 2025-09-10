'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useConversationMemory } from '@/lib/hooks/useConversationMemory';

interface MayaWelcomeProps {
  onConversationStart?: () => void;
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

export function MayaWelcome({ onConversationStart }: MayaWelcomeProps) {
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
    const sacredName = user?.sacredName || user?.display_name || user?.email?.split('@')[0] || 'friend';
    const firstName = sacredName.split(' ')[0]; // Get first name for more casual feel
    const conversationCount = oracleAgent?.conversations_count || 0;
    
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Variety of conversational greetings
    const casualGreetings = [
      `Back at it, ${firstName}`,
      `Here we go, ${firstName}`,
      `Good to see you, ${firstName}`,
      `Welcome back, ${firstName}`,
      `Hey there, ${firstName}`,
      `Let's dive in, ${firstName}`,
    ];
    
    // Special contextual greetings
    if (conversationCount === 0) {
      setGreeting(`Nice to meet you, ${firstName}`);
    } else if (hour < 6) {
      setGreeting(`Up early, ${firstName}`);
    } else if (hour >= 22) {
      setGreeting(`Late night session, ${firstName}`);
    } else if (day === 1) {
      setGreeting(`Monday momentum, ${firstName}`);
    } else if (day === 5) {
      setGreeting(`Friday vibes, ${firstName}`);
    } else {
      // Use a random casual greeting
      const randomGreeting = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
      setGreeting(randomGreeting);
    }
  };

  const generateAnonymousGreeting = () => {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Conversational greetings for anonymous users
    const greetings = [
      "Let's explore together",
      "Ready when you are",
      "What's on your mind?",
      "Let's dive in",
      "Welcome, friend",
    ];
    
    // Special contextual greetings
    if (hour < 6) {
      setGreeting("Up early today");
    } else if (hour >= 22) {
      setGreeting("Late night thoughts?");
    } else if (day === 1) {
      setGreeting("Monday momentum");
    } else if (day === 5) {
      setGreeting("Friday feelings");
    } else if (day === 0 || day === 6) {
      setGreeting("Weekend wanderings");
    } else {
      // Use a random greeting
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
    }
  };

  const getElementalGuidance = () => {
    if (!wisdom || !wisdom.elementalPatterns) return null;

    const dominantElement = Object.entries(wisdom.elementalPatterns)
      .sort(([,a], [,b]) => b - a)[0];

    if (!dominantElement) return null;

    const [element, count] = dominantElement;
    const elementalGuidance = {
      earth: "I notice you've been drawn to grounding and embodied wisdom. Perhaps today calls for rooting deeper into what serves your foundation.",
      water: "Your recent reflections have flowed through emotional and intuitive realms. What does your heart wish to explore?",
      fire: "I sense transformation has been stirring in our conversations. What vision seeks to be born through you?",
      air: "Your spirit has been dancing with ideas and connections. What thoughts are ready to take wing?"
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

        <div className="space-y-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-white/80 leading-relaxed">
              {greeting}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Personalized Insights for Returning Users */}
      {isAuthenticated && wisdom && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          {/* Conversation History */}
          {oracleAgent && oracleAgent.conversations_count > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/70 text-sm mb-2">Your Journey</p>
              <p className="text-white/90">
                {oracleAgent.conversations_count} conversations • Wisdom level {oracleAgent.wisdom_level}
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

          {/* Recent Themes */}
          {wisdom.frequentThemes.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/80 text-sm font-medium mb-3">
                Recurring Wisdom Themes
              </p>
              <div className="flex flex-wrap gap-2">
                {wisdom.frequentThemes.slice(0, 5).map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#D4B896]/20 text-[#D4B896] rounded-full text-xs"
                  >
                    {theme.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
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
          className="px-8 py-4 bg-gradient-to-r from-[#D4B896] to-[#B69A78] hover:from-[#E5C9A6] hover:to-[#D4B896] text-white rounded-full transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
        >
          Onwards!
        </button>
      </motion.div>
    </div>
  );
}