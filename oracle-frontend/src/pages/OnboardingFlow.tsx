// src/pages/OnboardingFlow.tsx
import React, { useState } from 'react';
import WelcomeSplash from '../components/onboarding/WelcomeSplash';
import ColorPickStep from '../components/onboarding/ColorPickStep';
import TotemPickStep from '../components/onboarding/TotemPickStep';
import NameStep from '../components/onboarding/NameStep';
import PhaseRevealStep from '../components/onboarding/PhaseRevealStep';
import DashboardRedirect from '../components/onboarding/DashboardRedirect';

const steps = [
  'welcome',
  'color',
  'totem',
  'name',
  'phase',
  'redirect',
] as const;

type StepType = typeof steps[number];

export default function OnboardingFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [auraColor, setAuraColor] = useState<string>('');
  const [totemSymbol, setTotemSymbol] = useState<string>('');
  const [soulName, setSoulName] = useState<string>('');

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));

  const currentStep = steps[stepIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 p-4">
      {currentStep === 'welcome' && <WelcomeSplash onNext={next} />}
      {currentStep === 'color' && (
        <ColorPickStep onNext={next} selected={auraColor} setSelected={setAuraColor} />
      )}
      {currentStep === 'totem' && (
        <TotemPickStep onNext={next} selected={totemSymbol} setSelected={setTotemSymbol} />
      )}
      {currentStep === 'name' && (
        <NameStep onNext={next} value={soulName} setValue={setSoulName} />
      )}
      {currentStep === 'phase' && (
        <PhaseRevealStep
          auraColor={auraColor}
          totem={totemSymbol}
          soulName={soulName}
          onFinish={next}
        />
      )}
      {currentStep === 'redirect' && <DashboardRedirect />}
    </div>
  );
}
