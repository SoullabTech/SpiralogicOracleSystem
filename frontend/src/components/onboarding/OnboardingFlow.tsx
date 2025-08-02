// frontend/components/onboarding/OnboardingFlow.tsx

import React, { useEffect, useState } from "react";
import OracleNaming from "./OracleNaming";
import VoiceSelection from "./VoiceSelection";
import { motion } from "framer-motion";
import { useOracleConfig } from "../../hooks/useOracleConfig";

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [oracleName, setOracleName] = useState<string>("");
  const [oracleVoice, setOracleVoice] = useState<string>("");

  const { config, isLoading, saveConfig, isConfigured } = useOracleConfig();

  // Check if already configured on mount
  useEffect(() => {
    if (!isLoading && isConfigured) {
      setOracleName(config.oracleName);
      setOracleVoice(config.oracleVoice);
      setStep(3);
    }
  }, [isLoading, isConfigured, config]);

  const handleNameConfirmed = async (name: string) => {
    setOracleName(name);
    // Save immediately to localStorage (hook handles Supabase sync)
    localStorage.setItem("oracleName", name);
    setStep(2);
  };

  const handleVoiceChosen = async (voiceId: string) => {
    setOracleVoice(voiceId);

    // Save complete configuration
    const finalConfig = {
      oracleName,
      oracleVoice: voiceId,
    };

    try {
      await saveConfig(finalConfig);
      localStorage.setItem("oracleVoice", voiceId);
      setStep(3);

      // Auto-complete after 3 seconds
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    } catch (error) {
      console.error('Failed to save Oracle configuration:', error);
      // Still proceed to step 3 since localStorage worked
      setStep(3);
    }
  };

  // Show loading state while checking configuration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E0F1B] text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-[#F6E27F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your Oracle...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F1B] text-white flex items-center justify-center px-4">
      {/* Progress indicator */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-3 px-4 py-2 bg-[#1A1C2C]/80 backdrop-blur-sm border border-gray-600 rounded-xl">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  stepNum < step
                    ? "bg-[#F6E27F]"
                    : stepNum === step
                    ? "bg-[#F6E27F] ring-2 ring-[#F6E27F]/30"
                    : "bg-gray-600"
                }`}
              />
              {stepNum < 3 && (
                <div
                  className={`w-6 h-0.5 mx-2 transition-all duration-300 ${
                    stepNum < step ? "bg-[#F6E27F]" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 1 && <OracleNaming onNameConfirmed={handleNameConfirmed} />}
      {step === 2 && <VoiceSelection onVoiceChosen={handleVoiceChosen} />}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#F6E27F] mb-4">
            Welcome to your Oracle
          </h2>
          <p className="text-xl text-gray-200 mb-6">
            You've chosen <strong>{oracleName}</strong> with the{" "}
            <strong>{oracleVoice}</strong> voice.
          </p>
          <p className="text-md text-gray-400 mb-8">
            Let's begin your daily journey inward.
          </p>

          {/* Auto-advance progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
            className="w-full h-1 bg-[#F6E27F] mx-auto max-w-xs rounded-full"
          />
          <p className="text-xs text-gray-500 mt-2">
            Starting in 3 seconds...
          </p>
        </motion.div>
      )}

      {/* Development debug panel */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 p-3 bg-[#1A1C2C]/90 border border-gray-600 rounded text-xs text-gray-400 font-mono">
          <div>Step: {step}/3</div>
          <div>Oracle: {oracleName || "Not set"}</div>
          <div>Voice: {oracleVoice || "Not selected"}</div>
          <div>Configured: {isConfigured ? "Yes" : "No"}</div>
          <div>Loading: {isLoading ? "Yes" : "No"}</div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;