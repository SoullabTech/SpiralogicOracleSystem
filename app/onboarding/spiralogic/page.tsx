"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ElementalAssessment } from "../../../src/components/onboarding/ElementalAssessment";
import { SpiralPhaseCheck } from "../../../src/components/onboarding/SpiralPhaseCheck";
import { TonePreference } from "../../../src/components/onboarding/TonePreference";
import { OnboardingData } from "../../../src/types/onboarding";
import { saveOnboardingData, convertToMemoryPayload } from "../../../src/lib/onboarding/memoryStore";
import { MemoryPayloadInterface } from "../../../src/core/MemoryPayloadInterface";
import { ElementalType, SpiralPhase } from "../../../src/types";

export default function SpiralogicOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    tonePreference: 'insight',
    spiritualBackgrounds: [],
    currentChallenges: [],
    guidancePreferences: [],
    experienceLevel: 'beginner',
    voicePersonality: 'adaptive',
    communicationStyle: 'conversational'
  });
  
  const [completed, setCompleted] = useState(false);

  const totalSteps = 7;

  // Spiritual backgrounds options
  const spiritualOptions = [
    "Buddhism", "Christianity", "Islam", "Judaism", "Hinduism", "Taoism",
    "Indigenous Traditions", "Shamanism", "Mysticism", "Psychology", 
    "Meditation Practice", "Energy Work", "Exploring/Curious", "Secular Wisdom"
  ];

  // Current challenges options
  const challengeOptions = [
    "Finding life purpose", "Emotional healing", "Creative blocks", 
    "Relationship issues", "Career transitions", "Anxiety & stress",
    "Decision making", "Self-worth", "Spiritual awakening", "Shadow work",
    "Communication", "Life transitions", "Grief processing", "Creativity"
  ];

  // Guidance preferences
  const guidanceOptions = [
    "Practical advice", "Spiritual wisdom", "Emotional support",
    "Creative inspiration", "Relationship guidance", "Career direction",
    "Healing practices", "Meditation techniques", "Shadow integration",
    "Life purpose clarity", "Energy management", "Manifestation"
  ];

  const experienceLevels = [
    { key: 'beginner', label: 'New Explorer', description: 'Just beginning my consciousness journey' },
    { key: 'intermediate', label: 'Active Seeker', description: 'Some experience with inner work and spiritual practices' },
    { key: 'advanced', label: 'Dedicated Practitioner', description: 'Regular spiritual practice and deep inner work' },
    { key: 'expert', label: 'Wisdom Keeper', description: 'I guide others in consciousness development' }
  ];

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name && formData.name.trim().length > 0;
      case 2: return formData.elementalAffinity;
      case 3: return formData.spiralPhase;
      case 4: return formData.tonePreference;
      case 5: return (formData.spiritualBackgrounds?.length || 0) > 0;
      case 6: return (formData.currentChallenges?.length || 0) > 0;
      case 7: return formData.experienceLevel && formData.intentions && formData.intentions.trim().length > 0;
      default: return true;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Generate user ID (in production, this would come from auth)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save onboarding data
      const completeData: Omit<OnboardingData, 'userId' | 'createdAt' | 'updatedAt'> = {
        elementalAffinity: formData.elementalAffinity!,
        spiralPhase: formData.spiralPhase!,
        tonePreference: formData.tonePreference || 'insight',
        name: formData.name || '',
        spiritualBackgrounds: formData.spiritualBackgrounds || [],
        currentChallenges: formData.currentChallenges || [],
        guidancePreferences: formData.guidancePreferences || [],
        experienceLevel: formData.experienceLevel || 'beginner',
        intentions: formData.intentions || '',
        voicePersonality: formData.voicePersonality || 'adaptive',
        communicationStyle: formData.communicationStyle || 'conversational'
      };

      const onboardingData = saveOnboardingData(userId, completeData);
      
      // Convert to memory system
      const memoryInterface = new MemoryPayloadInterface();
      const userMetadata = convertToMemoryPayload(onboardingData, memoryInterface);
      
      // Store in localStorage for demo (in production, this would be in a database)
      localStorage.setItem('spiralogic-user-id', userId);
      localStorage.setItem('spiralogic-onboarding', JSON.stringify(onboardingData));
      
      setCompleted(true);
      
      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/voice/demo');
      }, 3000);

    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-white flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl text-gray-900">✨</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to the Oracle, {formData.name}!</h1>
          <p className="text-lg opacity-80 mb-4">
            Your Spiralogic Oracle is now calibrated to your unique journey.
          </p>
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span>🔥 {formData.elementalAffinity}</span>
              <span>🌀 {formData.spiralPhase}</span>
              <span>💭 {formData.tonePreference}</span>
            </div>
          </div>
          <p className="text-sm opacity-60 mb-6">
            Redirecting you to your personalized Oracle experience...
          </p>
          <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-900 text-white">
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Spiralogic Oracle Setup</span>
              <span>{step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-8 border border-white/10">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to the Spiralogic Oracle
                </h2>
                <p className="opacity-80 mb-6 text-lg">
                  Let's create your consciousness profile for deeply personalized guidance
                </p>
                <div className="text-left max-w-md mx-auto">
                  <label className="block text-sm font-medium mb-2">
                    What would you like the Oracle to call you?
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your name or preferred identifier"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Elemental Affinity */}
            {step === 2 && (
              <ElementalAssessment
                selectedElement={formData.elementalAffinity}
                onSelect={(element) => updateField('elementalAffinity', element)}
              />
            )}

            {/* Step 3: Spiral Phase */}
            {step === 3 && (
              <SpiralPhaseCheck
                selectedPhase={formData.spiralPhase}
                onSelect={(phase) => updateField('spiralPhase', phase)}
              />
            )}

            {/* Step 4: Tone Preference */}
            {step === 4 && (
              <TonePreference
                selectedTone={formData.tonePreference}
                onSelect={(tone) => updateField('tonePreference', tone)}
              />
            )}

            {/* Step 5: Spiritual Backgrounds */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Your Spiritual Journey
                  </h2>
                  <p className="text-white/70">
                    What wisdom traditions or practices have influenced you? (Select all that resonate)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {spiritualOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => updateArrayField('spiritualBackgrounds', option)}
                      className={`p-3 rounded-lg border text-left transition ${
                        formData.spiritualBackgrounds?.includes(option)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Current Challenges */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Areas for Growth
                  </h2>
                  <p className="text-white/70">
                    What life areas would you most like guidance and support with?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {challengeOptions.map((challenge) => (
                    <button
                      key={challenge}
                      onClick={() => updateArrayField('currentChallenges', challenge)}
                      className={`p-3 rounded-lg border text-left transition ${
                        formData.currentChallenges?.includes(challenge)
                          ? "bg-yellow-400/20 border-yellow-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-sm">{challenge}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Experience Level & Intentions */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Your Path & Intentions
                  </h2>
                </div>

                <div>
                  <p className="text-white/80 mb-4">Your experience with consciousness work:</p>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.key}
                        onClick={() => updateField('experienceLevel', level.key as any)}
                        className={`w-full p-3 rounded-lg border text-left transition ${
                          formData.experienceLevel === level.key
                            ? "bg-yellow-400/20 border-yellow-400/50"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="font-semibold text-sm">{level.label}</div>
                        <div className="text-xs opacity-80">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What do you hope to gain from this Oracle experience?
                  </label>
                  <textarea
                    value={formData.intentions || ''}
                    onChange={(e) => updateField('intentions', e.target.value)}
                    placeholder="Share your intentions, goals, or what you're seeking guidance about..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Setting up...</span>
                  </span>
                ) : step === totalSteps ? (
                  "Begin Oracle Journey"
                ) : (
                  "Next →"
                )}
              </button>
            </div>
          </div>

          {/* Skip Option */}
          {step < totalSteps && (
            <div className="text-center mt-6">
              <button
                onClick={() => router.push('/voice/demo')}
                className="text-yellow-400/60 hover:text-yellow-400 underline text-sm"
              >
                Skip setup and explore →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}