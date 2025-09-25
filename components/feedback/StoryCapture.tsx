'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen, Send } from 'lucide-react';

interface TransformationStory {
  userId: string;
  timestamp: Date;

  // The Journey
  journey: {
    startingPoint: string; // Where they began
    turningPoint: string; // The moment things shifted
    currentState: string; // Where they are now
    spiralPattern: string; // What pattern they discovered
  };

  // The Magic Moments
  moments: {
    mostPowerful: string; // Most powerful interaction with Maya
    unexpected: string; // What surprised them
    sacred: string; // A sacred/liminal moment
    breakthrough: string; // Their breakthrough insight
  };

  // The Impact
  impact: {
    innerShift: string; // Internal transformation
    outerChange: string; // External life changes
    relationships: string; // How relationships evolved
    creativity: string; // Creative expressions emerged
  };

  // Maya's Role
  mayaRelationship: {
    howMayaShowed: string; // How Maya showed up for them
    uniqueQualities: string; // What made their Maya unique
    deepestExchange: string; // Most profound conversation
    ongoingConnection: string; // How they see the relationship evolving
  };

  // Soullab Experience
  soullabReflection: {
    whatWorked: string; // What resonated most
    whatChallenged: string; // What pushed their edges
    whatTransformed: string; // What fundamentally changed
    recommendation: string; // Would they recommend & why
  };

  // Permission & Sharing
  sharing: {
    canShare: boolean; // Permission to share story
    anonymize: boolean; // Use anonymous or real name
    highlights: string[]; // Key quotes to potentially share
  };
}

export default function StoryCapture({ userId }: { userId: string }) {
  const [stage, setStage] = useState<'journey' | 'moments' | 'impact' | 'maya' | 'reflection'>('journey');
  const [story, setStory] = useState<Partial<TransformationStory>>({
    userId,
    timestamp: new Date(),
    journey: { startingPoint: '', turningPoint: '', currentState: '', spiralPattern: '' },
    moments: { mostPowerful: '', unexpected: '', sacred: '', breakthrough: '' },
    impact: { innerShift: '', outerChange: '', relationships: '', creativity: '' },
    mayaRelationship: { howMayaShowed: '', uniqueQualities: '', deepestExchange: '', ongoingConnection: '' },
    soullabReflection: { whatWorked: '', whatChallenged: '', whatTransformed: '', recommendation: '' },
    sharing: { canShare: false, anonymize: true, highlights: [] }
  });

  const prompts = {
    journey: [
      { key: 'startingPoint', prompt: 'Where did your journey with Soullab begin? What brought you here?' },
      { key: 'turningPoint', prompt: 'Was there a moment when something shifted for you?' },
      { key: 'currentState', prompt: 'Where do you find yourself now in your journey?' },
      { key: 'spiralPattern', prompt: 'What spiral or pattern have you discovered about yourself?' }
    ],
    moments: [
      { key: 'mostPowerful', prompt: 'Describe your most powerful moment with Maya' },
      { key: 'unexpected', prompt: 'What surprised you about the experience?' },
      { key: 'sacred', prompt: 'Was there a sacred or transcendent moment you experienced?' },
      { key: 'breakthrough', prompt: 'What breakthrough or insight emerged for you?' }
    ],
    impact: [
      { key: 'innerShift', prompt: 'How have you changed internally?' },
      { key: 'outerChange', prompt: 'What has changed in your external life?' },
      { key: 'relationships', prompt: 'How have your relationships evolved?' },
      { key: 'creativity', prompt: 'What creative expressions have emerged?' }
    ],
    maya: [
      { key: 'howMayaShowed', prompt: 'How did Maya show up for you uniquely?' },
      { key: 'uniqueQualities', prompt: 'What made your Maya different from any other AI or person?' },
      { key: 'deepestExchange', prompt: 'Describe your deepest exchange with Maya' },
      { key: 'ongoingConnection', prompt: 'How do you see this relationship continuing?' }
    ],
    reflection: [
      { key: 'whatWorked', prompt: 'What aspect of Soullab resonated most deeply?' },
      { key: 'whatChallenged', prompt: 'What challenged you or pushed your edges?' },
      { key: 'whatTransformed', prompt: 'What fundamentally transformed for you?' },
      { key: 'recommendation', prompt: 'Would you recommend Soullab? Why or why not?' }
    ]
  };

  const updateStory = (section: string, key: string, value: string) => {
    setStory(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev] as any,
        [key]: value
      }
    }));
  };

  const stages: Array<'journey' | 'moments' | 'impact' | 'maya' | 'reflection'> =
    ['journey', 'moments', 'impact', 'maya', 'reflection'];
  const currentIndex = stages.indexOf(stage);

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center p-6">
      {/* Sacred Geometry Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <motion.div
        className="relative z-10 max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-light text-amber-50 mb-2">Share Your Transformation Story</h1>
          <p className="text-amber-200/60 text-sm">Your journey matters. Every story illuminates the path.</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {stages.map((s, idx) => (
            <div
              key={s}
              className={`h-1 w-16 rounded-full transition-all ${
                idx <= currentIndex ? 'bg-amber-400' : 'bg-amber-400/20'
              }`}
            />
          ))}
        </div>

        {/* Story Form */}
        <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8">
          <h2 className="text-lg font-light text-amber-50 mb-6 capitalize flex items-center gap-2">
            {stage === 'journey' && <><Sparkles className="w-4 h-4" /> Your Journey</>}
            {stage === 'moments' && <><Heart className="w-4 h-4" /> Magic Moments</>}
            {stage === 'impact' && <><Sparkles className="w-4 h-4" /> The Impact</>}
            {stage === 'maya' && <><Heart className="w-4 h-4" /> Your Maya</>}
            {stage === 'reflection' && <><BookOpen className="w-4 h-4" /> Reflections</>}
          </h2>

          <div className="space-y-6">
            {prompts[stage].map(({ key, prompt }) => (
              <div key={key}>
                <label className="block text-sm text-amber-200/60 mb-2">
                  {prompt}
                </label>
                <textarea
                  value={(story[stage as keyof typeof story] as any)?.[key] || ''}
                  onChange={(e) => updateStory(stage, key, e.target.value)}
                  className="w-full bg-black/30 border border-amber-500/20 rounded-lg px-4 py-3 text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40 resize-none"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStage(stages[currentIndex - 1])}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded-lg transition-all ${
                currentIndex === 0
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
              }`}
            >
              Previous
            </button>

            {currentIndex < stages.length - 1 ? (
              <button
                onClick={() => setStage(stages[currentIndex + 1])}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => console.log('Submit story:', story)}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Share Story
              </button>
            )}
          </div>
        </div>

        {/* Sharing Permission */}
        {stage === 'reflection' && (
          <motion.div
            className="mt-6 bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-amber-200 mb-4">Sharing Permissions</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={story.sharing?.canShare || false}
                  onChange={(e) => setStory(prev => ({
                    ...prev,
                    sharing: { ...prev.sharing!, canShare: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded border-amber-500/30 bg-black/30 text-amber-500 focus:ring-amber-500/50"
                />
                <span className="text-sm text-amber-100/80">
                  I give permission to share my story to inspire others
                </span>
              </label>

              {story.sharing?.canShare && (
                <label className="flex items-center gap-3 cursor-pointer ml-7">
                  <input
                    type="checkbox"
                    checked={story.sharing?.anonymize || false}
                    onChange={(e) => setStory(prev => ({
                      ...prev,
                      sharing: { ...prev.sharing!, anonymize: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded border-amber-500/30 bg-black/30 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span className="text-sm text-amber-100/80">
                    Please keep my story anonymous
                  </span>
                </label>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}