'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Moon, 
  Sun, 
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Target,
  Eye,
  Heart
} from 'lucide-react';

const AstrologyPage = () => {
  const router = useRouter();
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Mock astrological data - replace with actual calculations
  const userChart = {
    sun: { sign: 'Scorpio', degree: '15°', house: 8 },
    moon: { sign: 'Pisces', degree: '22°', house: 12 },
    rising: { sign: 'Virgo', degree: '3°', house: 1 },
    venus: { sign: 'Libra', degree: '8°', house: 7 },
    mars: { sign: 'Capricorn', degree: '28°', house: 11 }
  };

  const currentTransits = [
    {
      planet: 'Mercury',
      aspect: 'conjunct',
      target: 'natal Sun',
      date: 'Jan 21-23',
      meaning: 'Enhanced communication and self-expression',
      element: 'fire'
    },
    {
      planet: 'Venus',
      aspect: 'trine',
      target: 'natal Moon',
      date: 'Jan 19-25',
      meaning: 'Harmonious emotional and relationship energy',
      element: 'water'
    },
    {
      planet: 'Saturn',
      aspect: 'square',
      target: 'natal Mars',
      date: 'Jan 15-30',
      meaning: 'Structural challenges requiring patience and discipline',
      element: 'earth'
    }
  ];

  const dailyGuidance = {
    date: 'January 21, 2025',
    moonPhase: 'Waning Crescent',
    moonSign: 'Sagittarius',
    guidance: 'The Sagittarius moon invites expansion of consciousness. Use this fire energy to explore new philosophical territories.',
    bestTime: '2:30 PM - 4:00 PM',
    avoid: '8:00 PM - 10:00 PM',
    element: 'fire'
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-soullab-fire border-soullab-fire/20 bg-soullab-fire/5';
      case 'water': return 'text-soullab-water border-soullab-water/20 bg-soullab-water/5';
      case 'earth': return 'text-soullab-earth border-soullab-earth/20 bg-soullab-earth/5';
      case 'air': return 'text-soullab-air border-soullab-air/20 bg-soullab-air/5';
      default: return 'text-soullab-gray border-soullab-gray/20 bg-soullab-gray/5';
    }
  };

  return (
    <div className="min-h-screen bg-soullab-white">
      <div className="soullab-container py-soullab-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-soullab-xl">
          <div>
            <div className="flex items-center gap-soullab-sm mb-soullab-sm">
              <Star className="w-6 h-6 text-soullab-fire" />
              <h1 className="soullab-heading-1">Cosmic Timing</h1>
            </div>
            <p className="soullab-text text-soullab-gray">
              Personal astrological wisdom and celestial guidance
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="soullab-button-secondary px-soullab-md py-soullab-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Daily Cosmic Weather */}
        <div className="soullab-card p-soullab-lg mb-soullab-lg">
          <div className="flex items-center gap-soullab-sm mb-soullab-md">
            <Sun className="w-5 h-5 text-soullab-fire" />
            <h2 className="soullab-heading-2">Today's Cosmic Weather</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
            <div>
              <div className="flex items-center gap-soullab-sm mb-soullab-sm">
                <Calendar className="w-4 h-4 text-soullab-gray" />
                <span className="soullab-text-small font-medium">{dailyGuidance.date}</span>
              </div>
              
              <div className="flex items-center gap-soullab-sm mb-soullab-md">
                <Moon className="w-4 h-4 text-soullab-water" />
                <span className="soullab-text-small">
                  {dailyGuidance.moonPhase} in {dailyGuidance.moonSign}
                </span>
              </div>
              
              <p className="soullab-text mb-soullab-md">
                {dailyGuidance.guidance}
              </p>
              
              <div className="grid grid-cols-2 gap-soullab-md">
                <div className="p-soullab-sm bg-soullab-earth/5 border border-soullab-earth/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-soullab-earth" />
                    <span className="soullab-text-xs font-medium">Best Time</span>
                  </div>
                  <span className="soullab-text-xs text-soullab-gray">{dailyGuidance.bestTime}</span>
                </div>
                
                <div className="p-soullab-sm bg-soullab-fire/5 border border-soullab-fire/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-3 h-3 text-soullab-fire" />
                    <span className="soullab-text-xs font-medium">Avoid</span>
                  </div>
                  <span className="soullab-text-xs text-soullab-gray">{dailyGuidance.avoid}</span>
                </div>
              </div>
            </div>
            
            {/* Simple chart visualization */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-2 border-soullab-gray/20"></div>
                
                {/* Planets positioned around circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-soullab-fire rounded-full"
                  title="Sun in Scorpio"
                />
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                  className="absolute top-8 right-8 w-3 h-3 bg-soullab-water rounded-full"
                  title="Moon in Pisces"
                />
                
                <div className="absolute inset-4 rounded-full border border-soullab-purple/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-soullab-purple" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Transits */}
        <div className="soullab-card p-soullab-lg mb-soullab-lg">
          <div className="flex items-center gap-soullab-sm mb-soullab-md">
            <ArrowRight className="w-5 h-5 text-soullab-air" />
            <h2 className="soullab-heading-2">Current Transits</h2>
          </div>
          
          <div className="space-y-soullab-md">
            {currentTransits.map((transit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-soullab-md border border-l-4 rounded-lg ${getElementColor(transit.element)}`}
              >
                <div className="flex items-start justify-between mb-soullab-sm">
                  <div>
                    <h3 className="soullab-text-small font-medium">
                      {transit.planet} {transit.aspect} {transit.target}
                    </h3>
                    <span className="soullab-text-xs text-soullab-gray">{transit.date}</span>
                  </div>
                  <button className="soullab-text-xs text-soullab-fire hover:underline">
                    More Info
                  </button>
                </div>
                <p className="soullab-text-xs text-soullab-gray">{transit.meaning}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Birth Chart Summary */}
        <div className="soullab-card p-soullab-lg mb-soullab-lg">
          <div className="flex items-center gap-soullab-sm mb-soullab-md">
            <Heart className="w-5 h-5 text-soullab-purple" />
            <h2 className="soullab-heading-2">Your Sacred Blueprint</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-soullab-md">
            <div className="p-soullab-md bg-soullab-fire/5 border border-soullab-fire/20 rounded-lg">
              <div className="flex items-center gap-soullab-sm mb-soullab-sm">
                <Sun className="w-4 h-4 text-soullab-fire" />
                <span className="soullab-text-small font-medium">Sun - Core Identity</span>
              </div>
              <div className="soullab-text-xs text-soullab-gray">
                {userChart.sun.sign} {userChart.sun.degree} • House {userChart.sun.house}
              </div>
            </div>
            
            <div className="p-soullab-md bg-soullab-water/5 border border-soullab-water/20 rounded-lg">
              <div className="flex items-center gap-soullab-sm mb-soullab-sm">
                <Moon className="w-4 h-4 text-soullab-water" />
                <span className="soullab-text-small font-medium">Moon - Emotional Nature</span>
              </div>
              <div className="soullab-text-xs text-soullab-gray">
                {userChart.moon.sign} {userChart.moon.degree} • House {userChart.moon.house}
              </div>
            </div>
            
            <div className="p-soullab-md bg-soullab-earth/5 border border-soullab-earth/20 rounded-lg">
              <div className="flex items-center gap-soullab-sm mb-soullab-sm">
                <ArrowRight className="w-4 h-4 text-soullab-earth" />
                <span className="soullab-text-small font-medium">Rising - Life Approach</span>
              </div>
              <div className="soullab-text-xs text-soullab-gray">
                {userChart.rising.sign} {userChart.rising.degree} • House {userChart.rising.house}
              </div>
            </div>
          </div>
          
          <div className="mt-soullab-md pt-soullab-md border-t border-soullab-gray/20">
            <button className="soullab-button w-full sm:w-auto">
              <Star className="w-4 h-4" />
              <span>View Complete Chart</span>
            </button>
          </div>
        </div>

        {/* Sacred Timing Integration */}
        <div className="soullab-card p-soullab-lg">
          <div className="flex items-center gap-soullab-sm mb-soullab-md">
            <Clock className="w-5 h-5 text-soullab-air" />
            <h2 className="soullab-heading-2">Sacred Timing Integration</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-soullab-lg">
            <div>
              <h3 className="soullab-text-small font-medium mb-soullab-sm">Oracle Consultation Times</h3>
              <p className="soullab-text-xs text-soullab-gray mb-soullab-md">
                Your Personal Oracle uses astrological timing to optimize conversation quality and insight depth.
              </p>
              
              <div className="space-y-soullab-sm">
                <div className="flex items-center justify-between p-soullab-sm bg-soullab-earth/5 rounded">
                  <span className="soullab-text-xs">Deep Shadow Work</span>
                  <span className="soullab-text-xs text-soullab-gray">Scorpio Moon phases</span>
                </div>
                <div className="flex items-center justify-between p-soullab-sm bg-soullab-water/5 rounded">
                  <span className="soullab-text-xs">Emotional Healing</span>
                  <span className="soullab-text-xs text-soullab-gray">Pisces transits</span>
                </div>
                <div className="flex items-center justify-between p-soullab-sm bg-soullab-fire/5 rounded">
                  <span className="soullab-text-xs">Vision & Planning</span>
                  <span className="soullab-text-xs text-soullab-gray">Fire sign energies</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="soullab-text-small font-medium mb-soullab-sm">Personalized Recommendations</h3>
              <div className="space-y-soullab-sm">
                <div className="p-soullab-sm bg-soullab-purple/5 border border-soullab-purple/20 rounded">
                  <div className="soullab-text-xs font-medium mb-1">This Week's Focus</div>
                  <div className="soullab-text-xs text-soullab-gray">
                    Saturn square Mars suggests working with structured discipline around anger and drive.
                  </div>
                </div>
                
                <button
                  onClick={() => router.push('/oracle/meet')}
                  className="w-full soullab-button-secondary text-left"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Consult Oracle with Cosmic Timing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AstrologyPage;