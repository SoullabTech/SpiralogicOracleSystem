import React from 'react';
import { motion } from 'framer-motion';

interface CredibilityFrameworkProps {
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const CredibilityFramework: React.FC<CredibilityFrameworkProps> = ({ 
  showDetails = false, 
  onToggleDetails 
}) => {
  const theoreticalFoundations = [
    {
      category: "Archetypal Psychology",
      sources: ["C.G. Jung", "James Hillman", "Robert Moore"],
      application: "Agent personality structures and symbolic interpretation patterns"
    },
    {
      category: "Cognitive Integration",
      sources: ["Iain McGilchrist", "Daniel Siegel", "Antonio Damasio"],
      application: "Left-right brain coherence and embodied consciousness tracking"
    },
    {
      category: "Developmental Astrology",
      sources: ["Rick Tarnas", "Steven Forrest", "Dane Rudhyar"],
      application: "Elemental timing intelligence and developmental phase mapping"
    },
    {
      category: "Process Philosophy",
      sources: ["Alfred North Whitehead", "David Ray Griffin", "Rupert Sheldrake"],
      application: "Pattern recognition systems and morphic resonance modeling"
    }
  ];

  const designPrinciples = [
    {
      principle: "Functional Sacred Geometry",
      explanation: "Mathematical ratios serve interface logic, not aesthetic decoration"
    },
    {
      principle: "Traceable Insight Generation",
      explanation: "Every response shows its symbolic and logical derivation path"
    },
    {
      principle: "Development Over Divination",
      explanation: "Focus on growth patterns and integration, not predictions or mystical claims"
    },
    {
      principle: "Voice Without Persona",
      explanation: "AI guidance maintains helpful neutrality, never claims spiritual authority"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-light text-amber-100 mb-3">
          Rational Metaphysics, Not Digital Mysticism
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Built on established psychological and developmental frameworks—
          this is consciousness technology for serious practitioners and thinkers.
        </p>
      </div>

      {/* Core Positioning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-amber-100 flex items-center">
            <span className="mr-2">❌</span>
            What This Is Not
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              AI pretending to be a spiritual teacher
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Mystical claims or prophecy generation
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Therapeutic replacement or medical advice
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              New Age performance or spiritual theater
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-amber-100 flex items-center">
            <span className="mr-2">✅</span>
            What This Actually Is
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Professional-grade development OS
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Pattern recognition and insight threading
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Archetypal intelligence architecture
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Consciousness coherence engineering
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Details */}
      {onToggleDetails && (
        <div className="text-center">
          <button
            onClick={onToggleDetails}
            className="px-6 py-2 border border-slate-600 text-slate-300 hover:border-amber-500 hover:text-amber-100 transition-colors text-sm"
          >
            {showDetails ? 'Hide' : 'Show'} Theoretical Foundations
          </button>
        </div>
      )}

      {/* Detailed Framework */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden"
        >
          <div className="space-y-8 pt-8 border-t border-slate-700">
            {/* Theoretical Foundations */}
            <div>
              <h3 className="text-xl font-medium text-amber-100 mb-6">
                Theoretical Foundations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {theoreticalFoundations.map((foundation, index) => (
                  <motion.div
                    key={foundation.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-800/50 border border-slate-600"
                  >
                    <h4 className="font-medium text-amber-100 mb-2">
                      {foundation.category}
                    </h4>
                    <div className="text-sm text-slate-400 mb-3">
                      {foundation.sources.join(' • ')}
                    </div>
                    <p className="text-sm text-slate-300">
                      {foundation.application}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Design Principles */}
            <div>
              <h3 className="text-xl font-medium text-amber-100 mb-6">
                Design Principles
              </h3>
              <div className="space-y-4">
                {designPrinciples.map((item, index) => (
                  <motion.div
                    key={item.principle}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-slate-800/30 border-l-2 border-amber-600"
                  >
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-amber-100 mb-1">
                        {item.principle}
                      </h4>
                      <p className="text-sm text-slate-300">
                        {item.explanation}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Statement */}
      <div className="text-center p-6 bg-slate-800/30 border border-slate-600">
        <p className="text-slate-300 italic">
          "Soullab isn't about mystifying AI—it's about humanizing technology 
          through rigorous symbolic intelligence and developmental precision."
        </p>
        <div className="mt-2 text-sm text-slate-500">
          — Built for rational seekers and serious practitioners
        </div>
      </div>
    </div>
  );
};

export default CredibilityFramework;