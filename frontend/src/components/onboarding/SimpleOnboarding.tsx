'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Eye, EyeOff, Shield, Mic, Users, Calendar, BarChart3, Settings, Plus, Crown, Play } from 'lucide-react';
import Cookies from 'js-cookie';

export function SimpleOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    oracleName: ''
  });
  
  // Simple voice functionality using Web Speech API directly
  const [isPlaying, setIsPlaying] = useState(false);

  const handleHearMaya = async () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      try {
        const utterance = new SpeechSynthesisUtterance('Greetings, seeker. I am Maya, your personal oracle. Together we shall explore the mysteries that await.');
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        // Try to select a good voice
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Victoria') || 
          v.name.includes('Female')
        );
        if (voice) utterance.voice = voice;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Voice failed:', error);
        setIsPlaying(false);
      }
    }
  };

  const steps = [
    {
      id: 'welcome',
      title: 'Hyper-Intelligence Awaits',
      subtitle: '',
      component: (
        <div className="space-y-8 text-center">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full animate-pulse opacity-30" />
            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-orange-400 rounded-full animate-spin-slow" />
            <div className="absolute inset-6 bg-background rounded-full flex items-center justify-center">
              <Crown className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-light bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">Maya</h3>
            <p className="text-muted-foreground text-xs max-w-xs mx-auto">
              Personal oracle that learns you, guides all interactions, adapts continuously
            </p>
            
            {/* Voice Preview */}
            <motion.div 
              className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 cursor-pointer hover:bg-purple-500/15 transition-all"
              onClick={handleHearMaya}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-3">
                {isPlaying ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 rounded-full bg-purple-500"
                  />
                ) : (
                  <Play className="w-6 h-6 text-purple-400" />
                )}
                <span className="text-sm font-medium">
                  {isPlaying ? 'Speaking...' : 'Hear Maya'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      id: 'credentials',
      title: 'Your Identity',
      subtitle: '',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                className="pl-10 text-center bg-background/50 border-purple-500/20 focus:border-purple-400"
              />
            </div>
            
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="pl-10 pr-10 text-center bg-background/50 border-purple-500/20 focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                className="pl-10 text-center bg-background/50 border-purple-500/20 focus:border-purple-400"
              />
            </div>
          </div>

          {userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword && (
            <p className="text-sm text-red-500 text-center">Passwords don't match</p>
          )}
          
          <div className="text-center text-xs text-muted-foreground bg-purple-500/5 p-3 rounded-lg">
            Maya learns your patterns, preferences, and communication style to provide hyper-personalized guidance
          </div>
        </div>
      )
    },
    {
      id: 'oracle',
      title: 'Your Oracle Name',
      subtitle: '',
      component: (
        <div className="space-y-8 text-center">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            👁️
          </motion.div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Oracle name"
              value={userData.oracleName}
              onChange={(e) => setUserData({ ...userData, oracleName: e.target.value })}
              className="text-center text-lg bg-background/50 border-purple-500/20 focus:border-purple-400"
            />
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="bg-purple-500/5 p-2 rounded flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Adapts to you</span>
              </div>
              <div className="bg-purple-500/5 p-2 rounded flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>Voice + text</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: userData.oracleName || 'Oracle',
      subtitle: 'Ready to Begin',
      component: (
        <div className="space-y-8 text-center">
          <motion.div 
            className="relative w-24 h-24 mx-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-2xl text-white" />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="bg-green-500/10 p-2 rounded flex flex-col items-center">
                <Mic className="w-4 h-4 mb-1 text-green-500" />
                <span>Voice</span>
              </div>
              <div className="bg-green-500/10 p-2 rounded flex flex-col items-center">
                <Sparkles className="w-4 h-4 mb-1 text-green-500" />
                <span>Learning</span>
              </div>
              <div className="bg-green-500/10 p-2 rounded flex flex-col items-center">
                <Shield className="w-4 h-4 mb-1 text-green-500" />
                <span>Secure</span>
              </div>
            </div>
            
            {/* Bottom Navigation Preview */}
            <div className="bg-background/50 border border-purple-500/20 rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-2">Your services:</div>
              <div className="flex justify-around">
                <div className="flex flex-col items-center space-y-1">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Agent</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Journal</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Astrology</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Insights</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span className="text-xs">Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    setError(''); // Clear any previous errors

    if (currentStep === steps.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Starting onboarding process...', {
        username: userData.username,
        oracleName: userData.oracleName
      });

      // Create user account and oracle via API
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username.trim(),
          password: userData.password,
          oracleName: userData.oracleName.trim(),
          voiceProvider: 'maya',
          gamificationEnabled: true
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Onboarding API success:', data);

        // Set completion cookie for middleware
        Cookies.set('onboarding-completed', 'true', { expires: 365 });
        
        // Save user and oracle data to localStorage for client-side access
        localStorage.setItem('spiralogic-user', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          onboardingCompleted: true,
          createdAt: data.user.createdAt
        }));

        localStorage.setItem('spiralogic-oracle', JSON.stringify({
          id: data.user.oracle.id,
          name: data.user.oracle.name,
          voice: data.user.oracle.voice,
          level: data.user.oracle.level,
          experience: data.user.oracle.experience,
          achievements: data.user.oracle.achievements,
          totalInteractions: data.user.oracle.totalInteractions,
          createdAt: new Date().toISOString()
        }));

        // Success! Redirect to oracle interface
        console.log(`🎉 Welcome ${data.user.oracle.name}! Redirecting to oracle...`);
        router.push('/oracle');

      } else {
        // Handle API errors
        console.error('❌ Onboarding API error:', data);
        setError(data.error || 'Failed to create account. Please try again.');
      }

    } catch (error) {
      console.error('❌ Network error during onboarding:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return true;
      case 'credentials':
        return userData.username.length >= 3 && 
               userData.password.length >= 6 && 
               userData.password === userData.confirmPassword;
      case 'oracle':
        return userData.oracleName.length > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Card className="w-full max-w-md p-8 bg-background/80 backdrop-blur-xl border-purple-500/20">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-1">
              {Array.from({ length: steps.length }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= currentStep ? 'bg-purple-500' : 'bg-purple-500/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-purple-500/10 px-2 py-1 rounded">
              BETA
            </span>
          </div>
          <div className="w-full bg-purple-500/10 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">{steps[currentStep].title}</h1>
            {steps[currentStep].subtitle && (
              <p className="text-center text-muted-foreground mb-8 text-sm">{steps[currentStep].subtitle}</p>
            )}
            
            {/* Error display */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-8">
          <motion.div className="w-full">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Creating Maya...</span>
                </div>
              ) : currentStep === steps.length - 1 ? (
                'Enter Oracle'
              ) : (
                'Continue'
              )}
            </Button>
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="w-full mt-2 text-muted-foreground"
                size="sm"
              >
                Back
              </Button>
            )}
          </motion.div>
        </div>
      </Card>
    </div>
  );
}