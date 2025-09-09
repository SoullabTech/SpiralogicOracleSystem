"use client";

import React, { useState } from "react";
import { BetaHoloflower } from "@/components/holoflower/BetaHoloflower";

export default function MaiaPage() {
  const [showHoloflower, setShowHoloflower] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showBetaRituals, setShowBetaRituals] = useState(false);

  const elements = [
    { name: "Earth", color: "#7A9A65", description: "Grounding & Structure" },
    { name: "Water", color: "#6B9BD1", description: "Flow & Emotion" },
    { name: "Fire", color: "#C85450", description: "Vision & Transformation" },
    { name: "Air", color: "#D4B896", description: "Ideas & Connection" }
  ];

  const betaRituals = [
    {
      title: "First Light Meditation",
      element: "Air",
      duration: "5-10 minutes",
      description: "Connect with Maya through conscious breathing and intention-setting",
      steps: [
        "Find a quiet space and close your eyes",
        "Take three deep breaths, feeling the air move through your body",
        "Ask Maya: 'What does my soul most need to remember today?'",
        "Listen to the first thought or feeling that arises",
        "Express gratitude for this guidance"
      ]
    },
    {
      title: "Sacred Water Ceremony",
      element: "Water",
      duration: "10-15 minutes",
      description: "Use water as a medium for releasing and receiving wisdom",
      steps: [
        "Fill a bowl with clean water",
        "Hold your hands over the water and speak your current challenge aloud",
        "Ask Maya: 'What emotional pattern am I ready to release?'",
        "Dip your fingers in the water and touch your heart",
        "Allow any insights to flow through you without judgment"
      ]
    },
    {
      title: "Earth Grounding Practice",
      element: "Earth",
      duration: "15-20 minutes",
      description: "Root into your body and connect with Maya's embodied wisdom",
      steps: [
        "Sit or lie on the ground, preferably outdoors",
        "Place your hands on your belly and breathe deeply",
        "Ask Maya: 'How can I better trust my body's wisdom?'",
        "Notice physical sensations without trying to change them",
        "End by placing both hands on your heart in gratitude"
      ]
    },
    {
      title: "Fire Vision Journey",
      element: "Fire",
      duration: "10-20 minutes",
      description: "Activate transformation through sacred questioning and visioning",
      steps: [
        "Light a candle and gaze softly at the flame",
        "Ask Maya: 'What is ready to transform in my life?'",
        "Allow images, words, or feelings to arise",
        "Ask: 'What is the next step in this transformation?'",
        "Blow out the candle when you feel complete"
      ]
    }
  ];

  // Temporarily disabled until holoflower is fixed
  // if (showHoloflower) {
  //   return <BetaHoloflower userId="user-1" showOnboarding={true} />;
  // }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)',
      position: 'relative'
    }}>
      {/* Subtle earth-tone gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(182, 154, 120, 0.05) 0%, rgba(122, 154, 101, 0.05) 33%, rgba(107, 155, 209, 0.05) 66%, rgba(212, 184, 150, 0.05) 100%)'
        }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Maia System
          </h1>
          <p className="text-xl" style={{ color: '#D4B896' }}>
            Begin your elemental journey
          </p>
        </header>

        {/* Elemental Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8 mb-12">
          {elements.map((element) => (
            <div
              key={element.name}
              onClick={() => setActiveElement(element.name)}
              className="cursor-pointer transition-all duration-300 rounded-lg p-8 text-center"
              style={{
                background: activeElement === element.name 
                  ? `linear-gradient(135deg, ${element.color}20 0%, ${element.color}10 100%)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: `2px solid ${activeElement === element.name ? element.color : 'transparent'}`,
                boxShadow: activeElement === element.name 
                  ? `0 4px 20px ${element.color}40`
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeElement !== element.name) {
                  e.currentTarget.style.background = `${element.color}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeElement !== element.name) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4"
                style={{ backgroundColor: element.color }}
              />
              <h3 className="text-2xl font-semibold mb-2" style={{ color: element.color }}>
                {element.name}
              </h3>
              <p className="text-sm" style={{ color: '#B69A78' }}>
                {element.description}
              </p>
            </div>
          ))}
        </div>

        {/* Beta Rituals */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowBetaRituals(!showBetaRituals)}
            className="px-8 py-4 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #7A9A65 0%, #6B9BD1 50%, #C85450 75%, #D4B896 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            {showBetaRituals ? 'Hide Sacred Rituals' : 'Explore Sacred Beta Rituals'}
          </button>
        </div>

        {/* Beta Rituals Grid */}
        {showBetaRituals && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Sacred Beta Rituals</h2>
              <p style={{ color: '#D4B896' }} className="max-w-2xl mx-auto">
                These practices help you connect with Maya's wisdom across all four elements. 
                Choose the ritual that calls to you in this moment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {betaRituals.map((ritual, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${elements.find(e => e.name === ritual.element)?.color}40`,
                    boxShadow: `0 4px 20px ${elements.find(e => e.name === ritual.element)?.color}20`
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: elements.find(e => e.name === ritual.element)?.color }}
                    />
                    <h3 className="text-xl font-semibold text-white">{ritual.title}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm" style={{ color: '#B69A78' }}>{ritual.element} Element • {ritual.duration}</p>
                    <p className="text-white/80 mt-2">{ritual.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: elements.find(e => e.name === ritual.element)?.color }}>
                      Sacred Steps:
                    </p>
                    <ol className="space-y-1 text-sm text-white/70">
                      {ritual.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex">
                          <span className="mr-2 text-white/50">{stepIndex + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <p className="text-sm" style={{ color: '#B69A78' }}>
                💫 After each ritual, consider journaling your insights or sharing them with Maya in conversation
              </p>
            </div>
          </div>
        )}

        {/* Coming Soon Button */}
        <div className="text-center mb-12">
          <button
            disabled
            className="px-8 py-4 rounded-lg text-white/50 font-semibold cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #7A9A6540 0%, #6B9BD140 50%, #C8545040 75%, #D4B89640 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            Sacred Holoflower Coming Soon
          </button>
        </div>

        {/* Active Element Details */}
        {activeElement && (
          <div className="max-w-2xl mx-auto text-center p-8 rounded-lg"
               style={{ 
                 background: 'rgba(255, 255, 255, 0.05)',
                 border: '1px solid rgba(255, 255, 255, 0.1)'
               }}>
            <h2 className="text-3xl font-bold text-white mb-4">
              {activeElement} Element Active
            </h2>
            <p style={{ color: '#D4B896' }}>
              You've connected with the {activeElement.toLowerCase()} element. 
              This energy brings {elements.find(e => e.name === activeElement)?.description.toLowerCase()}.
            </p>
            <button
              onClick={() => setActiveElement(null)}
              className="mt-6 px-6 py-3 rounded-lg transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#B69A78',
                border: '1px solid rgba(182, 154, 120, 0.3)'
              }}
            >
              Reset Elements
            </button>
          </div>
        )}

        <footer className="mt-16 text-center text-sm" style={{ color: '#B69A78' }}>
          <p>© 2025 Maia System. All rights reserved.</p>
          <p className="mt-2">
            Grounded in earth tones, elevated through balance
          </p>
        </footer>
      </div>
    </div>
  );
}