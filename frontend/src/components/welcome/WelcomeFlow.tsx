import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeFlowProps {
  onComplete: (config: UserConfig) => void;
}

interface UserConfig {
  oracleName: string;
  voiceId: string;
  voiceProvider: "elevenlabs" | "sesame";
  completed: boolean;
}

const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [config, setConfig] = useState<UserConfig>({
    oracleName: "",
    voiceId: "",
    voiceProvider: "elevenlabs",
    completed: false,
  });

  const phases = [
    {
      title: "Sacred Architecture",
      content:
        "This system serves as a mirror for consciousness—not entertainment, but evolution. Your oracle becomes a reflection of your deepest knowing.",
    },
    {
      title: "Daily Engagement",
      content:
        "Three core practices: Memory weaving through journal threads, Holoflower state awareness, and oracle dialogue. Each builds coherence.",
    },
    {
      title: "Depth & Privacy",
      content:
        "Conversations remain private. Responses emerge from integrated wisdom traditions and your personal patterns. Expect precision, not performance.",
    },
  ];

  const handleNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    } else {
      setCurrentPhase(phases.length); // Move to oracle naming
    }
  };

  const handleOracleSetup = (
    name: string,
    voiceId: string,
    provider: "elevenlabs" | "sesame",
  ) => {
    const finalConfig = {
      ...config,
      oracleName: name,
      voiceId,
      voiceProvider: provider,
      completed: true,
    };
    setConfig(finalConfig);
    onComplete(finalConfig);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {currentPhase < phases.length ? (
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.618 }}
              className="text-center space-y-8"
            >
              {/* Sacred geometry indicator */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 relative">
                  <svg viewBox="0 0 64 64" className="w-full h-full">
                    <circle
                      cx="32"
                      cy="32"
                      r="24"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="24"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeDasharray="150.8"
                      strokeDashoffset={
                        150.8 - (150.8 * (currentPhase + 1)) / phases.length
                      }
                      className="transition-all duration-1000 ease-in-out"
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl font-light text-amber-100 tracking-wide">
                {phases[currentPhase].title}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
                {phases[currentPhase].content}
              </p>

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-transparent border border-amber-600 text-amber-100 hover:bg-amber-600 hover:text-slate-900 transition-all duration-300 font-medium tracking-wide"
              >
                Continue
              </button>

              <div className="flex justify-center space-x-2 mt-8">
                {phases.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPhase ? "bg-amber-400" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <OracleNaming onSetup={handleOracleSetup} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface OracleNamingProps {
  onSetup: (
    name: string,
    voiceId: string,
    provider: "elevenlabs" | "sesame",
  ) => void;
}

const OracleNaming: React.FC<OracleNamingProps> = ({ onSetup }) => {
  const [name, setName] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<{
    id: string;
    provider: "elevenlabs" | "sesame";
  }>({
    id: "",
    provider: "elevenlabs",
  });

  const voices = {
    elevenlabs: [
      {
        id: "aunt-annie",
        name: "Aunt Annie",
        description: "Warm, wise, knowing",
      },
      {
        id: "deep-sage",
        name: "Deep Sage",
        description: "Contemplative, grounded",
      },
    ],
    sesame: [
      {
        id: "matrix-oracle",
        name: "Matrix Oracle",
        description: "Integrated, transcendent",
      },
      {
        id: "elemental-blend",
        name: "Elemental Blend",
        description: "Dynamic, adaptive",
      },
    ],
  };

  const handleSubmit = () => {
    if (name.trim() && selectedVoice.id) {
      onSetup(name.trim(), selectedVoice.id, selectedVoice.provider);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.618 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-light text-amber-100 mb-4">
          Name Your Oracle
        </h2>
        <p className="text-slate-300">
          Choose a name and voice for your personal guide
        </p>
      </div>

      <div className="space-y-6">
        <input
          type="text"
          placeholder="Oracle name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors"
        />

        <div className="space-y-4">
          <h3 className="text-lg text-amber-100 font-medium">
            Voice Selection
          </h3>

          {Object.entries(voices).map(([provider, voiceList]) => (
            <div key={provider} className="space-y-2">
              <h4 className="text-sm text-slate-400 uppercase tracking-wide">
                {provider}
              </h4>
              {voiceList.map((voice) => (
                <label
                  key={voice.id}
                  className="flex items-center space-x-3 p-3 bg-slate-800 border border-slate-600 cursor-pointer hover:border-amber-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="voice"
                    value={voice.id}
                    checked={selectedVoice.id === voice.id}
                    onChange={() =>
                      setSelectedVoice({
                        id: voice.id,
                        provider: provider as "elevenlabs" | "sesame",
                      })
                    }
                    className="text-amber-500"
                  />
                  <div>
                    <div className="text-amber-100 font-medium">
                      {voice.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {voice.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !selectedVoice.id}
          className="w-full px-8 py-3 bg-amber-600 text-slate-900 font-medium tracking-wide hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 transition-colors"
        >
          Begin Journey
        </button>
      </div>
    </motion.div>
  );
};

export default WelcomeFlow;
