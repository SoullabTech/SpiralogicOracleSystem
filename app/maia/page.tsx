"use client";

import React, { useState } from "react";
import { BetaHoloflower } from "@/components/holoflower/BetaHoloflower";

export default function MaiaPage() {
  const [showHoloflower, setShowHoloflower] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const elements = [
    { name: "Earth", color: "#7A9A65", description: "Grounding & Structure" },
    { name: "Water", color: "#6B9BD1", description: "Flow & Emotion" },
    { name: "Fire", color: "#C85450", description: "Vision & Transformation" },
    { name: "Air", color: "#D4B896", description: "Ideas & Connection" }
  ];

  if (showHoloflower) {
    return <BetaHoloflower userId="user-1" showOnboarding={true} />;
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

        {/* Launch Holoflower Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowHoloflower(true)}
            className="px-8 py-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7A9A65 0%, #6B9BD1 50%, #C85450 75%, #D4B896 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            Enter Sacred Holoflower Experience
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