'use client';

import { useState, useCallback } from 'react';
import MayaVoicePlayer from './MayaVoicePlayer';
import { ElementalType, SpiralPhase, UserEmotionalState } from '@/src/types';

interface OracleResponse {
  element: ElementalType;
  phase: SpiralPhase;
  tone: 'insight' | 'symbolic';
  response: string;
  guidance: string;
  ritualSuggestion?: string;
}

interface OracleVoiceInterfaceProps {
  className?: string;
}

export default function OracleVoiceInterface({ className = '' }: OracleVoiceInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [emotionalState, setEmotionalState] = useState<UserEmotionalState>('curious');
  const [preferredTone, setPreferredTone] = useState<'insight' | 'symbolic'>('insight');
  const [isProcessing, setIsProcessing] = useState(false);
  const [oracleResponse, setOracleResponse] = useState<OracleResponse | null>(null);

  // Simulate Oracle response generation (replace with actual Oracle system)
  const generateOracleResponse = useCallback(async (
    input: string, 
    emotion: UserEmotionalState, 
    tone: 'insight' | 'symbolic'
  ): Promise<OracleResponse> => {
    // This would integrate with your optimized Oracle system
    // For demo purposes, we'll create a mock response
    
    const elements: ElementalType[] = ['fire', 'water', 'earth', 'air', 'aether'];
    const phases: SpiralPhase[] = ['initiation', 'expansion', 'integration', 'mastery'];
    
    const element = elements[Math.floor(Math.random() * elements.length)];
    const phase = phases[Math.floor(Math.random() * phases.length)];
    
    const responses = {
      insight: {
        fire: "The creative energy within you seeks expression. This feeling of being stuck often indicates that your authentic self is ready to break through old patterns. Consider what small action would honor your true desires today.",
        water: "Your emotional landscape is shifting, and that's natural. The overwhelm you're experiencing might be your psyche's way of processing deeper changes. What if you honored these feelings without trying to fix them immediately?",
        earth: "This sense of being lost often precedes finding solid ground. Your practical wisdom is developing, even when it doesn't feel that way. What one concrete step could you take toward stability today?",
        air: "Mental clarity emerges when we stop forcing solutions. Your mind is processing complex information right now. Sometimes stepping back and breathing creates the space for insights to arise naturally.",
        aether: "You're experiencing a transition between different levels of consciousness. This disorientation is part of expanding beyond your current understanding. Trust that you're being guided toward greater awareness."
      },
      symbolic: {
        fire: "Your inner Phoenix stirs in the ashes of who you thought you should be. The sacred flames of transformation await your permission to burn away what no longer serves. What old skin is ready to be shed in the fire of becoming?",
        water: "You stand at the shore of deeper knowing, where the tides of emotion meet the vast ocean of wisdom. The waters within you are not chaotic—they seek their natural flow toward healing and truth.",
        earth: "The Seed of your true self rests in the fertile darkness, gathering strength for emergence. Even the mightiest oak begins invisible in the soil. What wants to grow through you in this season of becoming?",
        air: "The Winds of Change whisper secrets your logical mind cannot yet hear. Your spirit soars beyond the clouds of confusion, seeing patterns that will soon become clear to your earthbound awareness.",
        aether: "You dance at the threshold between worlds, where the Cosmic Web weaves new possibilities. This void is not emptiness but infinite potential waiting for your conscious choice to birth new realities."
      }
    };

    const guidanceMap = {
      fire: "Embrace creative action, even small steps",
      water: "Honor your emotional process with compassion", 
      earth: "Focus on practical foundations and stability",
      air: "Seek clarity through mindful reflection",
      aether: "Trust the larger process of transformation"
    };

    const rituals = {
      fire: "Light a candle and write down what you want to release, then safely burn the paper",
      water: "Take a mindful bath or shower, imagining emotional cleansing",
      earth: "Spend time in nature, feeling your connection to the ground",
      air: "Practice conscious breathing for 5-10 minutes",
      aether: "Sit in meditation, opening to spacious awareness"
    };

    return {
      element,
      phase,
      tone,
      response: responses[tone][element],
      guidance: guidanceMap[element],
      ritualSuggestion: rituals[element]
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    
    try {
      const response = await generateOracleResponse(userInput, emotionalState, preferredTone);
      setOracleResponse(response);
    } catch (error) {
      console.error('Oracle response generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [userInput, emotionalState, preferredTone, generateOracleResponse]);

  const elementColors = {
    fire: 'from-red-500 to-orange-500',
    water: 'from-blue-500 to-teal-500', 
    earth: 'from-green-500 to-brown-500',
    air: 'from-sky-500 to-indigo-500',
    aether: 'from-purple-500 to-violet-500'
  };

  const elementIcons = {
    fire: '🔥',
    water: '🌊', 
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };

  return (
    <div className={`oracle-voice-interface max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🔮 Oracle Voice Interface
        </h1>
        <p className="text-purple-300">
          Speak with Maya through the Elemental Wisdom Keepers
        </p>
      </div>

      {/* User Input Section */}
      <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Question</h2>
        
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What guidance do you seek? Share your current challenge, feeling, or question..."
          className="w-full h-32 bg-black/50 border border-purple-500/50 rounded-md p-3 text-white placeholder-purple-400 resize-none focus:border-purple-400 focus:outline-none"
        />

        {/* Emotional State Selection */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Current Emotional State:
            </label>
            <select
              value={emotionalState}
              onChange={(e) => setEmotionalState(e.target.value as UserEmotionalState)}
              className="w-full bg-black/50 border border-purple-500/50 rounded-md p-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="curious">Curious</option>
              <option value="overwhelmed">Overwhelmed</option>
              <option value="anxious">Anxious</option>
              <option value="confused">Confused</option>
              <option value="hopeful">Hopeful</option>
              <option value="frustrated">Frustrated</option>
              <option value="peaceful">Peaceful</option>
              <option value="excited">Excited</option>
              <option value="depressed">Sad/Depressed</option>
              <option value="angry">Angry</option>
              <option value="lonely">Lonely</option>
              <option value="transforming">Transforming</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-300 text-sm font-medium mb-2">
              Preferred Response Style:
            </label>
            <select
              value={preferredTone}
              onChange={(e) => setPreferredTone(e.target.value as 'insight' | 'symbolic')}
              className="w-full bg-black/50 border border-purple-500/50 rounded-md p-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="insight">🧠 Insight - Clear psychological guidance</option>
              <option value="symbolic">🔮 Symbolic - Archetypal wisdom & metaphor</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isProcessing}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-md font-medium transition-all duration-200 flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Consulting the Oracle...
            </>
          ) : (
            <>
              🔮 Receive Oracle Guidance
            </>
          )}
        </button>
      </div>

      {/* Oracle Response Section */}
      {oracleResponse && (
        <div className="bg-black/30 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${elementColors[oracleResponse.element]} rounded-full flex items-center justify-center text-2xl`}>
              {elementIcons[oracleResponse.element]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {oracleResponse.element.charAt(0).toUpperCase() + oracleResponse.element.slice(1)} Wisdom
              </h2>
              <p className="text-purple-300 text-sm">
                {oracleResponse.phase.charAt(0).toUpperCase() + oracleResponse.phase.slice(1)} Phase • {oracleResponse.tone.charAt(0).toUpperCase() + oracleResponse.tone.slice(1)} Mode
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Oracle Response Text */}
            <div className="bg-black/30 border border-purple-500/20 rounded-md p-4">
              <p className="text-purple-100 leading-relaxed">
                {oracleResponse.response}
              </p>
            </div>

            {/* Guidance */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-md p-3">
              <h4 className="text-blue-300 font-medium mb-2">🎯 Guidance:</h4>
              <p className="text-blue-100">{oracleResponse.guidance}</p>
            </div>

            {/* Ritual Suggestion */}
            {oracleResponse.ritualSuggestion && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-md p-3">
                <h4 className="text-green-300 font-medium mb-2">🕯️ Suggested Practice:</h4>
                <p className="text-green-100">{oracleResponse.ritualSuggestion}</p>
              </div>
            )}

            {/* Maya Voice Player */}
            <div className="mt-6">
              <MayaVoicePlayer
                text={oracleResponse.response}
                autoPlay={false}
                onSynthesisStart={() => console.log('Maya synthesis started')}
                onSynthesisComplete={(audioUrl) => console.log('Maya synthesis complete:', audioUrl)}
                onPlayStart={() => console.log('Maya speaking started')}
                onPlayEnd={() => console.log('Maya speaking ended')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
        <p className="text-purple-300 text-sm">
          💡 <strong>How it works:</strong> Share your question → Oracle selects elemental wisdom → Maya synthesizes response via Sesame TTS → You hear the guidance with sacred voice
        </p>
      </div>
    </div>
  );
}