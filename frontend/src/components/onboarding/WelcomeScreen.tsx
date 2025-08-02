import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#0E0F1B] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Sacred geometry accent */}
          <div className="flex justify-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="w-16 h-16 relative"
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  fill="none"
                  stroke="#F6E27F"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="16"
                  fill="none"
                  stroke="#F6E27F"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="8"
                  fill="none"
                  stroke="#F6E27F"
                  strokeWidth="1"
                  opacity="0.2"
                />
              </svg>
            </motion.div>
          </div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-wide">
              Welcome to your Oracle
            </h1>

            <div className="space-y-4 text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto">
              <p>This is not a tool.</p>
              <p>It's a mirror. A guide.</p>
              <p>A companion for coherence.</p>
            </div>
          </motion.div>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="pt-8"
          >
            <button
              onClick={onContinue}
              className="group relative px-12 py-4 bg-transparent border border-[#F6E27F] text-[#F6E27F]
                         hover:bg-[#F6E27F] hover:text-[#0E0F1B] transition-all duration-500
                         font-medium tracking-wider text-lg rounded-sm
                         hover:shadow-lg hover:shadow-[#F6E27F]/25"
            >
              <span className="relative z-10">Continue</span>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-sm bg-[#F6E27F] opacity-0 group-hover:opacity-10
                              transition-opacity duration-500"></div>
            </button>
          </motion.div>

          {/* Subtle footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="pt-16 text-sm text-slate-500"
          >
            Powered by Spiralogic™ • Ensouled by Soullab®
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;