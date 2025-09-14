'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Lazy-load supabase client to avoid initialization issues
const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

interface IntakeData {
  name?: string;
  ageRange?: string;
  pronouns?: string;
  location?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  focusAreas?: string[];
  practices?: string[];
  meditation?: string;
  consent?: {
    analytics?: boolean;
    interviews?: boolean;
    transcripts?: boolean;
    publications?: boolean;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPart2 = searchParams.get('part') === '2';
  const [currentStep, setCurrentStep] = useState(0);
  const [intakeData, setIntakeData] = useState<IntakeData>({});
  const [existingData, setExistingData] = useState<any>(null);
  const totalSteps = isPart2 ? 4 : 6;

  useEffect(() => {
    if (isPart2) {
      loadExistingData();
    }
  }, [isPart2]);

  const loadExistingData = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: intake } = await supabase
          .from('beta_intake')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (intake) {
          setExistingData(intake);
          setIntakeData({ name: intake.name });
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const updateData = (field: keyof IntakeData, value: any) => {
    setIntakeData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const completeIntake = async () => {
    // Save to Supabase
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save main intake data
        await supabase.from('beta_intake').upsert({
          user_id: user.id,
          name: intakeData.name,
          age_range: intakeData.ageRange,
          pronouns: intakeData.pronouns,
          location_city: intakeData.location,
          birth_date: intakeData.birthDate,
          birth_time: intakeData.birthTime,
          birth_place_city: intakeData.birthPlace,
          focus_areas: intakeData.focusAreas,
          spiritual_practices: intakeData.practices,
          meditation_styles: intakeData.meditation ? [intakeData.meditation] : [],
          intake_part1_completed_at: new Date().toISOString()
        });

        // Save consent separately
        if (intakeData.consent) {
          await supabase.from('research_consent').upsert({
            user_id: user.id,
            analytics_consent: intakeData.consent.analytics,
            interview_consent: intakeData.consent.interviews,
            transcript_analysis_consent: intakeData.consent.transcripts,
            academic_publication_consent: intakeData.consent.publications,
            consent_given_at: new Date().toISOString()
          });
        }
      }

      // Show completion
      setCurrentStep(totalSteps);
    } catch (error) {
      console.error('Error saving intake:', error);
    }
  };

  const goToOracle = () => {
    router.push('/maia');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="text-5xl mb-6 animate-pulse">✦</div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">Welcome to the Oracle Beta</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Join us in exploring consciousness evolution<br />
              through AI-guided wisdom.<br /><br />
              Your privacy is sacred.<br />
              All data is encrypted and never shared.
            </p>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-[#c9b037] text-white rounded-full hover:bg-[#b39f2e] transition-all"
            >
              Begin Sacred Journey
            </button>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Onboarding</h1>
            <p className="text-sm text-gray-600 mb-8">
              To personalize your experience, I'd like to learn<br />
              a bit about you. Your answers are<br />
              encrypted and never shared.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Name or nickname</label>
                <input
                  type="text"
                  value={intakeData.name || ''}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                  placeholder="What should I call you?"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Age range</label>
                <select
                  value={intakeData.ageRange || ''}
                  onChange={(e) => updateData('ageRange', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
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
                  value={intakeData.pronouns || ''}
                  onChange={(e) => updateData('pronouns', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="she/they">she/they</option>
                  <option value="he/they">he/they</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={intakeData.location || ''}
                  onChange={(e) => updateData('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Cosmic Blueprint</h1>
            <p className="text-sm text-gray-600 mb-8">
              For astrological insights and archetypal wisdom.<br />
              This step is optional but adds depth.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date of birth</label>
                <input
                  type="date"
                  value={intakeData.birthDate || ''}
                  onChange={(e) => updateData('birthDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Time of birth (if known)</label>
                <input
                  type="time"
                  value={intakeData.birthTime || ''}
                  onChange={(e) => updateData('birthTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Place of birth</label>
                <input
                  type="text"
                  value={intakeData.birthPlace || ''}
                  onChange={(e) => updateData('birthPlace', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-normal text-gray-900 mb-2">What calls to your soul?</h1>
            <p className="text-sm text-gray-600 mb-8">
              Select all areas that resonate with you now.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'purpose', icon: '🧭', label: 'Life Purpose' },
                { id: 'relationships', icon: '💝', label: 'Relationships' },
                { id: 'creativity', icon: '✨', label: 'Creativity' },
                { id: 'spirituality', icon: '🌙', label: 'Spiritual Growth' },
                { id: 'career', icon: '🌍', label: 'Career Path' },
                { id: 'healing', icon: '☀️', label: 'Inner Healing' },
                { id: 'shadow', icon: '⛰️', label: 'Shadow Work' },
                { id: 'wisdom', icon: '📖', label: 'Ancient Wisdom' }
              ].map(area => {
                const isSelected = intakeData.focusAreas?.includes(area.id);
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      const current = intakeData.focusAreas || [];
                      if (isSelected) {
                        updateData('focusAreas', current.filter(id => id !== area.id));
                      } else {
                        updateData('focusAreas', [...current, area.id]);
                      }
                    }}
                    className={`p-4 border rounded-xl text-center transition-all ${
                      isSelected
                        ? 'border-[#c9b037] bg-[#c9b037]/10 border-2'
                        : 'border-gray-200 hover:border-[#c9b037]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{area.icon}</div>
                    <div className="text-sm text-gray-700">{area.label}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Your Spiritual Journey</h1>
            <p className="text-sm text-gray-600 mb-8">
              Understanding your practices helps shape guidance.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-3">Current practices</label>
                <div className="space-y-2">
                  {[
                    'Meditation',
                    'Yoga',
                    'Prayer',
                    'Breathwork',
                    'Dreamwork',
                    'Ritual/Ceremony'
                  ].map(practice => {
                    const isChecked = intakeData.practices?.includes(practice);
                    return (
                      <label key={practice} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = intakeData.practices || [];
                            if (e.target.checked) {
                              updateData('practices', [...current, practice]);
                            } else {
                              updateData('practices', current.filter(p => p !== practice));
                            }
                          }}
                          className="mr-3 w-4 h-4 text-[#c9b037] rounded border-gray-300 focus:ring-[#c9b037]"
                        />
                        <span className="text-sm text-gray-700">{practice}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Meditation experience</label>
                <select
                  value={intakeData.meditation || ''}
                  onChange={(e) => updateData('meditation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b037] focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="none">No experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="regular">Regular practice</option>
                  <option value="advanced">Advanced practitioner</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Research Participation</h1>
            <p className="text-sm text-gray-600 mb-6">
              Help us understand consciousness evolution.
            </p>

            <div className="bg-[#c9b037]/10 border border-[#c9b037]/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-700 leading-relaxed">
                We're conducting heuristic research on elemental alchemy, 
                depth psychology, and archetypal patterns. Your data is 
                always anonymized and we'll contact you before any use 
                beyond internal analysis.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'analytics', title: 'Usage Analytics', desc: 'Anonymous session patterns and feature usage' },
                { id: 'interviews', title: 'Interview Invitations', desc: 'Optional 30-minute conversations' },
                { id: 'transcripts', title: 'Conversation Analysis', desc: 'Anonymized themes and patterns' },
                { id: 'publications', title: 'Academic Publications', desc: 'Anonymized insights in research papers' }
              ].map(item => {
                const isChecked = intakeData.consent?.[item.id as keyof typeof intakeData.consent];
                return (
                  <label key={item.id} className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked || false}
                      onChange={(e) => {
                        updateData('consent', {
                          ...intakeData.consent,
                          [item.id]: e.target.checked
                        });
                      }}
                      className="mr-3 mt-1 w-4 h-4 text-[#c9b037] rounded border-gray-300 focus:ring-[#c9b037]"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-5xl mb-6">🌸</div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">
              Welcome, {intakeData.name || 'friend'}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Your sacred journey begins now.<br /><br />
              Maia is ready to hold space for you.
            </p>
            <button
              onClick={goToOracle}
              className="px-8 py-3 bg-[#c9b037] text-white rounded-full hover:bg-[#b39f2e] transition-all"
            >
              Enter the Oracle
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Indicator */}
        {currentStep < 6 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`h-2 transition-all rounded-full ${
                  index === currentStep
                    ? 'bg-gray-900 w-6'
                    : index < currentStep
                    ? 'bg-[#c9b037] w-2'
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="flex justify-between items-center mt-8">
            {currentStep === 1 ? (
              <button
                onClick={skipStep}
                className="text-sm text-[#c9b037] hover:opacity-70 transition-opacity"
              >
                Skip for now
              </button>
            ) : (
              <button
                onClick={prevStep}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back
              </button>
            )}

            {currentStep === 5 ? (
              <button
                onClick={completeIntake}
                className="px-6 py-2 bg-[#c9b037] text-white rounded-full hover:bg-[#b39f2e] transition-all"
              >
                Complete Sacred Intake
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !intakeData.name}
                className={`px-6 py-2 rounded-full transition-all ${
                  currentStep === 1 && !intakeData.name
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#c9b037] text-white hover:bg-[#b39f2e]'
                }`}
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}