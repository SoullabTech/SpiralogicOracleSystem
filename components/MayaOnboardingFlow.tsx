'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingFlow, OnboardingOrchestrator, OnboardingResponse } from '@/lib/maya-onboarding-questionnaire';
import { CohortTracker } from '@/lib/maya-cohort-tracker';
import { ContemplativeSpace } from '@/components/contemplative/ContemplativeSpace';

interface OnboardingFlowProps {
  userId: string;
  onComplete: (profile: any) => void;
  onExit?: () => void;
}

export function MayaOnboardingFlow({ userId, onComplete, onExit }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<OnboardingResponse[]>([]);
  const [showRedirect, setShowRedirect] = useState(false);
  const [redirectType, setRedirectType] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depth, setDepth] = useState<'surface' | 'middle' | 'deep'>('middle');
  const [density, setDensity] = useState<'haiku' | 'flowing' | 'spacious'>('flowing');

  const orchestrator = new OnboardingOrchestrator();
  const cohortTracker = new CohortTracker();

  const currentQuestion = onboardingFlow.screeningQuestions[currentStep];
  const isLastQuestion = currentStep === onboardingFlow.screeningQuestions.length - 1;

  const handleResponse = async (value: string | number | string[]) => {
    const response: OnboardingResponse = {
      questionId: currentQuestion.id,
      response: value,
      metadata: {
        responseTime: Date.now()
      }
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);

    // Check for critical paths
    if (currentQuestion.id === 'crisis-check' && value === true) {
      setShowRedirect(true);
      setRedirectType('crisis');
      return;
    }

    // Check for contraindications
    if (currentQuestion.id === 'comfort-level' && typeof value === 'number' && value < 3) {
      setShowRedirect(true);
      setRedirectType('low-uncertainty-tolerance');
      return;
    }

    if (currentQuestion.id === 'intention' && value === 'answers') {
      setShowRedirect(true);
      setRedirectType('seeking-direction');
      return;
    }

    // Move to next question or complete
    if (isLastQuestion) {
      await completeOnboarding(newResponses);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async (allResponses: OnboardingResponse[]) => {
    setIsProcessing(true);
    
    // Process responses into profile
    const profile = await orchestrator.processResponses(allResponses);
    
    // Assign cohort
    const responseMap = allResponses.reduce((acc, r) => {
      acc[r.questionId] = r.response;
      return acc;
    }, {} as Record<string, any>);
    
    const cohort = await cohortTracker.assignCohort(userId, responseMap);
    
    // Generate initial context
    const context = orchestrator.generateInitialContext(profile);
    
    setIsProcessing(false);
    
    // Pass complete profile to parent
    onComplete({
      ...profile,
      cohort,
      context,
      preferences: {
        depth: depth,
        density: density
      }
    });
  };

  const handleRedirectChoice = async (choice: string) => {
    if (choice === 'continue' || choice === 'try-witness' || choice === 'experiment') {
      setShowRedirect(false);
      
      // Add gentle mode flag if they're uncertain
      if (choice === 'experiment') {
        // Continue with gentle mode
        setDepth('surface');
        setDensity('haiku');
      }
      
      // Continue to next question or complete
      if (isLastQuestion) {
        await completeOnboarding(responses);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Exit onboarding
      onExit?.();
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'choice':
        return (
          <div className="choices">
            {currentQuestion.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponse(option.value)}
                className="choice-button"
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case 'scale':
        const scale = currentQuestion.scale!;
        return (
          <div className="scale-container">
            <div className="scale-labels">
              <span>{scale.labels[1]}</span>
              <span>{scale.labels[3]}</span>
              <span>{scale.labels[5]}</span>
            </div>
            <input
              type="range"
              min={scale.min}
              max={scale.max}
              defaultValue={3}
              onChange={(e) => handleResponse(parseInt(e.target.value))}
              className="scale-slider"
            />
            <button
              onClick={() => handleResponse(parseInt((document.querySelector('.scale-slider') as HTMLInputElement).value))}
              className="continue-button"
            >
              Continue
            </button>
          </div>
        );

      case 'multi-select':
        const [selected, setSelected] = useState<string[]>([]);
        return (
          <div className="multi-select">
            {currentQuestion.options?.map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected([...selected, option]);
                    } else {
                      setSelected(selected.filter(s => s !== option));
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
            <button
              onClick={() => handleResponse(selected)}
              className="continue-button"
            >
              {currentQuestion.optional && selected.length === 0 ? 'Skip' : 'Continue'}
            </button>
          </div>
        );

      case 'boolean':
        return (
          <div className="boolean-choice">
            <button
              onClick={() => handleResponse(false)}
              className="choice-button"
            >
              No
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="choice-button crisis"
            >
              Yes
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (showRedirect) {
    const redirectMessage = onboardingFlow.redirectMessages[redirectType as keyof typeof onboardingFlow.redirectMessages];
    
    return (
      <ContemplativeSpace
        isActive={true}
        presenceQuality="holding"
        depth={depth}
        density={density}
        onDepthChange={setDepth}
        onDensityChange={setDensity}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="redirect-container"
        >
          <p className="redirect-message">{redirectMessage.message}</p>
          <div className="redirect-options">
            {redirectMessage.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRedirectChoice(option.value)}
                className="redirect-button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      </ContemplativeSpace>
    );
  }

  if (isProcessing) {
    return (
      <ContemplativeSpace
        isActive={true}
        presenceQuality="reflecting"
        depth={depth}
        density={density}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="processing"
        >
          <p>Preparing your space...</p>
        </motion.div>
      </ContemplativeSpace>
    );
  }

  // Show welcome first
  if (currentStep === 0 && responses.length === 0) {
    return (
      <ContemplativeSpace
        isActive={true}
        presenceQuality="listening"
        depth="middle"
        density="flowing"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="welcome-container"
        >
          <div className="welcome-message">
            {onboardingFlow.welcome.message.split('\\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          
          <div className="welcome-example">
            <p className="example-label">Example exchange:</p>
            <div className="example-dialogue">
              <p className="user-message">I\'m feeling overwhelmed with a decision about my career.</p>
              <p className="maya-message">What part of this decision feels most alive right now?</p>
              <p className="user-message">The fear of making the wrong choice.</p>
              <p className="maya-message">Mm. Wrong according to whom?</p>
            </div>
          </div>

          <div className="welcome-options">
            {onboardingFlow.welcome.options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value === 'ready') {
                    setCurrentStep(0);
                    setResponses([{ 
                      questionId: 'welcome', 
                      response: 'ready',
                      metadata: {}
                    }]);
                  } else if (option.value === 'seeking') {
                    setShowRedirect(true);
                    setRedirectType('seeking-direction');
                  } else {
                    handleResponse('uncertain');
                  }
                }}
                className="welcome-button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      </ContemplativeSpace>
    );
  }

  return (
    <ContemplativeSpace
      isActive={true}
      presenceQuality="witnessing"
      depth={depth}
      density={density}
      onDepthChange={setDepth}
      onDensityChange={setDensity}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="question-container"
        >
          <div className="progress">
            <div 
              className="progress-bar"
              style={{ 
                width: `${((currentStep + 1) / onboardingFlow.screeningQuestions.length) * 100}%` 
              }}
            />
          </div>

          <h2 className="question">{currentQuestion.question}</h2>
          
          {renderQuestion()}

          <div className="navigation">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="back-button"
              >
                Back
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx>{`
        .welcome-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .welcome-message {
          margin-bottom: 2rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
        }

        .welcome-message p {
          margin: 1rem 0;
        }

        .welcome-example {
          background: rgba(139, 92, 246, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .example-label {
          font-size: 0.9rem;
          color: rgba(139, 92, 246, 0.6);
          margin-bottom: 1rem;
        }

        .example-dialogue p {
          margin: 0.5rem 0;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .user-message {
          background: rgba(255, 255, 255, 0.05);
          margin-left: 2rem;
        }

        .maya-message {
          background: rgba(139, 92, 246, 0.1);
          margin-right: 2rem;
        }

        .welcome-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .welcome-button {
          padding: 1rem 2rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .welcome-button:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .question-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
        }

        .progress {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin-bottom: 2rem;
        }

        .progress-bar {
          height: 100%;
          background: rgba(139, 92, 246, 0.6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .question {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .choices {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .choice-button {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .choice-button:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .choice-button.crisis {
          border-color: rgba(255, 100, 100, 0.3);
        }

        .scale-container {
          padding: 2rem 0;
        }

        .scale-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .scale-slider {
          width: 100%;
          margin-bottom: 2rem;
        }

        .multi-select {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .checkbox-label:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .continue-button {
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .continue-button:hover {
          background: rgba(139, 92, 246, 0.3);
        }

        .boolean-choice {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .navigation {
          margin-top: 2rem;
        }

        .back-button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: rgba(255, 255, 255, 0.8);
        }

        .redirect-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
        }

        .redirect-message {
          margin-bottom: 2rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }

        .redirect-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .redirect-button {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .redirect-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .processing {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </ContemplativeSpace>
  );
}