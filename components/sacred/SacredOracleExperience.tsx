// Sacred Oracle Experience - Unified interface combining check-ins with Claude guidance
import React, { useState, useEffect } from 'react';
import { SacredHoloflower } from './SacredHoloflower';
import { HoloflowerMotionWithAudio } from './HoloflowerMotionWithAudio';
import { useSacredOracle } from '@/hooks/useSacredOracle';
import { getFacetById } from '@/data/spiralogic-facets';
import { SacredMicButton } from '@/components/ui/SacredMicButton';
import { AudioToggle, type AudioState } from '@/components/ui/AudioToggle';
import { HoloflowerLogo } from '@/components/branding/HoloflowerLogo';
import { HoloflowerWatermark } from '@/components/branding/HoloflowerWatermark';

export const SacredOracleExperience: React.FC = () => {
  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    // Set portal state to idle after initial bloom
    setTimeout(() => setPortalState('idle'), 2000);
  }, []);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'divination' | 'consultation'>('divination');
  const [voiceActive, setVoiceActive] = useState(false);
  const [motionState, setMotionState] = useState<any>({
    state: 'listening',
    coherence: 0.5,
    shadowPetals: [],
    aetherStage: 1,
    frequency: 528
  });
  const [sacredResponse, setSacredResponse] = useState<string>('');
  const [audioState, setAudioState] = useState<'on' | 'silent' | 'off'>('on');
  const [isMobile, setIsMobile] = useState(false);
  const [portalState, setPortalState] = useState<'entering' | 'idle' | 'exiting'>('entering');
  const [currentElement, setCurrentElement] = useState<string>('aether');
  const [shadowDetected, setShadowDetected] = useState(false);
  
  const {
    loading,
    error,
    oracleResponse,
    checkIns,
    sessionHistory,
    consultOracle,
    toggleCheckIn,
    clearCheckIns,
    combinedGuidance,
    elementalBalance,
    journeyArc
  } = useSacredOracle();

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    
    await consultOracle(query);
    setQuery('');
    setMode('consultation');
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setVoiceActive(true);
    setMotionState(prev => ({ ...prev, state: 'processing' }));
    
    try {
      const response = await fetch('/api/sacred-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      
      const data = await response.json();
      setSacredResponse(data.oracle.oracleResponse);
      setMotionState(data.motion);
      setMode('consultation');
      
      // Update element and shadow detection
      if (data.intent?.element) setCurrentElement(data.intent.element);
      if (data.intent?.shadowPetals?.length > 0) {
        setShadowDetected(true);
        setTimeout(() => setShadowDetected(false), 3000);
      }
    } catch (err) {
      console.error('Sacred Portal error:', err);
    } finally {
      setTimeout(() => setVoiceActive(false), 3000);
    }
  };


  const handlePetalClick = (facetId: string) => {
    toggleCheckIn(facetId);
    setMode('divination');
  };

  return (
    <div className="sacred-oracle-experience min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Watermark */}
      <HoloflowerWatermark 
        mode={isMobile ? 'dark' : 'light'}
        aetherPulse={motionState.aetherStage > 0}
        coherenceLevel={motionState.coherence}
        shadowActive={shadowDetected}
      />
      {/* Header with Logo */}
      <div className="text-center py-8 px-4 relative z-10">
        <HoloflowerLogo 
          state={portalState}
          size={isMobile ? 100 : 140}
          coherenceLevel={motionState.coherence}
          shadowDetected={shadowDetected}
        />
        <h1 className="text-4xl font-light text-purple-900 mb-2 mt-4">
          Sacred Oracle
        </h1>
        <p className="text-gray-600">
          Divine through the Spiralogic Holoflower
        </p>
        
        {/* Audio Toggle - Top Right */}
        <div className="absolute top-4 right-4">
          <AudioToggle
            state={audioState}
            onChange={(state: AudioState) => setAudioState(state)}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left: Sacred Holoflower or Motion */}
          <div className="flex flex-col items-center">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 relative">
              {voiceActive || motionState.state !== 'listening' ? (
                <HoloflowerMotionWithAudio
                  motionState={motionState}
                  audioState={audioState}
                  volume={0.05}
                  enableHaptics={true}
                  isMobile={isMobile}
                />
              ) : (
                <SacredHoloflower
                  activeFacetId={oracleResponse?.primaryFacetId}
                  userCheckIns={checkIns}
                  onPetalClick={handlePetalClick}
                  size={450}
                  showLabels={true}
                  interactive={true}
                />
              )}
              
              {/* Sacred Mic Button with Elemental Aura */}
              <div className="absolute bottom-4 right-4">
                <SacredMicButton
                  onTranscript={handleVoiceTranscript}
                  isActive={voiceActive}
                  auraElement={currentElement}
                  coherenceLevel={motionState.coherence}
                  shadowDetected={shadowDetected}
                />
              </div>
              
              {/* Elemental Balance Indicator */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-center text-gray-500 uppercase tracking-wider">
                  Elemental Balance
                </p>
                <div className="flex justify-between gap-2">
                  {Object.entries(elementalBalance).map(([element, value]) => (
                    <div key={element} className="flex-1">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000
                            ${element === 'fire' ? 'bg-gradient-to-r from-red-400 to-orange-400' :
                              element === 'water' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                              element === 'earth' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                              element === 'air' ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                              'bg-gradient-to-r from-purple-400 to-pink-400'}`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-600 capitalize">
                        {element}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={clearCheckIns}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 
                           rounded-lg transition-colors"
                >
                  Clear Petals
                </button>
                <button
                  onClick={() => setMode(mode === 'divination' ? 'consultation' : 'divination')}
                  className="px-4 py-2 text-sm bg-purple-100 hover:bg-purple-200 
                           text-purple-700 rounded-lg transition-colors"
                >
                  {mode === 'divination' ? 'Ask Oracle' : 'Divine Petals'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Oracle Interface */}
          <div className="space-y-6">
            {/* Query Input */}
            <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-6">
              <form onSubmit={handleConsultation}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consult the Oracle
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What wisdom do you seek?"
                  className="w-full p-4 border border-purple-200 rounded-lg 
                           focus:border-purple-400 focus:outline-none resize-none h-24"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="mt-3 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                           text-white rounded-lg font-medium hover:from-purple-700 
                           hover:to-indigo-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Consulting Oracle...' : 'Receive Guidance'}
                </button>
              </form>
            </div>

            {/* Sacred Voice Response */}
            {sacredResponse && voiceActive && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 
                            animate-in fade-in duration-500 border border-purple-200">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 
                               bg-clip-text text-transparent">
                    Sacred Voice Oracle
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs bg-gradient-to-r 
                                 from-purple-500 to-indigo-500 text-white">
                    {motionState.state.toUpperCase()} • {motionState.frequency} Hz
                  </span>
                </div>
                <div className="border-l-4 border-gradient-to-b from-purple-400 to-indigo-400 pl-4">
                  <p className="text-gray-800 leading-relaxed italic">
                    {sacredResponse}
                  </p>
                </div>
              </div>
            )}

            {/* Oracle Response */}
            {oracleResponse && mode === 'consultation' && !voiceActive && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-6 
                            animate-in fade-in duration-500">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-purple-900">
                    Oracle Speaks
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs text-white
                    ${getFacetById(oracleResponse.primaryFacetId).element === 'fire' ? 'bg-red-400' :
                      getFacetById(oracleResponse.primaryFacetId).element === 'water' ? 'bg-blue-400' :
                      getFacetById(oracleResponse.primaryFacetId).element === 'earth' ? 'bg-green-400' :
                      'bg-yellow-500'}`}>
                    {getFacetById(oracleResponse.primaryFacetId).element.toUpperCase()} • 
                    Stage {getFacetById(oracleResponse.primaryFacetId).stage}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Primary Guidance */}
                  <div className="border-l-4 border-purple-400 pl-4">
                    <p className="text-gray-800 leading-relaxed">
                      {oracleResponse.guidance}
                    </p>
                  </div>

                  {/* Essence */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Essence</p>
                    <p className="text-gray-800 italic">
                      {oracleResponse.interpretation.essence}
                    </p>
                  </div>

                  {/* Practice */}
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">Practice</p>
                    <p className="text-purple-700">
                      {oracleResponse.interpretation.practice}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {oracleResponse.interpretation.keywords.map(keyword => (
                        <span key={keyword} className="px-2 py-1 bg-gray-100 
                                                     rounded text-xs text-gray-600">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Archetype */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Archetype:</span> {oracleResponse.interpretation.archetype}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Divination Guidance (from check-ins) */}
            {combinedGuidance && mode === 'divination' && combinedGuidance.activeFacetCount > 0 && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-medium text-purple-900 mb-4">
                  Petal Divination
                </h3>

                <div className="space-y-4">
                  {/* Active Elements */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Active Elements</p>
                    <div className="flex gap-2">
                      {combinedGuidance.dominantElements.map(element => (
                        <span key={element} className={`px-3 py-1 rounded-full text-xs text-white
                          ${element === 'fire' ? 'bg-red-400' :
                            element === 'water' ? 'bg-blue-400' :
                            element === 'earth' ? 'bg-green-400' :
                            'bg-yellow-500'}`}>
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Combined Practices */}
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Suggested Practices</p>
                    <ul className="space-y-2">
                      {combinedGuidance.combinedPractices.map((practice, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-purple-400 mr-2">•</span>
                          <span className="text-sm text-gray-700">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Unified Keywords */}
                  <div className="flex flex-wrap gap-2">
                    {combinedGuidance.unifiedKeywords.map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-purple-50 
                                                   rounded text-xs text-purple-600">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Journey Arc */}
            {journeyArc && sessionHistory.length >= 2 && (
              <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Your Journey Arc
                </h3>
                <div className="flex items-center gap-2">
                  {journeyArc.elementProgression.slice(-5).map((element, i) => (
                    <React.Fragment key={i}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
                        ${element === 'fire' ? 'bg-red-400' :
                          element === 'water' ? 'bg-blue-400' :
                          element === 'earth' ? 'bg-green-400' :
                          'bg-yellow-500'}`}>
                        {element[0].toUpperCase()}{journeyArc.stageProgression[i]}
                      </div>
                      {i < journeyArc.elementProgression.slice(-5).length - 1 && (
                        <span className="text-gray-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {journeyArc.isDeepening && 'You are deepening into mastery. '}
                  {journeyArc.isShifting && 'You are shifting between elements. '}
                  Currently in {journeyArc.currentElement} at stage {journeyArc.currentStage}.
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SacredOracleExperience;