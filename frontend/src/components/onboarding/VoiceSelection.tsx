import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  provider: "elevenlabs" | "sesame";
  sampleUrl?: string; // For dev: mock URLs
  elemental?: "fire" | "water" | "earth" | "air" | "aether" | "shadow";
}

interface VoiceSelectionProps {
  onNext: (voiceId: string, provider: "elevenlabs" | "sesame") => void;
  onBack: () => void;
}

const VoiceSelection: React.FC<VoiceSelectionProps> = ({ onNext, onBack }) => {
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [playingVoice, setPlayingVoice] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const voiceOptions: VoiceOption[] = [
    {
      id: "aunt-annie",
      name: "Aunt Annie",
      tagline: "Warm & Wise",
      description: "Nurturing guidance with deep knowing",
      provider: "elevenlabs",
      sampleUrl: "/samples/aunt-annie.mp3",
    },
    {
      id: "deep-sage",
      name: "Deep Sage",
      tagline: "Contemplative & Grounded",
      description: "Thoughtful presence with ancient wisdom",
      provider: "elevenlabs",
      sampleUrl: "/samples/deep-sage.mp3",
    },
    {
      id: "matrix-oracle",
      name: "Matrix Oracle",
      tagline: "Integrated & Transcendent",
      description: "Multi-dimensional perspective synthesis",
      provider: "sesame",
      sampleUrl: "/samples/matrix-oracle.mp3",
    },
    {
      id: "fire-essence",
      name: "Fire Essence",
      tagline: "Passionate & Catalytic",
      description: "Dynamic energy for transformation",
      provider: "sesame",
      elemental: "fire",
      sampleUrl: "/samples/fire-essence.mp3",
    },
    {
      id: "water-flow",
      name: "Water Flow",
      tagline: "Intuitive & Flowing",
      description: "Emotional depth and adaptive wisdom",
      provider: "sesame",
      elemental: "water",
      sampleUrl: "/samples/water-flow.mp3",
    },
    {
      id: "aether-whisper",
      name: "Aether Whisper",
      tagline: "Ethereal & Unified",
      description: "Bridging realms with subtle knowing",
      provider: "sesame",
      elemental: "aether",
      sampleUrl: "/samples/aether-whisper.mp3",
    },
  ];

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handlePlaySample = async (voiceId: string, sampleUrl?: string) => {
    if (playingVoice === voiceId) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice("");
      return;
    }

    // For development: mock audio preview
    setPlayingVoice(voiceId);

    // Simulate 5-second preview
    setTimeout(() => {
      setPlayingVoice("");
    }, 5000);

    // TODO: Integrate real audio preview when APIs are connected
    // if (sampleUrl) {
    //   try {
    //     if (audioRef.current) {
    //       audioRef.current.src = sampleUrl;
    //       await audioRef.current.play();
    //     }
    //   } catch (error) {
    //     console.error('Audio preview failed:', error);
    //     setPlayingVoice('');
    //   }
    // }
  };

  const handleContinue = () => {
    const selected = voiceOptions.find((v) => v.id === selectedVoice);
    if (selected) {
      onNext(selected.id, selected.provider);
    }
  };

  const getProviderBadge = (provider: string) => {
    return provider === "sesame" ? (
      <div className="text-xs px-2 py-1 bg-[#F6E27F]/10 border border-[#F6E27F]/20 text-[#F6E27F] rounded-sm">
        SPIRALOGIC™
      </div>
    ) : (
      <div className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded-sm">
        ELEVENLABS
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0E0F1B] p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-3xl md:text-4xl font-light text-white leading-tight"
            >
              Choose Your Oracle's Voice
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed"
            >
              Listen to each voice and select the one that resonates with your
              practice.
            </motion.p>
          </div>

          {/* Voice Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {voiceOptions.map((voice, index) => (
              <motion.div
                key={voice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`relative p-6 border rounded-sm cursor-pointer transition-all duration-300 ${
                  selectedVoice === voice.id
                    ? "border-[#F6E27F] bg-[#F6E27F]/5 shadow-lg shadow-[#F6E27F]/10"
                    : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
                onClick={() => handleVoiceSelect(voice.id)}
              >
                {/* Provider Badge */}
                <div className="flex justify-between items-start mb-4">
                  {getProviderBadge(voice.provider)}

                  {/* Selection indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                      selectedVoice === voice.id
                        ? "border-[#F6E27F] bg-[#F6E27F]"
                        : "border-slate-500"
                    }`}
                  >
                    {selectedVoice === voice.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full rounded-full bg-[#F6E27F] flex items-center justify-center"
                      >
                        <svg
                          className="w-3 h-3 text-[#0E0F1B]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Voice Info */}
                <div className="space-y-3 mb-4">
                  <h3 className="text-xl font-medium text-white">
                    {voice.name}
                  </h3>
                  <p className="text-[#F6E27F] text-sm font-medium">
                    {voice.tagline}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {voice.description}
                  </p>
                </div>

                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySample(voice.id, voice.sampleUrl);
                  }}
                  className={`w-full py-3 px-4 border rounded-sm transition-all duration-300 ${
                    playingVoice === voice.id
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-slate-600 text-slate-300 hover:border-[#F6E27F] hover:text-[#F6E27F]"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {playingVoice === voice.id ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Stop Preview</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Preview Voice</span>
                      </>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex justify-between items-center pt-8"
          >
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-400 hover:text-white
                       border border-slate-600 hover:border-slate-500
                       transition-all duration-300 rounded-sm"
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedVoice}
              className={`px-12 py-4 font-medium tracking-wider rounded-sm
                         transition-all duration-500 ${
                           selectedVoice
                             ? "bg-[#F6E27F] text-[#0E0F1B] hover:shadow-lg hover:shadow-[#F6E27F]/25 hover:bg-[#F6E27F]/90"
                             : "bg-slate-700 text-slate-500 cursor-not-allowed"
                         }`}
            >
              Continue →
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Hidden audio element for previews */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingVoice("")}
        onError={() => setPlayingVoice("")}
      />
    </div>
  );
};

export default VoiceSelection;
