import React from 'react';
import type { ArchetypeData } from '../lib/types';

interface ArchetypeDisplayProps {
  archetype: ArchetypeData;
  response: string;
  followUpQuestions?: string[];
}

export const ArchetypeDisplay: React.FC<ArchetypeDisplayProps> = ({
  archetype,
  response,
  followUpQuestions = [
    'How does this resonate with your current experience?',
    'What aspects of this archetype feel most alive in you?',
    'Where do you see opportunities for integration?'
  ]
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4" style={{ borderColor: archetype.color }}>
      <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{archetype.name}</h2>
            <div className="flex gap-2 mt-1">
              <span 
                className="px-2 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: `${archetype.color}20`,
                  color: archetype.color
                }}
              >
                {archetype.element}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                {archetype.spiralLevel}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {archetype.alchemyPhase}
              </span>
            </div>
          </div>
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
            style={{ 
              background: `linear-gradient(to bottom right, ${archetype.color}, ${archetype.color}90)`
            }}
          >
            {archetype.name.charAt(0)}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Response Section */}
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
          <p className="italic text-purple-900">{response}</p>
        </div>
        
        {/* Shadow Section */}
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
          <h3 className="text-sm font-semibold text-red-800">
            Shadow Presence: {archetype.shadowPresence}%
          </h3>
          <div className="w-full bg-white h-2 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-500"
              style={{ width: `${archetype.shadowPresence}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {archetype.shadowSymptoms.map((symptom, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white text-red-800 rounded-full text-xs shadow-sm"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
        
        {/* Integration Section */}
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
          <h3 className="text-sm font-semibold text-green-800">Integrated Qualities</h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {archetype.integratedQualities.map((quality, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-white text-green-800 rounded-full text-xs shadow-sm"
              >
                {quality}
              </span>
            ))}
          </div>
        </div>
        
        {/* Follow-up Questions */}
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-medium">Reflections for Deeper Exploration:</h3>
          <div className="space-y-2">
            {followUpQuestions.map((question, index) => (
              <button
                key={index}
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-800 transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};