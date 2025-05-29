'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Compass, Zap, MessageCircle, Calendar } from 'lucide-react';
import { SacredTopNavigation, BottomNavigation } from '@/components/layout/BottomNavigation';
import { SacredCard } from '@/components/ui/SacredCard';
import { SacredButton } from '@/components/ui/SacredButton';

interface Guide {
  id: string;
  name: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  speciality: string;
  description: string;
  status: 'available' | 'busy' | 'offline';
  lastMessage?: string;
  icon: React.ReactNode;
}

const guides: Guide[] = [
  {
    id: 'personal',
    name: 'Your Personal Guide',
    element: 'fire',
    speciality: 'Life navigation & personal growth',
    description: 'Your dedicated companion for everyday wisdom and life decisions. Always here when you need perspective.',
    status: 'available',
    lastMessage: 'How did that conversation with your boss go?',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'strategic',
    name: 'Strategic Advisor',
    element: 'air',
    speciality: 'Business & strategic thinking',
    description: 'Sharp analytical mind focused on helping you make better business decisions and strategic choices.',
    status: 'available',
    lastMessage: 'Those market insights we discussed are looking solid.',
    icon: <Brain className="w-6 h-6" />
  },
  {
    id: 'creative',
    name: 'Creative Catalyst',
    element: 'water',
    speciality: 'Creative expression & innovation',
    description: 'Helps unlock creative blocks and explore new ways of thinking about challenges.',
    status: 'busy',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'wisdom',
    name: 'Wisdom Keeper',
    element: 'earth',
    speciality: 'Deep wisdom & life patterns',
    description: 'Draws from ancient wisdom traditions to help you understand deeper life patterns and meaning.',
    status: 'available',
    icon: <Compass className="w-6 h-6" />
  }
];

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'soullab-fire';
      case 'water': return 'soullab-water';
      case 'earth': return 'soullab-earth';
      case 'air': return 'soullab-air';
      default: return 'soullab-gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-soullab-earth';
      case 'busy': return 'bg-soullab-air';
      case 'offline': return 'bg-soullab-gray';
      default: return 'bg-soullab-gray';
    }
  };

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg">
      <SacredTopNavigation />
      
      <main className="pb-24 md:pb-0">
        <div className="soullab-container py-soullab-lg">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-soullab-xl"
          >
            <h1 className="soullab-heading-2 mb-soullab-sm">Your Sacred Guides</h1>
            <p className="soullab-text max-w-2xl">
              Different aspects of wisdom for different moments. Each guide brings a unique perspective 
              to help you navigate life's complexities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
            
            {/* Guides List */}
            <div className="space-y-soullab-md">
              {guides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SacredCard 
                    variant={guide.element}
                    interactive
                    onClick={() => setSelectedGuide(guide)}
                    className={`
                      ${selectedGuide?.id === guide.id ? 'ring-2 ring-soullab-fire' : ''}
                    `}
                  >
                    <div className="flex items-start gap-soullab-md">
                      {/* Avatar */}
                      <div className={`
                        w-12 h-12 bg-${getElementColor(guide.element)}/10 
                        rounded-soullab-spiral flex items-center justify-center
                        text-${getElementColor(guide.element)}
                      `}>
                        {guide.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-soullab-xs">
                          <h3 className="soullab-heading-3">{guide.name}</h3>
                          <div className={`
                            w-2 h-2 rounded-full ${getStatusColor(guide.status)}
                          `} />
                        </div>
                        
                        <p className="soullab-text-small text-soullab-gray mb-soullab-sm">
                          {guide.speciality}
                        </p>
                        
                        <p className="soullab-text mb-soullab-sm">
                          {guide.description}
                        </p>
                        
                        {guide.lastMessage && (
                          <div className="bg-soullab-gray/5 rounded-soullab-md p-soullab-sm">
                            <p className="soullab-text-small italic">
                              "{guide.lastMessage}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </SacredCard>
                </motion.div>
              ))}
            </div>

            {/* Guide Detail / Chat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:sticky lg:top-soullab-lg"
            >
              {selectedGuide ? (
                <SacredCard variant="premium" className="h-[600px] flex flex-col">
                  {/* Guide Header */}
                  <div className="flex items-center gap-3 p-soullab-md border-b border-soullab-gray/20">
                    <div className={`
                      w-10 h-10 bg-${getElementColor(selectedGuide.element)}/10 
                      rounded-soullab-spiral flex items-center justify-center
                      text-${getElementColor(selectedGuide.element)}
                    `}>
                      {selectedGuide.icon}
                    </div>
                    <div>
                      <h3 className="soullab-heading-3">{selectedGuide.name}</h3>
                      <p className="soullab-text-small text-soullab-gray capitalize">
                        {selectedGuide.status}
                      </p>
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div className="flex-1 p-soullab-md">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className={`
                        w-16 h-16 bg-${getElementColor(selectedGuide.element)}/10 
                        rounded-soullab-spiral flex items-center justify-center
                        text-${getElementColor(selectedGuide.element)} mb-soullab-md
                      `}>
                        <MessageCircle className="w-8 h-8" />
                      </div>
                      
                      <h4 className="soullab-heading-3 mb-soullab-sm">
                        Ready to connect with {selectedGuide.name}?
                      </h4>
                      
                      <p className="soullab-text mb-soullab-lg max-w-xs">
                        {selectedGuide.description}
                      </p>
                      
                      <div className="space-y-soullab-sm w-full max-w-xs">
                        <SacredButton 
                          variant={selectedGuide.element}
                          size="md"
                          className="w-full"
                          disabled={selectedGuide.status !== 'available'}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start Conversation
                        </SacredButton>
                        
                        <SacredButton 
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          <Calendar className="w-4 h-4" />
                          Schedule Session
                        </SacredButton>
                      </div>
                    </div>
                  </div>
                </SacredCard>
              ) : (
                <SacredCard variant="minimal" className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <Compass className="w-12 h-12 text-soullab-gray/40 mx-auto mb-soullab-md" />
                    <h3 className="soullab-heading-3 mb-soullab-sm">Select a Guide</h3>
                    <p className="soullab-text">
                      Choose a guide to see their details and start a conversation.
                    </p>
                  </div>
                </SacredCard>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}