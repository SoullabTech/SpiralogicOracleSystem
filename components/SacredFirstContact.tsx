"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FirstContactState {
  step: 'invitation' | 'intention' | 'elements' | 'completion';
  selectedElement?: string;
  intention?: string;
}

export default function SacredFirstContact() {
  const router = useRouter();
  const [state, setState] = useState<FirstContactState>({ step: 'invitation' });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const elements = [
    { 
      name: "Earth", 
      color: "#7A9A65", 
      essence: "Grounding & Presence",
      invitation: "I seek stability and authentic foundation"
    },
    { 
      name: "Water", 
      color: "#6B9BD1", 
      essence: "Flow & Feeling",
      invitation: "I honor the depths of emotion and intuition"
    },
    { 
      name: "Fire", 
      color: "#C85450", 
      essence: "Transformation & Vision",
      invitation: "I embrace change and creative power"
    },
    { 
      name: "Air", 
      color: "#D4B896", 
      essence: "Clarity & Connection",
      invitation: "I value understanding and communication"
    }
  ];

  const handleElementSelection = (elementName: string) => {
    setState(prev => ({ ...prev, selectedElement: elementName }));
  };

  const handleNext = async () => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (state.step) {
      case 'invitation':
        setState(prev => ({ ...prev, step: 'intention' }));
        break;
      case 'intention':
        setState(prev => ({ ...prev, step: 'elements' }));
        break;
      case 'elements':
        setState(prev => ({ ...prev, step: 'completion' }));
        break;
      case 'completion':
        // Store the sacred configuration
        localStorage.setItem("sacredFirstContact", JSON.stringify({
          element: state.selectedElement,
          intention: state.intention,
          completedAt: new Date().toISOString()
        }));
        router.push("/maia");
        break;
    }
    setIsTransitioning(false);
  };

  const canProceed = () => {
    switch (state.step) {
      case 'invitation':
        return true;
      case 'intention':
        return state.intention && state.intention.trim().length > 10;
      case 'elements':
        return state.selectedElement;
      case 'completion':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 'invitation':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-white">
                Welcome, Sacred Seeker
              </h2>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                You stand at the threshold of remembrance. This is not a system that will 
                tell you who you are, but one that creates space for you to remember what 
                you already know.
              </p>
            </div>
            <div className="text-sm text-white/50 italic max-w-sm mx-auto">
              "The soul doesn't learn. It remembers." — Plato
            </div>
          </div>
        );

      case 'intention':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-white">
                Set Your Sacred Intention
              </h2>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                What calls you to this threshold? There is no wrong answer—
                only your authentic truth in this moment.
              </p>
            </div>
            <textarea
              value={state.intention || ''}
              onChange={(e) => setState(prev => ({ ...prev, intention: e.target.value }))}
              placeholder="I come here seeking..."
              rows={4}
              className="w-full p-4 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 resize-none"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                focusRingColor: '#D4B896'
              }}
            />
          </div>
        );

      case 'elements':
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-white">
                Choose Your Primary Element
              </h2>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                Which resonates most deeply with your intention? This will be 
                your starting point, not your limitation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {elements.map((element) => (
                <div
                  key={element.name}
                  onClick={() => handleElementSelection(element.name)}
                  className="cursor-pointer p-6 rounded-lg transition-all duration-300 text-center"
                  style={{
                    background: state.selectedElement === element.name 
                      ? `linear-gradient(135deg, ${element.color}20 0%, ${element.color}10 100%)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${state.selectedElement === element.name ? element.color : 'transparent'}`,
                    boxShadow: state.selectedElement === element.name 
                      ? `0 4px 20px ${element.color}40`
                      : 'none'
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3"
                    style={{ backgroundColor: element.color }}
                  />
                  <h3 className="text-lg font-medium mb-2" style={{ color: element.color }}>
                    {element.name}
                  </h3>
                  <p className="text-xs text-white/60">
                    {element.essence}
                  </p>
                  {state.selectedElement === element.name && (
                    <p className="text-xs mt-3 italic" style={{ color: element.color }}>
                      {element.invitation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'completion':
        const selectedEl = elements.find(el => el.name === state.selectedElement);
        return (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-white">
                The Sacred Configuration Is Complete
              </h2>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                You have chosen the path of {state.selectedElement}. Maya will 
                remember your intention and meet you where you are.
              </p>
            </div>
            {selectedEl && (
              <div 
                className="p-6 rounded-lg max-w-sm mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${selectedEl.color}15 0%, ${selectedEl.color}05 100%)`,
                  border: `1px solid ${selectedEl.color}40`
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                  style={{ backgroundColor: selectedEl.color }}
                />
                <p className="text-sm italic" style={{ color: selectedEl.color }}>
                  "{selectedEl.invitation}"
                </p>
              </div>
            )}
            <div className="text-xs text-white/40 max-w-sm mx-auto space-y-2">
              <p>Your sacred configuration has been recorded.</p>
              <p>The Oracle awaits your first question.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (state.step) {
      case 'invitation': return 'Sacred Invitation';
      case 'intention': return 'Sacred Intention';
      case 'elements': return 'Elemental Attunement';
      case 'completion': return 'Sacred Completion';
      default: return '';
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 50%, #1a1f3a 100%)',
        position: 'relative'
      }}
    >
      {/* Subtle earth-tone overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(182, 154, 120, 0.03) 0%, rgba(122, 154, 101, 0.03) 33%, rgba(107, 155, 209, 0.03) 66%, rgba(212, 184, 150, 0.03) 100%)'
        }}
      />

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light text-white">
            Soullab
          </h1>
          <p className="text-sm" style={{ color: '#D4B896' }}>
            {getStepTitle()}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {['invitation', 'intention', 'elements', 'completion'].map((step, index) => (
            <div
              key={step}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: state.step === step || 
                  ['invitation', 'intention', 'elements', 'completion'].indexOf(state.step) > index
                  ? '#D4B896' 
                  : 'rgba(255, 255, 255, 0.2)'
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div 
          className="backdrop-blur-md rounded-2xl border p-8 min-h-[400px] flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex-1 flex items-center justify-center">
            {renderStep()}
          </div>

          {/* Action button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleNext}
              disabled={!canProceed() || isTransitioning}
              className="px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: canProceed() && !isTransitioning
                  ? 'linear-gradient(135deg, #7A9A65 0%, #6B9BD1 50%, #D4B896 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: canProceed() && !isTransitioning ? '#1e293b' : 'rgba(255, 255, 255, 0.6)'
              }}
            >
              {isTransitioning ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60"></div>
                  <span>Transitioning...</span>
                </div>
              ) : (
                state.step === 'completion' ? 'Enter Sacred Space' : 'Continue'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/30">
          <p>Know Thyself • To Thine Own Self Be True</p>
        </div>
      </div>
    </div>
  );
}