"use client";

import React from 'react';
import Image from 'next/image';

interface PetalInfo {
  name: string;
  color: string;
  description: string;
}

const petalDescriptions: PetalInfo[] = [
  {
    name: "Gold petals",
    color: "#C4A550",
    description: "Mental clarity, focus, analytical thinking"
  },
  {
    name: "Rust petals",
    color: "#B7410E",
    description: "Physical energy, embodiment, action"
  },
  {
    name: "Blue petals",
    color: "#4682B4",
    description: "Spiritual connection, intuition, vision"
  },
  {
    name: "Green petals",
    color: "#6B8E23",
    description: "Emotional state, relationships, empathy"
  }
];

export const HoloflowerPetalDisplay: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b26] to-[#24252f] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-[#d4a542] mb-6">
          Understanding Your Petals
        </h1>

        <div className="relative w-80 h-80 mx-auto mb-10">
          <Image
            src="/SpiralogicHoloflower.png"
            alt="Spiralogic Holoflower"
            width={320}
            height={320}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {petalDescriptions.map((petal, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: petal.color }}
              />
              <div className="text-left">
                <span className="font-medium" style={{ color: petal.color }}>
                  {petal.name}:
                </span>
                <span className="text-gray-300 ml-2">
                  {petal.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoloflowerPetalDisplay;