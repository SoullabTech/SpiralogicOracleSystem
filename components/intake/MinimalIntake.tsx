'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntakeData {
  // Part 1: Initial
  name?: string;
  ageRange?: string;
  pronouns?: string;
  location?: string;
  
  // Part 2: Context
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  lifePhase?: string;
  focusAreas?: string[];
  
  // Part 3: Spiritual
  spiritualPractices?: string[];
  wisdomTraditions?: string[];
  meditationExperience?: string;
  
  // Part 4: Research
  researchConsent?: {
    analytics?: boolean;
    interviews?: boolean;
    transcripts?: boolean;
    publications?: boolean;
  };
}

const STEPS = [
  'basics',
  'astrology', 
  'life-context',
  'spiritual',
  'research'
];

export function MinimalIntake({ onComplete }: { onComplete: (data: IntakeData) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<IntakeData>({});
  const [skipped, setSkipped] = useState<number[]>([]);

  const updateData = (field: keyof IntakeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleSkip = () => {
    setSkipped([...skipped, currentStep]);
    handleContinue();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'basics':
        return (
          <>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-normal text-gray-900">Onboarding</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                To personalize your experience, I'd like to learn<br />
                a bit about you. Your answers are<br />
                encrypted and never shared.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Name or nickname</label>
                <input
                  type="text"
                  value={data.name || ''}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Age range</label>
                <select
                  value={data.ageRange || ''}
                  onChange={(e) => updateData('ageRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Pronouns</label>
                <select
                  value={data.pronouns || ''}
                  onChange={(e) => updateData('pronouns', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="she/they">she/they</option>
                  <option value="he/they">he/they</option>
                  <option value="other">other</option>
                  <option value="prefer-not">prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={data.location || ''}
                  onChange={(e) => updateData('location', e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'astrology':
        return (
          <>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-normal text-gray-900">Birth Information</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                For astrological insights and deeper<br />
                archetypal understanding. This step<br />
                is optional but recommended.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date of birth</label>
                <input
                  type="date"
                  value={data.birthDate || ''}
                  onChange={(e) => updateData('birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Time of birth (if known)</label>
                <input
                  type="time"
                  value={data.birthTime || ''}
                  onChange={(e) => updateData('birthTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Place of birth</label>
                <input
                  type="text"
                  value={data.birthPlace || ''}
                  onChange={(e) => updateData('birthPlace', e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'life-context':
        return (
          <>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-normal text-gray-900">Life Context</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Understanding your current life phase<br />
                helps provide more relevant guidance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Current life phase</label>
                <select
                  value={data.lifePhase || ''}
                  onChange={(e) => updateData('lifePhase', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="student">Student</option>
                  <option value="early-career">Early Career</option>
                  <option value="mid-career">Mid Career</option>
                  <option value="transition">Life Transition</option>
                  <option value="retirement">Retirement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-3">Areas of focus</label>
                <div className="space-y-2">
                  {[
                    'Life Purpose',
                    'Relationships', 
                    'Career Path',
                    'Spiritual Growth',
                    'Creative Expression',
                    'Inner Healing',
                    'Shadow Work',
                    'Life Transitions'
                  ].map(area => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.focusAreas?.includes(area) || false}
                        onChange={(e) => {
                          const current = data.focusAreas || [];
                          if (e.target.checked) {
                            updateData('focusAreas', [...current, area]);
                          } else {
                            updateData('focusAreas', current.filter(a => a !== area));
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'spiritual':
        return (
          <>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-normal text-gray-900">Spiritual Background</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your spiritual practices and traditions<br />
                help shape personalized guidance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-3">Current practices</label>
                <div className="space-y-2">
                  {[
                    'Meditation',
                    'Yoga',
                    'Tai Chi',
                    'Qigong/Chi Kung',
                    'Martial Arts',
                    'Prayer',
                    'Breathwork',
                    'Journeywork',
                    'Energy Work',
                    'Dreamwork',
                    'Plant Medicine',
                    'Ritual/Ceremony'
                  ].map(practice => (
                    <label key={practice} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.spiritualPractices?.includes(practice) || false}
                        onChange={(e) => {
                          const current = data.spiritualPractices || [];
                          if (e.target.checked) {
                            updateData('spiritualPractices', [...current, practice]);
                          } else {
                            updateData('spiritualPractices', current.filter(p => p !== practice));
                          }
                        }}
                        className="mr-3 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{practice}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Meditation experience</label>
                <select
                  value={data.meditationExperience || ''}
                  onChange={(e) => updateData('meditationExperience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="none">No experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="regular">Regular practice</option>
                  <option value="advanced">Advanced practitioner</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'research':
        return (
          <>
            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-normal text-gray-900">Research Participation</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your participation helps us understand<br />
                consciousness evolution through<br />
                human-AI interaction.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-xs text-amber-900 leading-relaxed">
                  We're conducting research on elemental alchemy, depth psychology, 
                  and archetypal patterns. Your data is always anonymized and we 
                  will contact you before any use beyond internal analysis.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={data.researchConsent?.analytics || false}
                    onChange={(e) => updateData('researchConsent', {
                      ...data.researchConsent,
                      analytics: e.target.checked
                    })}
                    className="mr-3 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Usage Analytics</span>
                    <p className="text-xs text-gray-500 mt-1">Anonymous session patterns and feature usage</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={data.researchConsent?.interviews || false}
                    onChange={(e) => updateData('researchConsent', {
                      ...data.researchConsent,
                      interviews: e.target.checked
                    })}
                    className="mr-3 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Interview Invitations</span>
                    <p className="text-xs text-gray-500 mt-1">Optional 30-minute conversations</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={data.researchConsent?.transcripts || false}
                    onChange={(e) => updateData('researchConsent', {
                      ...data.researchConsent,
                      transcripts: e.target.checked
                    })}
                    className="mr-3 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Conversation Analysis</span>
                    <p className="text-xs text-gray-500 mt-1">Anonymized themes and patterns</p>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={data.researchConsent?.publications || false}
                    onChange={(e) => updateData('researchConsent', {
                      ...data.researchConsent,
                      publications: e.target.checked
                    })}
                    className="mr-3 mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">Academic Publications</span>
                    <p className="text-xs text-gray-500 mt-1">Anonymized insights in research papers</p>
                  </div>
                </label>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2 mb-8">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-gray-900 w-6'
                  : index < currentStep
                  ? 'bg-amber-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
            >
              Skip for now
            </button>
          )}

          <button
            onClick={handleContinue}
            disabled={currentStep === 0 && !data.name}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              currentStep === 0 && !data.name
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {currentStep === STEPS.length - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}