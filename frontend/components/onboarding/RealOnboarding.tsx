'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Heart, Brain, Target, Sparkles } from 'lucide-react';
import { SacredButton } from '@/components/ui/SacredButton';
import { SacredCard } from '@/components/ui/SacredCard';
import { sacredData } from '@/lib/sacred-data';

interface OnboardingData {
  name: string;
  email: string;
  birthDate: string;
  currentChallenge: string;
  primaryGoal: string;
  communicationStyle: 'direct' | 'gentle' | 'analytical' | 'creative';
}

interface RealOnboardingProps {
  onComplete: (userData: any) => void;
}

export const RealOnboarding: React.FC<RealOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    birthDate: '',
    currentChallenge: '',
    primaryGoal: '',
    communicationStyle: 'direct'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save real user data to backend
      const userData = await sacredData.completeOnboarding(data);
      
      // Store auth token for demo
      localStorage.setItem('authToken', 'demo-token-' + userData.id);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      onComplete(userData);
    } catch (error) {
      console.log('Demo mode: onboarding completed locally');
      const demoUser = {
        id: 'demo-user',
        name: data.name,
        email: data.email,
        preferences: {
          communicationStyle: data.communicationStyle,
          primaryGoal: data.primaryGoal
        }
      };
      localStorage.setItem('userData', JSON.stringify(demoUser));
      onComplete(demoUser);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.name.trim() && data.email.trim();
      case 2: return data.currentChallenge.trim();
      case 3: return data.primaryGoal.trim();
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`
                  w-3 h-3 rounded-full transition-colors duration-300
                  ${i + 1 <= step ? 'bg-soullab-fire' : 'bg-soullab-gray/30'}
                `}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SacredCard variant="premium" className="p-8">
              
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="text-center">
                  <Heart className="w-12 h-12 text-soullab-fire mx-auto mb-6" />
                  <h2 className="soullab-heading-2 mb-4">Welcome to Soullab</h2>
                  <p className="soullab-text mb-8">
                    Let's get to know you so your Sacred Guide can provide the most relevant support.
                  </p>
                  
                  <div className="space-y-6 text-left">
                    <div>
                      <label className="block soullab-text font-medium mb-2">
                        What should we call you?
                      </label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your first name"
                        className="soullab-input"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="block soullab-text font-medium mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="you@company.com"
                        className="soullab-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Current Challenge */}
              {step === 2 && (
                <div className="text-center">
                  <Target className="w-12 h-12 text-soullab-water mx-auto mb-6" />
                  <h2 className="soullab-heading-2 mb-4">What's on your mind?</h2>
                  <p className="soullab-text mb-8">
                    Share something you're currently navigating. This helps your guide understand where to focus.
                  </p>
                  
                  <div className="text-left">
                    <label className="block soullab-text font-medium mb-2">
                      Current challenge or focus area
                    </label>
                    <textarea
                      value={data.currentChallenge}
                      onChange={(e) => setData(prev => ({ ...prev, currentChallenge: e.target.value }))}
                      placeholder="e.g., Leading through organizational change, work-life integration, strategic decision-making..."
                      className="soullab-input soullab-textarea"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Primary Goal */}
              {step === 3 && (
                <div className="text-center">
                  <Brain className="w-12 h-12 text-soullab-earth mx-auto mb-6" />
                  <h2 className="soullab-heading-2 mb-4">What would success look like?</h2>
                  <p className="soullab-text mb-8">
                    Help us understand what you're working toward in the bigger picture.
                  </p>
                  
                  <div className="text-left">
                    <label className="block soullab-text font-medium mb-2">
                      Primary goal or aspiration
                    </label>
                    <textarea
                      value={data.primaryGoal}
                      onChange={(e) => setData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                      placeholder="e.g., Build authentic leadership presence, create sustainable high performance, integrate personal growth with professional excellence..."
                      className="soullab-input soullab-textarea"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Communication Style */}
              {step === 4 && (
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-soullab-air mx-auto mb-6" />
                  <h2 className="soullab-heading-2 mb-4">How do you like to communicate?</h2>
                  <p className="soullab-text mb-8">
                    Your guide will adapt their style to what works best for you.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { value: 'direct', label: 'Direct & Clear', desc: 'Straight to the point' },
                      { value: 'gentle', label: 'Gentle & Supportive', desc: 'Warm and encouraging' },
                      { value: 'analytical', label: 'Analytical & Structured', desc: 'Data-driven insights' },
                      { value: 'creative', label: 'Creative & Intuitive', desc: 'Metaphors and stories' }
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setData(prev => ({ ...prev, communicationStyle: style.value as any }))}
                        className={`
                          p-4 rounded-soullab-lg border-2 text-left transition-all
                          ${data.communicationStyle === style.value
                            ? 'border-soullab-fire bg-soullab-fire/5'
                            : 'border-soullab-gray/20 hover:border-soullab-fire/40'
                          }
                        `}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-soullab-gray">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-soullab-gray/20">
                <SacredButton
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                  icon={<ArrowLeft className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Back
                </SacredButton>
                
                <SacredButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {step === totalSteps ? 'Complete Setup' : 'Continue'}
                </SacredButton>
              </div>
            </SacredCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};