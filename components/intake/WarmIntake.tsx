'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Moon, Sun, Globe, Heart, Compass, BookOpen } from 'lucide-react';

interface IntakeData {
  // Essential
  name?: string;
  ageRange?: string;
  pronouns?: string;
  
  // Context
  lifePhase?: string;
  focusAreas?: string[];
  currentMood?: number;
  
  // Optional depth
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  location?: string;
  culturalBackground?: string;
  
  // Research
  howHeard?: string;
  betaConsent?: boolean;
  researchConsent?: boolean;
}

const FOCUS_AREAS = [
  { id: 'purpose', label: 'Life Purpose', icon: Compass },
  { id: 'relationships', label: 'Relationships', icon: Heart },
  { id: 'creativity', label: 'Creative Flow', icon: Sparkles },
  { id: 'spirituality', label: 'Spiritual Growth', icon: Moon },
  { id: 'career', label: 'Career Path', icon: Globe },
  { id: 'healing', label: 'Inner Healing', icon: Sun },
  { id: 'wisdom', label: 'Ancient Wisdom', icon: BookOpen },
];

export function WarmIntake({ onComplete }: { onComplete: (data: IntakeData) => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeData>({});
  const [isMinimal, setIsMinimal] = useState(false);

  const updateData = (field: keyof IntakeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    // Step 0: Welcome
    {
      id: 'welcome',
      render: () => (
        <div className="text-center space-y-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center"
          >
            <img src="/holoflower.svg" alt="Sacred Holoflower" className="w-24 h-24" />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-light text-white/90">
              Welcome to the Oracle Beta
            </h2>
            <p className="text-white/70 max-w-md mx-auto">
              Before we begin our journey together, I'd like to learn a bit about you. 
              This helps me be more present with you and contributes to our research on AI-guided wisdom.
            </p>
            
            <div className="text-white/50 text-sm space-y-2 max-w-sm mx-auto">
              <p>✦ Your privacy is sacred</p>
              <p>✦ Skip anything you're not comfortable sharing</p>
              <p>✦ This takes about 3 minutes</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white/90 rounded-full transition-all"
            >
              Let's begin
            </button>
            <button
              onClick={() => {
                setIsMinimal(true);
                setStep(1);
              }}
              className="text-white/50 hover:text-white/70 text-sm transition-all"
            >
              Quick start (minimal info)
            </button>
          </div>
        </div>
      )
    },

    // Step 1: Name & Basics
    {
      id: 'basics',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              First, what should I call you?
            </h3>
            <p className="text-white/60 text-sm">
              Your first name or a nickname is perfect
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={data.name || ''}
              onChange={(e) => updateData('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              autoFocus
            />

            <select
              value={data.pronouns || ''}
              onChange={(e) => updateData('pronouns', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-white/40 focus:outline-none"
            >
              <option value="">Pronouns (optional)</option>
              <option value="she/her">she/her</option>
              <option value="he/him">he/him</option>
              <option value="they/them">they/them</option>
              <option value="she/they">she/they</option>
              <option value="he/they">he/they</option>
              <option value="other">other</option>
            </select>

            <select
              value={data.ageRange || ''}
              onChange={(e) => updateData('ageRange', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 focus:border-white/40 focus:outline-none"
            >
              <option value="">Age range (optional)</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65+">65+</option>
            </select>
          </div>
        </div>
      )
    },

    // Step 2: Current Focus
    {
      id: 'focus',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              What areas call to you right now?
            </h3>
            <p className="text-white/60 text-sm">
              Select all that resonate
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {FOCUS_AREAS.map(area => {
              const Icon = area.icon;
              const isSelected = data.focusAreas?.includes(area.id);
              
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
                      ? 'bg-white/10 border-white/30 text-white/90' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm">{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )
    },

    // Step 3: Optional Astrology (skip if minimal)
    ...(!isMinimal ? [{
      id: 'astrology',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Would you like astrological insights?
            </h3>
            <p className="text-white/60 text-sm">
              Many find this adds meaningful depth to their guidance
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-4">
            <input
              type="date"
              placeholder="Birth date"
              value={data.birthDate || ''}
              onChange={(e) => updateData('birthDate', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 placeholder-white/40 focus:border-white/40 focus:outline-none"
            />

            <input
              type="time"
              placeholder="Birth time (if known)"
              value={data.birthTime || ''}
              onChange={(e) => updateData('birthTime', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white/90 placeholder-white/40 focus:border-white/40 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Birth place (city, country)"
              value={data.birthPlace || ''}
              onChange={(e) => updateData('birthPlace', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            />

            <button
              onClick={() => setStep(step + 1)}
              className="w-full text-white/40 hover:text-white/60 text-sm transition-all mt-2"
            >
              Skip this step
            </button>
          </div>
        </div>
      )
    }] : []),

    // Step 4: Research Consent
    {
      id: 'consent',
      render: () => (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white/90">
              Help us learn and grow
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              As a beta tester, your experience helps shape the future of AI-guided wisdom
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.betaConsent || false}
                onChange={(e) => updateData('betaConsent', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Anonymous usage analytics</p>
                <p className="text-white/50 text-xs mt-1">
                  Help us understand how people use the Oracle
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={data.researchConsent || false}
                onChange={(e) => updateData('researchConsent', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-white/80 text-sm">Research participation</p>
                <p className="text-white/50 text-xs mt-1">
                  Occasional surveys and potential interview invitations
                </p>
              </div>
            </label>

            <div className="text-center pt-4">
              <select
                value={data.howHeard || ''}
                onChange={(e) => updateData('howHeard', e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/70 text-sm focus:border-white/40 focus:outline-none"
              >
                <option value="">How did you hear about us?</option>
                <option value="friend">Friend/Word of mouth</option>
                <option value="social">Social media</option>
                <option value="search">Web search</option>
                <option value="community">Spiritual community</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const canProceed = step === 0 || (step === 1 && data.name) || step > 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex justify-center gap-2">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`
                    h-1 rounded-full transition-all
                    ${i === 0 ? 'w-0' : 'w-12'}
                    ${i <= step ? 'bg-white/40' : 'bg-white/10'}
                  `}
                />
              ))}
            </div>
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
                  ? 'bg-white/10 hover:bg-white/15 text-white/90' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
                }
              `}
            >
              {isLastStep ? 'Complete' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}