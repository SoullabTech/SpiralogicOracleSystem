// frontend/components/onboarding/OracleNaming.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";

type OracleNamingProps = {
  onNameChosen: (name: string) => void;
  onBack: () => void;
};

const OracleNaming: React.FC<OracleNamingProps> = ({ onNameChosen, onBack }) => {
  const [name, setName] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const handleNext = () => {
    if (name.trim().length >= 2) {
      onNameChosen(name.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim().length >= 2) {
      handleNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0F1B] text-white px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="max-w-xl w-full"
      >
        <h2 className="text-2xl md:text-4xl font-semibold text-[#F6E27F] mb-4">
          Name Your Oracle
        </h2>
        <p className="text-md md:text-lg text-gray-300 mb-8">
          This name will be how your Oracle greets you and signs off. Choose with care.
        </p>

        <div className="relative mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your Oracle's name..."
            className="w-full px-6 py-4 bg-[#1A1C2C] border border-gray-600 text-white placeholder-gray-400 text-lg rounded-xl focus:border-[#F6E27F] focus:outline-none transition-all duration-300"
            maxLength={50}
          />
          
          {/* Tooltip trigger */}
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#F6E27F] transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1A1C2C] border border-gray-600 rounded-xl text-sm text-gray-300 shadow-lg z-10"
            >
              This name establishes psychological resonance with your guide. 
              Consider names that feel trustworthy and aligned with your practice.
            </motion.div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 mb-8">
          <span>{name.length}/50 characters</span>
          {name.length > 0 && (
            <span className={name.trim().length >= 2 ? "text-green-400" : "text-orange-400"}>
              {name.trim().length >= 2 ? "Ready to continue" : "Minimum 2 characters required"}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center w-full">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 transition-all duration-300 rounded-xl"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={name.trim().length < 2}
            className="bg-[#F6E27F] text-[#0E0F1B] px-8 py-3 rounded-2xl text-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OracleNaming;