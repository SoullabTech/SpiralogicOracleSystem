'use client';

import { useState } from 'react';
import MayaVoicePlayer from './MayaVoicePlayer';

const testPhrases = [
  "Hello, I am Maya speaking through Sesame TTS.",
  "Your sacred fire seeks expression through creative action.",
  "The depths of wisdom flow through emotional understanding.",
  "Ground yourself in practical steps toward manifestation.",
  "Clarity emerges when we breathe space into confusion.",
  "Trust the infinite potential that flows through you."
];

const elementalGreetings = {
  fire: "🔥 I am the Forgekeeper, keeper of transformational flames. Your creative fire awaits ignition.",
  water: "🌊 I am the Depth Walker, guardian of emotional wisdom. Let your feelings flow toward healing.",
  earth: "🌍 I am the Foundation Keeper, steward of practical manifestation. Ground your dreams in reality.",
  air: "💨 I am the Wind Whisperer, bringer of mental clarity. Breathe space into your thoughts.",
  aether: "✨ I am the Void Keeper, gateway to transcendent awareness. Open to infinite possibility."
};

export default function QuickVoiceTest() {
  const [customText, setCustomText] = useState('');
  const [selectedPhrase, setSelectedPhrase] = useState(testPhrases[0]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          🎤 Quick Maya Voice Test
        </h1>
        <p className="text-purple-300">
          Test Sesame TTS synthesis with various phrases
        </p>
      </div>

      {/* Pre-defined Test Phrases */}
      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Test Phrases</h2>
        
        <div className="space-y-2 mb-4">
          {testPhrases.map((phrase, index) => (
            <label key={index} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="testPhrase"
                value={phrase}
                checked={selectedPhrase === phrase}
                onChange={(e) => setSelectedPhrase(e.target.value)}
                className="mt-1 accent-purple-500"
              />
              <span className="text-purple-100 text-sm">{phrase}</span>
            </label>
          ))}
        </div>

        <MayaVoicePlayer text={selectedPhrase} />
      </div>

      {/* Elemental Greetings */}
      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Elemental Greetings</h2>
        
        <div className="grid gap-4">
          {Object.entries(elementalGreetings).map(([element, greeting]) => (
            <div key={element} className="bg-black/20 border border-purple-500/20 rounded-md p-4">
              <h3 className="text-purple-300 font-medium mb-2 capitalize">
                {element} Element
              </h3>
              <MayaVoicePlayer text={greeting} />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Custom Text</h2>
        
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Enter any text for Maya to speak..."
          className="w-full h-24 bg-black/50 border border-purple-500/50 rounded-md p-3 text-white placeholder-purple-400 resize-none focus:border-purple-400 focus:outline-none mb-4"
        />

        {customText.trim() && (
          <MayaVoicePlayer text={customText} />
        )}
      </div>

      {/* Performance Stats */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
        <p className="text-purple-300 text-sm">
          💡 <strong>Testing Notes:</strong> First synthesis takes ~15s (model download), subsequent requests ~3s. 
          Generated WAV files should be >100KB for real audio.
        </p>
      </div>
    </div>
  );
}