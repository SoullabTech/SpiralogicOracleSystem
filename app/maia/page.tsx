"use client";

import React, { useState } from "react";
import { BetaHoloflower } from "@/components/holoflower/BetaHoloflower";

export default function MaiaPage() {
  const [showHoloflower, setShowHoloflower] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showBetaRituals, setShowBetaRituals] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const elements = [
    { name: "Air", color: "#D4B896", description: "Ideas & Connection" },
    { name: "Earth", color: "#7A9A65", description: "Grounding & Structure" },
    { name: "Fire", color: "#C85450", description: "Vision & Transformation" },
    { name: "Water", color: "#6B9BD1", description: "Flow & Emotion" }
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
      title: "Water Ceremony",
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

  const handleActionWithLoading = async (action: () => Promise<void>, message: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
    try {
      await action();
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #2e3a4b 100%)'
      }}>
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <svg
              className="animate-spin"
              width="192"
              height="192"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4B896" />
                  <stop offset="25%" stopColor="#C85450" />
                  <stop offset="50%" stopColor="#6B9BD1" />
                  <stop offset="75%" stopColor="#7A9A65" />
                  <stop offset="100%" stopColor="#D4B896" />
                </radialGradient>
              </defs>
              {Array.from({ length: 24 }, (_, ring) => {
                const radius = 10 + ring * 4;
                const dotsCount = 8 + ring * 2;
                return Array.from({ length: dotsCount }, (_, i) => {
                  const angle = (i / dotsCount) * Math.PI * 2;
                  const x = 100 + Math.cos(angle) * radius;
                  const y = 100 + Math.sin(angle) * radius;
                  const size = 2 + (ring * 0.2);
                  const opacity = 1 - (ring * 0.03);
                  return (
                    <circle
                      key={`${ring}-${i}`}
                      cx={x}
                      cy={y}
                      r={size}
                      fill="url(#gradient)"
                      opacity={opacity}
                    />
                  );
                });
              })}
            </svg>
            {/* White Holoflower in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-pulse"
              >
                <g transform="translate(50, 50)">
                  {/* Outer petals */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const petalX = Math.cos(angle) * 25;
                    const petalY = Math.sin(angle) * 25;
                    return (
                      <ellipse
                        key={`outer-${i}`}
                        cx={petalX}
                        cy={petalY}
                        rx="12"
                        ry="20"
                        fill="white"
                        opacity="0.9"
                        transform={`rotate(${i * 45} ${petalX} ${petalY})`}
                      />
                    );
                  })}
                  {/* Inner petals */}
                  {Array.from({ length: 8 }, (_, i) => {
                    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
                    const petalX = Math.cos(angle) * 15;
                    const petalY = Math.sin(angle) * 15;
                    return (
                      <ellipse
                        key={`inner-${i}`}
                        cx={petalX}
                        cy={petalY}
                        rx="8"
                        ry="15"
                        fill="white"
                        opacity="0.8"
                        transform={`rotate(${i * 45 + 22.5} ${petalX} ${petalY})`}
                      />
                    );
                  })}
                  {/* Center circle */}
                  <circle cx="0" cy="0" r="8" fill="white" opacity="1" />
                  <circle cx="0" cy="0" r="5" fill="#D4B896" opacity="0.3" />
                </g>
              </svg>
            </div>
          </div>
          <p className="text-xl font-medium" style={{ color: '#D4B896' }}>
            {loadingMessage || "Processing..."}
          </p>
        </div>
      </div>
    );
  }

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
              onClick={() => handleActionWithLoading(
                async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  setActiveElement(element.name);
                },
                `Connecting with ${element.name} element...`
              )}
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


        {/* Conversation */}
        <div className="text-center mb-12 space-y-4">
          <a
            href="/oracle-conversation"
            className="inline-block px-8 py-4 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7A9A65 0%, #6B9BD1 50%, #C85450 75%, #D4B896 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            ✨ Begin Conversation with Maya ✨
          </a>
          
          <button
            disabled
            className="block mx-auto px-6 py-3 rounded-lg text-white/50 font-medium cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #7A9A6530 0%, #6B9BD130 50%, #C8545030 75%, #D4B89630 100%)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Holoflower Experience (Coming Soon)
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