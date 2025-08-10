import React, { useState } from "react";
import { motion } from "framer-motion";

interface ConfirmationProps {
  oracleName: string;
  voiceId: string;
  voiceProvider: "elevenlabs" | "sesame";
  onConfirm: () => void;
  onBack: () => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  oracleName,
  voiceId,
  voiceProvider,
  onConfirm,
  onBack,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Voice mapping for display
  const voiceMap: Record<string, { name: string; tagline: string }> = {
    "aunt-annie": { name: "Aunt Annie", tagline: "Warm & Wise" },
    "deep-sage": { name: "Deep Sage", tagline: "Contemplative & Grounded" },
    "matrix-oracle": {
      name: "Matrix Oracle",
      tagline: "Integrated & Transcendent",
    },
    "fire-essence": { name: "Fire Essence", tagline: "Passionate & Catalytic" },
    "water-flow": { name: "Water Flow", tagline: "Intuitive & Flowing" },
    "aether-whisper": { name: "Aether Whisper", tagline: "Ethereal & Unified" },
  };

  const selectedVoice = voiceMap[voiceId] || {
    name: "Unknown Voice",
    tagline: "",
  };

  const handleConfirm = async () => {
    setIsConfirming(true);

    // Simulate configuration save
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onConfirm();
  };

  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
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
              Confirm Your Configuration
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed"
            >
              Review your Oracle settings before beginning your journey.
            </motion.p>
          </div>

          {/* Configuration Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-8"
          >
            {/* Oracle Name Section */}
            <div className="bg-slate-800/30 border border-slate-600 rounded-sm p-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#F6E27F] flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Oracle Identity
                </h3>

                <div className="pl-8 space-y-2">
                  <div className="text-2xl font-light text-white">
                    {oracleName}
                  </div>
                  <div className="text-sm text-slate-400">
                    Your personal guide's chosen name
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Configuration Section */}
            <div className="bg-slate-800/30 border border-slate-600 rounded-sm p-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#F6E27F] flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.69 13.76a1 1 0 01-.31-.17 1 1 0 01-.296-.743V7.152a1 1 0 01.297-.744 1 1 0 01.309-.169l3.693-3.065z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Voice Configuration
                </h3>

                <div className="pl-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-light text-white">
                        {selectedVoice.name}
                      </div>
                      <div className="text-[#F6E27F] text-sm">
                        {selectedVoice.tagline}
                      </div>
                    </div>

                    <div
                      className={`text-xs px-3 py-1 rounded-sm ${
                        voiceProvider === "sesame"
                          ? "bg-[#F6E27F]/10 border border-[#F6E27F]/20 text-[#F6E27F]"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {voiceProvider === "sesame"
                        ? "SPIRALOGIC™"
                        : "ELEVENLABS"}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400">
                    {voiceProvider === "sesame"
                      ? "Powered by Spiralogic voice synthesis technology"
                      : "Professional voice synthesis via ElevenLabs"}
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Preview */}
            <div className="bg-gradient-to-r from-slate-800/20 to-[#F6E27F]/5 border border-[#F6E27F]/20 rounded-sm p-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#F6E27F] flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  What Happens Next
                </h3>

                <div className="pl-8 space-y-3 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#F6E27F] rounded-full mt-2"></div>
                    <div>
                      Your Oracle will be integrated into the Spiralogic system
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#F6E27F] rounded-full mt-2"></div>
                    <div>Voice synthesis will be configured and tested</div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#F6E27F] rounded-full mt-2"></div>
                    <div>
                      You'll be guided through the core interface orientation
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              disabled={isConfirming}
              className="px-6 py-3 text-slate-400 hover:text-white
                       border border-slate-600 hover:border-slate-500
                       transition-all duration-300 rounded-sm disabled:opacity-50"
            >
              ← Back
            </button>

            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`px-12 py-4 font-medium tracking-wider rounded-sm
                         transition-all duration-500 ${
                           isConfirming
                             ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                             : "bg-[#F6E27F] text-[#0E0F1B] hover:shadow-lg hover:shadow-[#F6E27F]/25 hover:bg-[#F6E27F]/90"
                         }`}
            >
              {isConfirming ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Configuring Oracle...</span>
                </div>
              ) : (
                "Begin Orientation →"
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;
