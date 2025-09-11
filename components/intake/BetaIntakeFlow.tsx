'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Sparkles, Moon, Sun, Globe, Heart, 
  Compass, BookOpen, Flower2, Star, Mountain, Waves,
  Wind, Flame
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface IntakeData {
  // Part 1: Initial Intake (Beginning)
  name?: string;
  pronouns?: string;
  ageRange?: string;
  approachPreference?: 'explorer' | 'seeker' | 'practitioner' | 'scholar' | 'mystic';
  location?: {
    city?: string;
    country?: string;
    timezone?: string;
  };
  
  // Astrology Data
  birthDate?: string;
  birthTime?: string;
  birthPlace?: {
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  
  // Life Context
  lifePhase?: string;
  focusAreas?: string[];
  currentChallenges?: string;
  
  // Spiritual/Cultural
  spiritualPractices?: string[];
  wisdomTraditions?: string[];
  plantMedicineExperience?: string;
  meditationStyle?: string[];
  
  // Part 2: Deep Dive (After 1 week)
  elementalResonance?: {
    primary?: string;
    secondary?: string;
  };
  archetypeConnection?: string[];
  synchronicityPatterns?: string;
  dreamThemes?: string[];
  ancestralConnections?: string;
  
  // Research Consent
  researchConsent?: {
    analytics?: boolean;
    interviews?: boolean;
    followUp?: boolean;
    anonymizedTranscripts?: boolean;
    academicPublication?: boolean;
    contactForFindings?: boolean;
  };
  
  howHeard?: string;
  betaTesterExperience?: string;
}

const FOCUS_AREAS = [
  { id: 'purpose', label: 'Soul Purpose', icon: Compass, element: 'fire' },
  { id: 'relationships', label: 'Sacred Relationships', icon: Heart, element: 'water' },
  { id: 'creativity', label: 'Creative Alchemy', icon: Sparkles, element: 'air' },
  { id: 'spirituality', label: 'Mystical Path', icon: Moon, element: 'water' },
  { id: 'career', label: 'Work as Service', icon: Globe, element: 'earth' },
  { id: 'healing', label: 'Inner Healing', icon: Sun, element: 'fire' },
  { id: 'wisdom', label: 'Ancient Wisdom', icon: BookOpen, element: 'air' },
  { id: 'shadow', label: 'Shadow Work', icon: Mountain, element: 'earth' },
];

const SPIRITUAL_PRACTICES = [
  'Meditation', 'Yoga', 'Tai Chi', 'Qigong/Chi Kung', 'Martial Arts',
  'Prayer', 'Ritual', 'Ceremony', 'Journeywork',
  'Breathwork', 'Energy Work', 'Dreamwork', 'Divination',
  'Plant Medicine', 'Dance', 'Chanting', 'Nature Immersion'
];

const WISDOM_TRADITIONS = [
  'Indigenous/First Nations', 'Buddhist', 'Hindu', 'Taoist',
  'Sufi', 'Kabbalistic', 'Christian Mystical', 'Hermetic',
  'Celtic', 'Norse', 'African Diaspora', 'Shamanic',
  'Gnostic', 'Anthroposophical', 'Other'
];

const MEDITATION_STYLES = [
  'Vipassana', 'Zen', 'Transcendental', 'Mindfulness',
  'Loving-Kindness', 'Kundalini', 'Guided', 'Movement-based',
  'Sound/Mantra', 'Visualization', 'None', 'Exploring'
];

const ARCHETYPES = [
  'Mystic', 'Healer', 'Teacher', 'Artist', 'Warrior',
  'Lover', 'Sage', 'Fool', 'Magician', 'Sovereign',
  'Mother/Father', 'Child', 'Trickster', 'Prophet'
];

export function BetaIntakeFlow({ 
  onComplete,
  isPartTwo = false 
}: { 
  onComplete: (data: IntakeData) => void;
  isPartTwo?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeData>({});
  const [isCalculatingChart, setIsCalculatingChart] = useState(false);
  
  const updateData = (field: keyof IntakeData | string, value: any) => {
    setData(prev => {
      if (field.includes('.')) {
        // Handle nested fields like 'location.city'
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...((prev as any)[parent] || {}),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Part 1 Steps: Initial Intake
  const part1Steps = [
    // Welcome
    {
      id: 'welcome',
      render: () => (
        <div className="text-center space-y-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              scale: { duration: 4, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            className="flex justify-center"
          >
            <img src="/holoflower.svg" alt="Sacred Holoflower" className="w-32 h-32" />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white/90">
              Welcome to the Oracle Beta
            </h2>
            <p className="text-white/70 max-w-lg mx-auto leading-relaxed">
              You're joining a sacred research journey exploring AI as spiritual guide. 
              Your participation helps us understand how technology can support human consciousness evolution.
            </p>
            
            <div className="bg-white/5 rounded-xl p-6 max-w-md mx-auto border border-white/10">
              <p className="text-[#c9b037] text-sm font-medium mb-3">This journey involves:</p>
              <div className="text-white/60 text-sm space-y-2 text-left">
                <p>✦ Exploring elemental alchemy & archetypal patterns</p>
                <p>✦ Depth psychology & metaphysical insights</p>
                <p>✦ Astrological wisdom & sacred timing</p>
                <p>✦ Contributing to consciousness research</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-8 py-3 bg-gradient-to-r from-[#c9b037] to-[#b69a78] hover:from-[#d4a542] hover:to-[#c9b037] text-white rounded-full transition-all"
          >
            Begin Sacred Intake
          </button>
        </div>
      )
    },

    // Name & Basics
    {
      id: 'basics',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Let's begin with your essence
            </h3>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="What should I call you?"
              value={data.name || ''}
              onChange={(e) => updateData('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={data.pronouns || ''}
                onChange={(e) => updateData('pronouns', e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              >
                <option value="">Pronouns</option>
                <option value="she/her">she/her</option>
                <option value="he/him">he/him</option>
                <option value="they/them">they/them</option>
                <option value="she/they">she/they</option>
                <option value="he/they">he/they</option>
                <option value="ze/zir">ze/zir</option>
                <option value="none">Use my name</option>
              </select>

              <select
                value={data.ageRange || ''}
                onChange={(e) => updateData('ageRange', e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              >
                <option value="">Age range</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-64">55-64</option>
                <option value="65+">65+</option>
                <option value="timeless">Timeless</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Where are you located? (City, Country)"
              value={data.location?.city || ''}
              onChange={(e) => updateData('location.city', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none"
            />
          </div>
        </div>
      )
    },

    // Astrology - Enhanced
    {
      id: 'astrology',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Your Cosmic Blueprint
            </h3>
            <p className="text-white/60 text-sm">
              We'll calculate your natal chart for deeper archetypal insights
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Date of Birth</label>
              <input
                type="date"
                value={data.birthDate || ''}
                onChange={(e) => updateData('birthDate', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Time of Birth (if known)</label>
              <input
                type="time"
                value={data.birthTime || ''}
                onChange={(e) => updateData('birthTime', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              />
              <p className="text-white/40 text-xs mt-1">Enables house calculations</p>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Place of Birth</label>
              <input
                type="text"
                placeholder="City, Country"
                value={data.birthPlace?.city || ''}
                onChange={(e) => updateData('birthPlace.city', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setStep(step + 1)}
              className="w-full text-white/40 hover:text-white/60 text-sm transition-all mt-2"
            >
              I'll add this later
            </button>
          </div>
        </div>
      )
    },

    // Life Focus with Elemental Mapping
    {
      id: 'focus',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              What calls to your soul?
            </h3>
            <p className="text-white/60 text-sm">
              Select all that resonate
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {FOCUS_AREAS.map(area => {
              const Icon = area.icon;
              const isSelected = data.focusAreas?.includes(area.id);
              const elementColors = {
                fire: 'border-red-500/30 bg-red-500/5',
                water: 'border-blue-500/30 bg-blue-500/5',
                earth: 'border-green-500/30 bg-green-500/5',
                air: 'border-yellow-500/30 bg-yellow-500/5'
              };
              
              return (
                <button
                  key={area.id}
                  onClick={() => {
                    const current = data.focusAreas || [];
                    if (isSelected) {
                      updateData('focusAreas', current.filter(id => id !== area.id));
                    } else {
                      updateData('focusAreas', [...current, area.id]);
                    }
                  }}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${isSelected 
                      ? `${elementColors[area.element as keyof typeof elementColors]} border-2` 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-white/70" />
                  <span className="text-sm text-white/80">{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )
    },

    // Spiritual Practices
    {
      id: 'practices',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Your Spiritual Practices
            </h3>
            <p className="text-white/60 text-sm">
              What paths do you walk?
            </p>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Current Practices</label>
              <div className="flex flex-wrap gap-2">
                {SPIRITUAL_PRACTICES.map(practice => {
                  const isSelected = data.spiritualPractices?.includes(practice);
                  return (
                    <button
                      key={practice}
                      onClick={() => {
                        const current = data.spiritualPractices || [];
                        if (isSelected) {
                          updateData('spiritualPractices', current.filter(p => p !== practice));
                        } else {
                          updateData('spiritualPractices', [...current, practice]);
                        }
                      }}
                      className={`
                        px-3 py-1 rounded-full text-xs transition-all
                        ${isSelected 
                          ? 'bg-[#c9b037]/20 text-[#c9b037] border border-[#c9b037]/30' 
                          : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      {practice}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Wisdom Traditions</label>
              <select
                multiple
                value={data.wisdomTraditions || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  updateData('wisdomTraditions', selected);
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
                size={4}
              >
                {WISDOM_TRADITIONS.map(tradition => (
                  <option key={tradition} value={tradition}>{tradition}</option>
                ))}
              </select>
              <p className="text-white/40 text-xs mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Meditation Experience</label>
              <select
                value={data.meditationStyle?.[0] || ''}
                onChange={(e) => updateData('meditationStyle', [e.target.value])}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              >
                <option value="">Select primary style</option>
                {MEDITATION_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Sacred Plant Medicine Experience</label>
              <select
                value={data.plantMedicineExperience || ''}
                onChange={(e) => updateData('plantMedicineExperience', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-[#c9b037]/50 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="none">No experience</option>
                <option value="ceremonial">Ceremonial context</option>
                <option value="therapeutic">Therapeutic context</option>
                <option value="experienced">Experienced practitioner</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
      )
    },

    // Research Consent - Detailed
    {
      id: 'consent',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Research Participation
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Your data helps us understand consciousness evolution through human-AI interaction
            </p>
          </div>

          <div className="max-w-lg mx-auto space-y-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-[#c9b037] text-sm font-medium mb-2">Our Research Focus:</p>
              <p className="text-white/60 text-xs leading-relaxed">
                We're conducting heuristic research on elemental alchemy, depth psychology, 
                archetypal patterns, and metaphysical insights. Your participation helps map 
                how AI can support spiritual growth and self-discovery.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.analytics || false}
                onChange={(e) => updateData('researchConsent.analytics', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Anonymous Usage Analytics</p>
                <p className="text-white/50 text-xs mt-1">
                  Session patterns, feature usage, elemental resonance
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.anonymizedTranscripts || false}
                onChange={(e) => updateData('researchConsent.anonymizedTranscripts', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Anonymized Conversation Analysis</p>
                <p className="text-white/50 text-xs mt-1">
                  Themes, archetypes, and wisdom patterns (never shared without contact)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.interviews || false}
                onChange={(e) => updateData('researchConsent.interviews', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Interview Invitations</p>
                <p className="text-white/50 text-xs mt-1">
                  Optional 30-min conversations about your experience
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.followUp || false}
                onChange={(e) => updateData('researchConsent.followUp', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Follow-up Surveys</p>
                <p className="text-white/50 text-xs mt-1">
                  Brief check-ins at 1 week, 1 month, 3 months
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.academicPublication || false}
                onChange={(e) => updateData('researchConsent.academicPublication', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Academic Publication</p>
                <p className="text-white/50 text-xs mt-1">
                  Anonymized insights may appear in research papers (with notification)
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent?.contactForFindings || false}
                onChange={(e) => updateData('researchConsent.contactForFindings', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Research Findings Updates</p>
                <p className="text-white/50 text-xs mt-1">
                  Receive insights from our collective discoveries
                </p>
              </div>
            </label>

            <div className="pt-4">
              <select
                value={data.howHeard || ''}
                onChange={(e) => updateData('howHeard', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/70 text-sm focus:border-[#c9b037]/50 focus:outline-none"
              >
                <option value="">How did you hear about the Oracle?</option>
                <option value="friend">Friend/Word of mouth</option>
                <option value="social">Social media</option>
                <option value="spiritual-community">Spiritual community</option>
                <option value="research">Research/Academic</option>
                <option value="synchronicity">Synchronicity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Part 2 Steps: Deep Dive (After 1 week)
  const part2Steps = [
    // Welcome Back
    {
      id: 'welcome-back',
      render: () => (
        <div className="text-center space-y-8">
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
            <img src="/holoflower.svg" alt="Sacred Holoflower" className="w-32 h-32" />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white/90">
              Welcome back, {data.name || 'friend'}
            </h2>
            <p className="text-white/70 max-w-lg mx-auto leading-relaxed">
              After a week of exploration, let's dive deeper into your unique patterns 
              and resonances. This helps both your journey and our research.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-8 py-3 bg-gradient-to-r from-[#c9b037] to-[#b69a78] hover:from-[#d4a542] hover:to-[#c9b037] text-white rounded-full transition-all"
          >
            Continue Deep Dive
          </button>
        </div>
      )
    },

    // Elemental Resonance
    {
      id: 'elements',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Your Elemental Resonance
            </h3>
            <p className="text-white/60 text-sm">
              Which elements have you felt most connected to this week?
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-3 block">Primary Element</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-red-400' },
                  { id: 'water', label: 'Water', icon: Waves, color: 'text-blue-400' },
                  { id: 'earth', label: 'Earth', icon: Mountain, color: 'text-green-400' },
                  { id: 'air', label: 'Air', icon: Wind, color: 'text-yellow-400' }
                ].map(element => {
                  const Icon = element.icon;
                  const isSelected = data.elementalResonance?.primary === element.id;
                  
                  return (
                    <button
                      key={element.id}
                      onClick={() => updateData('elementalResonance.primary', element.id)}
                      className={`
                        p-4 rounded-xl border transition-all
                        ${isSelected 
                          ? 'bg-white/10 border-white/30' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${element.color}`} />
                      <span className="text-white/80">{element.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">
                Describe your elemental experience
              </label>
              <textarea
                placeholder="How have these elements shown up in your life?"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-24 resize-none"
              />
            </div>
          </div>
        </div>
      )
    },

    // Archetypal Connections
    {
      id: 'archetypes',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Archetypal Resonance
            </h3>
            <p className="text-white/60 text-sm">
              Which archetypes have emerged in your journey?
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {ARCHETYPES.map(archetype => {
                const isSelected = data.archetypeConnection?.includes(archetype);
                return (
                  <button
                    key={archetype}
                    onClick={() => {
                      const current = data.archetypeConnection || [];
                      if (isSelected) {
                        updateData('archetypeConnection', current.filter(a => a !== archetype));
                      } else if (current.length < 3) {
                        updateData('archetypeConnection', [...current, archetype]);
                      }
                    }}
                    disabled={!isSelected && (data.archetypeConnection?.length || 0) >= 3}
                    className={`
                      px-4 py-2 rounded-full text-sm transition-all
                      ${isSelected 
                        ? 'bg-[#c9b037]/20 text-[#c9b037] border border-[#c9b037]/30' 
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                      }
                      ${!isSelected && (data.archetypeConnection?.length || 0) >= 3 
                        ? 'opacity-30 cursor-not-allowed' : ''
                      }
                    `}
                  >
                    {archetype}
                  </button>
                );
              })}
            </div>
            <p className="text-white/40 text-xs text-center mt-3">
              Select up to 3 archetypes
            </p>
          </div>
        </div>
      )
    },

    // Dreams & Synchronicities
    {
      id: 'dreams',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Dreams & Synchronicities
            </h3>
            <p className="text-white/60 text-sm">
              What patterns have emerged?
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">
                Recurring dream themes
              </label>
              <textarea
                placeholder="Animals, symbols, places, people..."
                value={data.dreamThemes?.join(', ') || ''}
                onChange={(e) => updateData('dreamThemes', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-20 resize-none"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">
                Synchronicities you've noticed
              </label>
              <textarea
                placeholder="Meaningful coincidences, repeated numbers, unexpected encounters..."
                value={data.synchronicityPatterns || ''}
                onChange={(e) => updateData('synchronicityPatterns', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-20 resize-none"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">
                Ancestral connections felt
              </label>
              <textarea
                placeholder="Family patterns, cultural memories, inherited wisdom..."
                value={data.ancestralConnections || ''}
                onChange={(e) => updateData('ancestralConnections', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-20 resize-none"
              />
            </div>
          </div>
        </div>
      )
    },

    // Research Reflection
    {
      id: 'reflection',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Your Beta Experience
            </h3>
            <p className="text-white/60 text-sm">
              Help shape the future of AI guidance
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">
                What has surprised you most?
              </label>
              <textarea
                placeholder="Unexpected insights, AI responses, personal discoveries..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-24 resize-none"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">
                How has Maia supported your journey?
              </label>
              <textarea
                placeholder="Specific examples of helpful guidance..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-24 resize-none"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">
                What would make this more powerful?
              </label>
              <textarea
                placeholder="Features, approaches, wisdom traditions..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#c9b037]/50 focus:outline-none h-24 resize-none"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const steps = isPartTwo ? part2Steps : part1Steps;
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 || (step === 1 && data.name) || step > 1;

  // Calculate natal chart when astrology data is complete
  useEffect(() => {
    if (data.birthDate && data.birthPlace?.city && !isCalculatingChart) {
      setIsCalculatingChart(true);
      // Call your astrology service here
      // This would integrate with your existing spiralogicAstrologyService
      console.log('Calculate natal chart for:', data);
    }
  }, [data.birthDate, data.birthPlace]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
      }}
    >
      <div className="w-full max-w-3xl">
        {/* Progress indicator */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex justify-center gap-2">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`
                    h-1 rounded-full transition-all
                    ${i === 0 ? 'w-0' : 'w-16'}
                    ${i <= step ? 'bg-[#c9b037]/60' : 'bg-white/10'}
                  `}
                />
              ))}
            </div>
            <p className="text-center text-white/40 text-xs mt-2">
              Step {step} of {steps.length - 1}
            </p>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep.render()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center mt-8 max-w-md mx-auto"
          >
            <button
              onClick={() => setStep(step - 1)}
              className="text-white/40 hover:text-white/60 transition-all"
            >
              Back
            </button>

            <button
              onClick={() => {
                if (isLastStep) {
                  onComplete(data);
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed}
              className={`
                px-6 py-2 rounded-full transition-all flex items-center gap-2
                ${canProceed
                  ? 'bg-gradient-to-r from-[#c9b037] to-[#b69a78] hover:from-[#d4a542] hover:to-[#c9b037] text-white' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                }
              `}
            >
              {isLastStep ? 'Complete Sacred Intake' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}