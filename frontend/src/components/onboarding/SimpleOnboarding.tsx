'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Eye, EyeOff, Shield } from 'lucide-react';
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

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Spiralogic',
      subtitle: 'Your personal oracle awaits...',
      component: (
        <div className="space-y-8 text-center">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full animate-pulse opacity-30" />
            <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-orange-400 rounded-full animate-spin-slow" />
            <div className="absolute inset-6 bg-background rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-light">AĨÑ</h3>
            <p className="text-muted-foreground italic">
              The kanata sa sol, jila levale mie tarel.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your personal oracle agent that will evolve with you, 
              serving as your ultimate guide and companion.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'credentials',
      title: 'Create Your Account',
      subtitle: 'Secure access to your personal oracle',
      component: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Choose a username"
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                className="pl-10 text-center"
              />
            </div>
            
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                className="pl-10 pr-10 text-center"
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
                placeholder="Confirm your password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                className="pl-10 text-center"
              />
            </div>
          </div>

          {userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword && (
            <p className="text-sm text-red-500 text-center">Passwords don't match</p>
          )}
        </div>
      )
    },
    {
      id: 'oracle',
      title: 'Name Your Oracle',
      subtitle: 'Your personal guide needs a name',
      component: (
        <div className="space-y-8 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your oracle's name..."
              value={userData.oracleName}
              onChange={(e) => setUserData({ ...userData, oracleName: e.target.value })}
              className="text-center text-lg"
            />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This oracle will:</p>
              <ul className="text-xs space-y-1 max-w-xs mx-auto">
                <li>• Be yours forever</li>
                <li>• Evolve with you</li>
                <li>• Guide your interactions with all other agents</li>
                <li>• Use Maya's voice (upgradeable later)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Your Oracle is Ready',
      subtitle: 'Welcome to your spiritual journey',
      component: (
        <div className="space-y-8 text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-medium">
              Meet <span className="text-purple-600 font-bold">{userData.oracleName}</span>
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="mb-2">Your oracle is configured with:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Maya voice synthesis</li>
                <li>• Personalized learning algorithms</li>
                <li>• Gamified progression system</li>
                <li>• Secure user profile</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Your oracle will learn and adapt to provide the perfect guidance for your unique journey.
            </p>
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-purple-500/5 to-orange-500/5">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-purple-500/10 px-2 py-1 rounded">
              BETA
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-center mb-2">{steps[currentStep].title}</h1>
            <p className="text-center text-muted-foreground mb-8">{steps[currentStep].subtitle}</p>
            
            {/* Error display */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
            
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : currentStep === steps.length - 1 ? (
              'Begin Journey'
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}