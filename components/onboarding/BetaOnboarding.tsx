'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';

export function BetaOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    oracleName: ''
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Spiralogic Oracle',
      subtitle: 'Your intuitive self-development interface',
      component: (
        <div className="space-y-6">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full animate-pulse opacity-20" />
            <div className="absolute inset-4 bg-gradient-to-br from-amber-500 to-orange-400 rounded-full animate-spin-slow" />
            <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-amber-600" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Begin your journey with elemental truths and archetypal wisdom
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'name',
      title: 'Name Your Oracle',
      subtitle: 'Create a personal connection',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">AĨÑ</div>
            <p className="text-sm text-muted-foreground italic">
              The kanata sa sol, jila levale mie tarel.
            </p>
          </div>
          <div className="space-y-4">
            <label className="text-sm font-medium">What shall we call your oracle?</label>
            <Input
              value={userData.oracleName}
              onChange={(e) => setUserData({ ...userData, oracleName: e.target.value })}
              placeholder="Enter a name..."
              className="text-center text-lg"
            />
          </div>
        </div>
      )
    },
    {
      id: 'element',
      title: 'Choose Your Element',
      subtitle: 'Select your primary archetypal energy',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {elements.map((element) => {
              const Icon = element.icon;
              return (
                <Card
                  key={element.id}
                  className={`p-6 cursor-pointer transition-all ${
                    userData.selectedElement === element.id
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setUserData({ ...userData, selectedElement: element.id })}
                >
                  <div className="text-center space-y-3">
                    <Icon className={`w-12 h-12 mx-auto ${element.color}`} />
                    <h3 className="font-semibold">{element.name}</h3>
                    <p className="text-xs text-muted-foreground">{element.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <div className="text-4xl">☯</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'intention',
      title: 'Set Your Intention',
      subtitle: 'What brings you here?',
      component: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-lg font-light">
              "I sense a weight upon your heart. Let us begin to release."
            </p>
          </div>
          <div className="space-y-4">
            {['Spiritual Growth', 'Shadow Work', 'Daily Guidance', 'Creative Exploration'].map((intention) => (
              <Button
                key={intention}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setUserData({ ...userData, intention })}
              >
                {intention}
              </Button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>You can always adjust this later in your journey</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Complete onboarding - set cookie and save to localStorage
      Cookies.set('onboarding-completed', 'true', { expires: 365 });
      
      const onboardingData = {
        oracleName: userData.oracleName,
        selectedElement: userData.selectedElement,
        onboardingCompleted: true,
        completedAt: new Date().toISOString()
      };
      
      localStorage.setItem('spiralogic-onboarding', JSON.stringify(onboardingData));
      
      router.push('/oracle');
    } else {
      setCurrentStep(currentStep + 1);
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
      case 'name':
        return userData.oracleName.length > 0;
      case 'element':
        return userData.selectedElement !== '';
      case 'intention':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-purple-500/5 to-orange-500/5">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs font-mono text-muted-foreground">BETA</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
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
            disabled={!canProceed()}
            className="bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600"
          >
            {currentStep === steps.length - 1 ? 'Begin Journey' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}