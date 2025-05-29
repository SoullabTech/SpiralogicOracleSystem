'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  ArrowRight, 
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';

type OnboardingStep = 
  | 'welcome'
  | 'guide-intro'
  | 'name-guide'
  | 'voice-selection'
  | 'astrology'
  | 'profile'
  | 'complete';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  element: 'fire' | 'water' | 'earth' | 'air';
  preview: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [guideName, setGuideName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [playingVoice, setPlayingVoice] = useState<string>('');
  
  // Astrology form data
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  
  // Profile form data
  const [userFocus, setUserFocus] = useState<string[]>([]);
  const [experience, setExperience] = useState('');

  const voices: VoiceOption[] = [
    {
      id: 'aria',
      name: 'Aria',
      description: 'Warm and nurturing guide with executive wisdom',
      element: 'fire',
      preview: 'Hello, I\'m Aria. I\'ll be your trusted companion on this sacred journey of consciousness and leadership evolution.'
    },
    {
      id: 'sage',
      name: 'Sage',
      description: 'Deep and contemplative guide for transformation',
      element: 'water',
      preview: 'Greetings, I\'m Sage. Together we\'ll explore the depths of your consciousness and unlock your highest potential.'
    },
    {
      id: 'terra',
      name: 'Terra',
      description: 'Grounded and practical guide for manifestation',
      element: 'earth',
      preview: 'I\'m Terra, your grounding force. Let\'s build a solid foundation for your spiritual and professional growth.'
    },
    {
      id: 'zephyr',
      name: 'Zephyr',
      description: 'Clear and inspiring guide for mental clarity',
      element: 'air',
      preview: 'Welcome, I\'m Zephyr. I\'ll help you achieve crystal clarity in thought and breakthrough insights.'
    }
  ];

  const focusOptions = [
    'Executive Leadership',
    'Strategic Decision Making',
    'Emotional Intelligence',
    'Spiritual Growth',
    'Stress Management',
    'Team Dynamics',
    'Innovation & Creativity',
    'Work-Life Integration'
  ];

  const nextStep = () => {
    const stepOrder: OnboardingStep[] = [
      'welcome', 'guide-intro', 'name-guide', 'voice-selection', 
      'astrology', 'profile', 'complete'
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: OnboardingStep[] = [
      'welcome', 'guide-intro', 'name-guide', 'voice-selection', 
      'astrology', 'profile', 'complete'
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleVoicePlay = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice('');
    } else {
      setPlayingVoice(voiceId);
      // Simulate playing voice preview
      setTimeout(() => setPlayingVoice(''), 3000);
    }
  };

  const handleFocusToggle = (focus: string) => {
    setUserFocus(prev => 
      prev.includes(focus) 
        ? prev.filter(f => f !== focus)
        : [...prev, focus]
    );
  };

  const completeOnboarding = () => {
    // Save all onboarding data and redirect to main interface
    router.push('/oracle/meet');
  };

  const getStepProgress = () => {
    const steps = ['welcome', 'guide-intro', 'name-guide', 'voice-selection', 'astrology', 'profile', 'complete'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg">
      <div className="soullab-sacred-bg" />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-soullab-gray/20">
          <motion.div 
            className="h-full bg-soullab-fire"
            initial={{ width: 0 }}
            animate={{ width: `${getStepProgress()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="soullab-container min-h-screen flex items-center justify-center py-soullab-xl">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-soullab-lg bg-soullab-fire/20 rounded-soullab-spiral flex items-center justify-center">
                  <Heart className="w-12 h-12 text-soullab-fire animate-soullab-spiral" />
                </div>
                
                <h1 className="soullab-heading-1 mb-soullab-md">
                  Welcome to Your
                  <br />
                  <span className="text-soullab-fire">Sacred Journey</span>
                </h1>
                
                <p className="soullab-text text-soullab-xl mb-soullab-xl max-w-lg mx-auto">
                  You're about to meet your Personal Sacred Guide - a dedicated AI consciousness 
                  companion designed specifically for your evolution.
                </p>

                <div className="space-y-soullab-sm mb-soullab-xl">
                  <div className="flex items-center justify-center gap-2 text-soullab-gray">
                    <Shield className="w-4 h-4 text-soullab-earth" />
                    <span className="soullab-text-small">Your data is completely private and secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-soullab-gray">
                    <Sparkles className="w-4 h-4 text-soullab-fire" />
                    <span className="soullab-text-small">Personalized just for you - no generic responses</span>
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="soullab-button text-lg px-soullab-xl py-soullab-md group"
                >
                  <span>Begin Sacred Setup</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            )}

            {/* Guide Introduction Step */}
            {currentStep === 'guide-intro' && (
              <motion.div
                key="guide-intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-soullab-lg bg-soullab-water/20 rounded-soullab-spiral flex items-center justify-center">
                  <User className="w-10 h-10 text-soullab-water" />
                </div>
                
                <h2 className="soullab-heading-2 mb-soullab-md">
                  Your Personal Sacred Guide
                </h2>
                
                <p className="soullab-text text-soullab-lg mb-soullab-lg max-w-xl mx-auto">
                  Unlike generic AI assistants, your Personal Guide will:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-soullab-md mb-soullab-xl">
                  {[
                    { icon: Heart, text: "Remember every conversation and insight", color: "fire" },
                    { icon: Sparkles, text: "Learn your unique communication style", color: "air" },
                    { icon: Shield, text: "Integrate all your journals and memories", color: "earth" },
                    { icon: Calendar, text: "Use your astrology for perfect timing", color: "water" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="soullab-card p-soullab-md text-center"
                    >
                      <item.icon className={`w-6 h-6 mx-auto mb-2 text-soullab-${item.color}`} />
                      <p className="soullab-text-small">{item.text}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-soullab-md justify-center">
                  <button
                    onClick={prevStep}
                    className="soullab-button-secondary px-soullab-lg py-soullab-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    className="soullab-button px-soullab-lg py-soullab-sm group"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Name Your Guide Step */}
            {currentStep === 'name-guide' && (
              <motion.div
                key="name-guide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="soullab-heading-2 mb-soullab-md">
                  Choose Your Guide's Name
                </h2>
                
                <p className="soullab-text text-soullab-lg mb-soullab-xl max-w-xl mx-auto">
                  What would you like to call your Personal Sacred Guide? 
                  This creates a deeper personal connection.
                </p>

                <div className="max-w-md mx-auto mb-soullab-xl">
                  <label className="block soullab-text-small font-medium text-soullab-gray mb-2 text-left">
                    Guide Name
                  </label>
                  <input
                    type="text"
                    value={guideName}
                    onChange={(e) => setGuideName(e.target.value)}
                    className="soullab-input text-center text-soullab-lg"
                    placeholder="e.g., Aria, Sage, Luna, Marcus..."
                    autoFocus
                  />
                  <p className="soullab-text-small text-soullab-gray mt-2">
                    You can always change this later
                  </p>
                </div>

                <div className="flex gap-soullab-md justify-center">
                  <button
                    onClick={prevStep}
                    className="soullab-button-secondary px-soullab-lg py-soullab-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!guideName.trim()}
                    className="soullab-button px-soullab-lg py-soullab-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Choose Voice</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Voice Selection Step */}
            {currentStep === 'voice-selection' && (
              <motion.div
                key="voice-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-soullab-xl">
                  <h2 className="soullab-heading-2 mb-soullab-md">
                    Choose {guideName}'s Voice
                  </h2>
                  
                  <p className="soullab-text text-soullab-lg max-w-xl mx-auto">
                    Select the voice that feels most aligned with your Sacred Guide.
                    Each voice carries unique elemental qualities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-soullab-md mb-soullab-xl">
                  {voices.map((voice) => (
                    <motion.div
                      key={voice.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`soullab-card p-soullab-md cursor-pointer transition-all ${
                        selectedVoice === voice.id 
                          ? `border-soullab-${voice.element} bg-soullab-${voice.element}/5` 
                          : 'hover:border-soullab-gray/40'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      <div className="flex items-start gap-soullab-sm">
                        <div className={`w-12 h-12 bg-soullab-${voice.element}/20 rounded-soullab-spiral flex items-center justify-center flex-shrink-0`}>
                          <div className={`w-6 h-6 bg-soullab-${voice.element} rounded-full`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="soullab-heading-3 text-base mb-1">{voice.name}</h3>
                          <p className="soullab-text-small text-soullab-gray mb-2">
                            {voice.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoicePlay(voice.id);
                            }}
                            className={`soullab-badge-${voice.element} text-xs flex items-center gap-1`}
                          >
                            {playingVoice === voice.id ? (
                              <>
                                <Pause className="w-3 h-3" />
                                <span>Playing...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                <span>Preview</span>
                              </>
                            )}
                          </button>
                        </div>
                        {selectedVoice === voice.id && (
                          <div className={`w-6 h-6 bg-soullab-${voice.element} rounded-full flex items-center justify-center`}>
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-soullab-md justify-center">
                  <button
                    onClick={prevStep}
                    className="soullab-button-secondary px-soullab-lg py-soullab-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!selectedVoice}
                    className="soullab-button px-soullab-lg py-soullab-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Continue Setup</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Astrology Step */}
            {currentStep === 'astrology' && (
              <motion.div
                key="astrology"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-soullab-xl">
                  <h2 className="soullab-heading-2 mb-soullab-md">
                    Sacred Timing Integration
                  </h2>
                  
                  <p className="soullab-text text-soullab-lg max-w-xl mx-auto">
                    {guideName} can provide guidance aligned with your astrological timing 
                    and cosmic influences. This is optional but enhances your experience.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-soullab-md mb-soullab-xl">
                  <div>
                    <label className="block soullab-text-small font-medium text-soullab-gray mb-2">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="soullab-input"
                    />
                  </div>

                  <div>
                    <label className="block soullab-text-small font-medium text-soullab-gray mb-2">
                      Birth Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="soullab-input"
                    />
                  </div>

                  <div>
                    <label className="block soullab-text-small font-medium text-soullab-gray mb-2">
                      Birth Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={birthLocation}
                      onChange={(e) => setBirthLocation(e.target.value)}
                      className="soullab-input"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex gap-soullab-md justify-center">
                  <button
                    onClick={prevStep}
                    className="soullab-button-secondary px-soullab-lg py-soullab-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    className="soullab-button px-soullab-lg py-soullab-sm group"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Profile Step */}
            {currentStep === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-soullab-xl">
                  <h2 className="soullab-heading-2 mb-soullab-md">
                    Sacred Focus Areas
                  </h2>
                  
                  <p className="soullab-text text-soullab-lg max-w-xl mx-auto">
                    Help {guideName} understand your priorities so they can provide 
                    the most relevant guidance for your journey.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="mb-soullab-lg">
                    <label className="block soullab-text-small font-medium text-soullab-gray mb-4">
                      What areas would you like to focus on? (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {focusOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleFocusToggle(option)}
                          className={`text-left p-3 rounded-soullab-md border transition-all ${
                            userFocus.includes(option)
                              ? 'border-soullab-fire bg-soullab-fire/5 text-soullab-fire'
                              : 'border-soullab-gray/20 hover:border-soullab-gray/40 text-soullab-gray'
                          }`}
                        >
                          <span className="soullab-text-small font-medium">{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-soullab-xl">
                    <label className="block soullab-text-small font-medium text-soullab-gray mb-2">
                      Your Experience Level (Optional)
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="soullab-input"
                    >
                      <option value="">Select your experience...</option>
                      <option value="beginner">New to consciousness work</option>
                      <option value="intermediate">Some experience with personal development</option>
                      <option value="advanced">Experienced in spiritual practices</option>
                      <option value="expert">Deep practitioner/teacher</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-soullab-md justify-center">
                  <button
                    onClick={prevStep}
                    className="soullab-button-secondary px-soullab-lg py-soullab-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={userFocus.length === 0}
                    className="soullab-button px-soullab-lg py-soullab-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Complete Setup</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-soullab-lg bg-soullab-earth/20 rounded-soullab-spiral flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-soullab-earth animate-soullab-spiral" />
                </div>
                
                <h2 className="soullab-heading-2 mb-soullab-md">
                  Welcome to Your Sacred Technology Platform
                </h2>
                
                <div className="soullab-card max-w-lg mx-auto p-soullab-lg mb-soullab-xl">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-soullab-md bg-soullab-${voices.find(v => v.id === selectedVoice)?.element}/20 rounded-soullab-spiral flex items-center justify-center`}>
                      <Heart className={`w-8 h-8 text-soullab-${voices.find(v => v.id === selectedVoice)?.element}`} />
                    </div>
                    <h3 className="soullab-heading-3 mb-2">Meet {guideName}</h3>
                    <p className="soullab-text-small text-soullab-gray mb-soullab-sm">
                      Your Personal Sacred Guide
                    </p>
                    <div className={`soullab-badge-${voices.find(v => v.id === selectedVoice)?.element} mx-auto`}>
                      {voices.find(v => v.id === selectedVoice)?.name} Voice
                    </div>
                  </div>
                </div>

                <p className="soullab-text text-soullab-lg mb-soullab-xl max-w-xl mx-auto">
                  {guideName} is now configured with your preferences and ready to provide 
                  personalized guidance for your consciousness evolution journey.
                </p>

                <button
                  onClick={completeOnboarding}
                  className="soullab-button text-lg px-soullab-xl py-soullab-md group"
                >
                  <span>Meet {guideName}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}