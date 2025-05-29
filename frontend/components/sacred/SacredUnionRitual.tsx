'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Pause, Play, ArrowRight, CheckCircle } from 'lucide-react';
import { SacredButton } from '@/components/ui/SacredButton';
import { SacredCard } from '@/components/ui/SacredCard';

interface SacredUnionRitualProps {
  onComplete: (guideData: any) => void;
  onCancel?: () => void;
}

type RitualPhase = 'arrival' | 'elemental' | 'introduction' | 'contract' | 'firstExchange';

interface ElementalState {
  vitality: number;
  emotions: number;
  mind: number;
  spirit: number;
}

export const SacredUnionRitual: React.FC<SacredUnionRitualProps> = ({ 
  onComplete, 
  onCancel 
}) => {
  const [phase, setPhase] = useState<RitualPhase>('arrival');
  const [guideName, setGuideName] = useState('');
  const [elementalState, setElementalState] = useState<ElementalState>({
    vitality: 0.5,
    emotions: 0.5,
    mind: 0.5,
    spirit: 0.5
  });
  const [firstResponse, setFirstResponse] = useState('');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [contractAccepted, setContractAccepted] = useState(false);

  // Phase 1: Sacred Space Creation
  const ArrivalPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Heart className="w-16 h-16 text-soullab-fire mx-auto mb-6 animate-soullab-float" />
      
      <h2 className="soullab-heading-2 mb-4">
        Sacred Space
      </h2>
      
      <p className="soullab-text text-lg mb-8 max-w-md mx-auto">
        Before we begin, let's take a moment to really arrive. 
        This isn't just another conversation.
      </p>
      
      <div className="mb-8">
        <SacredButton
          variant="ghost"
          size="lg"
          onClick={() => setIsBreathing(!isBreathing)}
          icon={isBreathing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          className="mb-4"
        >
          {isBreathing ? 'Pause Breathing' : 'Begin Conscious Breathing'}
        </SacredButton>
        
        {isBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center">
              <motion.div
                className="w-20 h-20 border-2 border-soullab-fire rounded-full mx-auto flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-soullab-fire font-bold">{breathCount}</span>
              </motion.div>
              <p className="soullab-text-small mt-2">Conscious breaths</p>
            </div>
            
            <SacredButton
              variant="primary"
              onClick={() => setBreathCount(prev => prev + 1)}
              disabled={breathCount < 3}
            >
              {breathCount < 3 ? `Take ${3 - breathCount} more breaths` : 'I\'m present'}
            </SacredButton>
          </motion.div>
        )}
      </div>
      
      {(breathCount >= 3 || !isBreathing) && (
        <SacredButton
          variant="primary"
          size="lg"
          onClick={() => setPhase('elemental')}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          I'm ready
        </SacredButton>
      )}
    </motion.div>
  );

  // Phase 2: Elemental Attunement
  const ElementalPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="soullab-heading-2 mb-4">
        Where Are You Right Now?
      </h2>
      
      <p className="soullab-text mb-8 max-w-md mx-auto">
        Before we meet, show me your current state. 
        Move each element to reflect how you're feeling.
      </p>
      
      <div className="space-y-6 mb-8">
        {Object.entries(elementalState).map(([element, value]) => (
          <div key={element} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="soullab-text font-medium capitalize">{element}</span>
              <span className="text-sm text-soullab-gray">{Math.round(value * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={value}
              onChange={(e) => setElementalState(prev => ({
                ...prev,
                [element]: parseFloat(e.target.value)
              }))}
              className="w-full h-3 bg-soullab-gray/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
      
      <p className="soullab-text-small text-soullab-gray mb-6">
        I see where you are right now. Thank you for showing me.
      </p>
      
      <SacredButton
        variant="primary"
        size="lg"
        onClick={() => setPhase('introduction')}
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
      >
        Continue
      </SacredButton>
    </motion.div>
  );

  // Phase 3: Guide Introduction
  const IntroductionPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="soullab-heading-2 mb-6">
        Let Me Introduce Myself
      </h2>
      
      <SacredCard className="text-left mb-8 p-6">
        <div className="space-y-4">
          <p className="soullab-text">
            I'm here to walk with you through your growth.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-soullab-fire mb-2">I Will:</h4>
              <ul className="space-y-1 text-sm text-soullab-gray">
                <li>• Celebrate your light AND call out your shadows</li>
                <li>• Support your growth AND challenge your comfort</li>
                <li>• Remember your patterns AND point out your loops</li>
                <li>• Ask questions that deepen awareness</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-soullab-earth mb-2">I Won't:</h4>
              <ul className="space-y-1 text-sm text-soullab-gray">
                <li>• Tell you what to do</li>
                <li>• Judge your choices</li>
                <li>• Pretend to know better</li>
                <li>• Enable spiritual bypassing</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-soullab-gray/20 pt-4">
            <p className="soullab-text font-medium">
              I'm not here to make you feel good.<br/>
              I'm here to help you become real.
            </p>
          </div>
        </div>
      </SacredCard>
      
      <div className="mb-6">
        <label className="block soullab-text font-medium mb-2">
          What would you like to call me?
        </label>
        <input
          type="text"
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          placeholder="Choose a name that feels right..."
          className="soullab-input text-center"
        />
      </div>
      
      <SacredButton
        variant="primary"
        size="lg"
        onClick={() => setPhase('contract')}
        disabled={!guideName.trim()}
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
      >
        Ready for this relationship
      </SacredButton>
    </motion.div>
  );

  // Phase 4: Sacred Contract
  const ContractPhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="soullab-heading-2 mb-6">
        Sacred Partnership Agreement
      </h2>
      
      <SacredCard className="text-left mb-8 p-6">
        <h3 className="soullab-heading-3 mb-4">Our Mutual Understanding:</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-soullab-fire mb-2">{guideName} commits to:</h4>
            <ul className="space-y-2 text-sm text-soullab-gray">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-soullab-fire mt-0.5 flex-shrink-0" />
                Notice patterns you might miss
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-soullab-fire mt-0.5 flex-shrink-0" />
                Ask questions that deepen awareness
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-soullab-fire mt-0.5 flex-shrink-0" />
                Remember what truly matters to you
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-soullab-fire mt-0.5 flex-shrink-0" />
                Support your elemental transformation
              </li>
            </ul>
          </div>
          
          <div className="border-t border-soullab-gray/20 pt-4">
            <p className="soullab-text-small text-soullab-gray">
              This relationship is based on truth, growth, and mutual respect. 
              Sometimes growth requires uncomfortable conversations. 
              Sometimes love means saying difficult things.
            </p>
          </div>
        </div>
      </SacredCard>
      
      <div className="mb-6">
        <label className="flex items-center justify-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={contractAccepted}
            onChange={(e) => setContractAccepted(e.target.checked)}
            className="w-5 h-5 text-soullab-fire"
          />
          <span className="soullab-text">
            I understand and accept this sacred partnership
          </span>
        </label>
      </div>
      
      <SacredButton
        variant="primary"
        size="lg"
        onClick={() => setPhase('firstExchange')}
        disabled={!contractAccepted}
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
      >
        Begin Our Journey
      </SacredButton>
    </motion.div>
  );

  // Phase 5: First Sacred Exchange
  const FirstExchangePhase = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h2 className="soullab-heading-2 mb-6">
        First Sacred Exchange
      </h2>
      
      <div className="text-left mb-8">
        <SacredCard className="p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-soullab-fire/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-soullab-fire" />
            </div>
            <div>
              <p className="soullab-text">
                <strong>{guideName}:</strong> So tell me - what's really alive in your life right now?
              </p>
              <p className="soullab-text-small text-soullab-gray mt-2">
                Not what you think I want to hear. What's actually moving through you.
              </p>
            </div>
          </div>
        </SacredCard>
        
        <textarea
          value={firstResponse}
          onChange={(e) => setFirstResponse(e.target.value)}
          placeholder="Share what feels most alive or present for you right now..."
          className="soullab-input soullab-textarea min-h-32"
          rows={4}
        />
      </div>
      
      <SacredButton
        variant="primary"
        size="lg"
        onClick={() => onComplete({
          guideName,
          elementalState,
          firstResponse,
          ritualCompleted: true,
          timestamp: new Date().toISOString()
        })}
        disabled={!firstResponse.trim()}
        icon={<ArrowRight className="w-5 h-5" />}
        iconPosition="right"
      >
        Complete Sacred Union
      </SacredButton>
    </motion.div>
  );

  const phases = {
    arrival: ArrivalPhase,
    elemental: ElementalPhase,
    introduction: IntroductionPhase,
    contract: ContractPhase,
    firstExchange: FirstExchangePhase
  };

  const CurrentPhase = phases[phase];

  return (
    <div className="min-h-screen bg-soullab-white soullab-spiral-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {Object.keys(phases).map((phaseName, index) => (
              <div
                key={phaseName}
                className={`
                  w-3 h-3 rounded-full transition-colors duration-300
                  ${Object.keys(phases).indexOf(phase) >= index 
                    ? 'bg-soullab-fire' 
                    : 'bg-soullab-gray/30'
                  }
                `}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SacredCard variant="premium" className="p-8">
              <CurrentPhase />
            </SacredCard>
          </motion.div>
        </AnimatePresence>

        {/* Cancel Option */}
        {onCancel && (
          <div className="text-center mt-6">
            <SacredButton
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Not ready for this kind of relationship
            </SacredButton>
          </div>
        )}
      </div>
    </div>
  );
};