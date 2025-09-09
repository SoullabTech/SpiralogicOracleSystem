"use client";

import React, { useState, useEffect } from "react";
import { BetaHoloflower } from "@/components/holoflower/BetaHoloflower";
import { useMayaVoice, useMayaGreeting } from "@/hooks/useMayaVoice";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from "lucide-react";

export default function MaiaPage() {
  const [showHoloflower, setShowHoloflower] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showBetaRituals, setShowBetaRituals] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [hasPlayedGreeting, setHasPlayedGreeting] = useState(false);
  
  // Maya Voice Integration
  const { 
    speak, 
    playGreeting, 
    voiceState, 
    isPlaying, 
    pause, 
    resume, 
    stop,
    autoSpeak,
    setAutoSpeak,
    isSupported,
    isReady 
  } = useMayaVoice();

  // Play Maya's greeting when page loads (once per session)
  useEffect(() => {
    if (isReady && !hasPlayedGreeting && autoSpeak) {
      const timer = setTimeout(() => {
        playGreeting().catch(console.error);
        setHasPlayedGreeting(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isReady, hasPlayedGreeting, autoSpeak, playGreeting]);

  // Speak element description when activated
  const speakElementActivation = async (element: typeof elements[0]) => {
    if (autoSpeak && isReady) {
      const text = `You have connected with the ${element.name} element. ${element.description}. Let this energy guide your journey.`;
      await speak(text).catch(console.error);
    }
  };

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
            {/* Holoflower Animation */}
            <svg
              width="192"
              height="192"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin-slow"
              style={{ animationDuration: '8s' }}
            >
              <defs>
                <radialGradient id="holoGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4B896" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#7A9A65" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#6B9BD1" stopOpacity="0.3" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g transform="translate(100, 100)">
                {/* Large outer petals */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const petalX = Math.cos(angle) * 60;
                  const petalY = Math.sin(angle) * 60;
                  return (
                    <ellipse
                      key={`outer-${i}`}
                      cx={petalX}
                      cy={petalY}
                      rx="25"
                      ry="40"
                      fill="url(#holoGradient)"
                      opacity="0.7"
                      transform={`rotate(${i * 30} ${petalX} ${petalY})`}
                      filter="url(#glow)"
                    />
                  );
                })}
                {/* Medium inner petals */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2 + Math.PI / 16;
                  const petalX = Math.cos(angle) * 35;
                  const petalY = Math.sin(angle) * 35;
                  return (
                    <ellipse
                      key={`middle-${i}`}
                      cx={petalX}
                      cy={petalY}
                      rx="18"
                      ry="30"
                      fill="#D4B896"
                      opacity="0.6"
                      transform={`rotate(${i * 45 + 22.5} ${petalX} ${petalY})`}
                    />
                  );
                })}
                {/* Small inner petals */}
                {Array.from({ length: 6 }, (_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const petalX = Math.cos(angle) * 15;
                  const petalY = Math.sin(angle) * 15;
                  return (
                    <ellipse
                      key={`inner-${i}`}
                      cx={petalX}
                      cy={petalY}
                      rx="10"
                      ry="18"
                      fill="#7A9A65"
                      opacity="0.5"
                      transform={`rotate(${i * 60} ${petalX} ${petalY})`}
                    />
                  );
                })}
                {/* Sacred center */}
                <circle cx="0" cy="0" r="12" fill="#D4B896" opacity="0.9" filter="url(#glow)" />
                <circle cx="0" cy="0" r="8" fill="#FFD700" opacity="0.7" className="animate-pulse" />
                <circle cx="0" cy="0" r="4" fill="#FFFFFF" opacity="1" />
              </g>
            </svg>
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
          
          {/* Maya Voice Controls */}
          {isSupported && (
            <div className="mt-6 flex items-center justify-center gap-4">
              {/* Auto-speak Toggle */}
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                style={{
                  background: autoSpeak ? 'rgba(212, 184, 150, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${autoSpeak ? '#D4B896' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: autoSpeak ? '#D4B896' : '#B69A78'
                }}
                title={autoSpeak ? "Voice Active" : "Voice Inactive"}
              >
                {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span className="text-sm">Maya's Voice</span>
              </button>

              {/* Play Greeting Button */}
              <button
                onClick={() => playGreeting().catch(console.error)}
                disabled={isPlaying}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #D4B896 0%, #7A9A65 100%)',
                  color: 'white'
                }}
                title="Hear Maya's Greeting"
              >
                <Sparkles size={20} />
                <span className="text-sm font-medium">Hear Maya</span>
              </button>

              {/* Voice Controls */}
              {isPlaying && (
                <div className="flex items-center gap-2">
                  {voiceState.isPaused ? (
                    <button
                      onClick={resume}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: 'rgba(212, 184, 150, 0.2)',
                        border: '1px solid #D4B896',
                        color: '#D4B896'
                      }}
                      title="Resume"
                    >
                      <Play size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={pause}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: 'rgba(212, 184, 150, 0.2)',
                        border: '1px solid #D4B896',
                        color: '#D4B896'
                      }}
                      title="Pause"
                    >
                      <Pause size={20} />
                    </button>
                  )}
                  <button
                    onClick={stop}
                    className="p-2 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: 'rgba(200, 84, 80, 0.2)',
                      border: '1px solid #C85450',
                      color: '#C85450'
                    }}
                    title="Stop"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              )}

              {/* Status Indicator */}
              {isPlaying && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full animate-pulse"
                     style={{
                       background: 'rgba(212, 184, 150, 0.1)',
                       border: '1px solid rgba(212, 184, 150, 0.3)'
                     }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" 
                       style={{ backgroundColor: '#D4B896' }} />
                  <span className="text-xs" style={{ color: '#D4B896' }}>
                    {voiceState.isPaused ? 'Paused' : 'Speaking'}
                  </span>
                </div>
              )}
            </div>
          )}
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
                  await speakElementActivation(element);
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


        {/* Beta Rituals Section */}
        {showBetaRituals && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Sacred Rituals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {betaRituals.map((ritual) => {
                const element = elements.find(e => e.name === ritual.element);
                return (
                  <div
                    key={ritual.title}
                    className="p-6 rounded-lg transition-all hover:scale-102"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${element?.color || '#D4B896'}30`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: element?.color }}
                      />
                      <h3 className="text-xl font-semibold" style={{ color: element?.color }}>
                        {ritual.title}
                      </h3>
                    </div>
                    <p className="text-sm mb-2" style={{ color: '#B69A78' }}>
                      {ritual.duration} • {ritual.element} Element
                    </p>
                    <p className="text-sm mb-4" style={{ color: '#D4B896' }}>
                      {ritual.description}
                    </p>
                    <button
                      onClick={() => {
                        if (autoSpeak && isReady) {
                          const stepsText = `${ritual.title}. ${ritual.description}. ` + 
                            ritual.steps.map((step, i) => `Step ${i + 1}: ${step}`).join('. ');
                          speak(stepsText).catch(console.error);
                        }
                      }}
                      className="text-sm px-3 py-1 rounded transition-all hover:scale-105"
                      style={{
                        background: `${element?.color}20`,
                        border: `1px solid ${element?.color}50`,
                        color: element?.color
                      }}
                    >
                      {autoSpeak ? '🔊 Listen to Ritual' : 'View Steps'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversation and Actions */}
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
          
          <div className="flex justify-center gap-4">
            <button
              disabled
              className="px-6 py-3 rounded-lg text-white/50 font-medium cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7A9A6530 0%, #6B9BD130 50%, #C8545030 75%, #D4B89630 100%)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              Holoflower Experience (Coming Soon)
            </button>
            
            <button
              onClick={() => setShowBetaRituals(!showBetaRituals)}
              className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                background: showBetaRituals 
                  ? 'linear-gradient(135deg, #D4B896 0%, #7A9A65 100%)'
                  : 'rgba(212, 184, 150, 0.1)',
                border: '1px solid #D4B896',
                color: showBetaRituals ? 'white' : '#D4B896'
              }}
            >
              {showBetaRituals ? 'Hide' : 'Show'} Sacred Rituals
            </button>
          </div>
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