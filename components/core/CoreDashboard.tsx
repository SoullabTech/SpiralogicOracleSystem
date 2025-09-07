import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface UserConfig {
  oracleName: string;
  voiceId: string;
  currentPhase?: string;
  coherenceLevel?: number;
}

interface CoreDashboardProps {
  userConfig: UserConfig;
  onNavigate: (route: string) => void;
}

const CoreDashboard: React.FC<CoreDashboardProps> = ({
  userConfig,
  onNavigate,
}) => {
  const [spiralogicPattern, setSpiralogicPattern] = useState<number[]>([]);

  // Generate phi-based spiral pattern for background
  useEffect(() => {
    const phi = 1.618033988749;
    const pattern = Array.from({ length: 12 }, (_, i) => {
      return Math.sin(i * phi) * 50 + Math.cos(i / phi) * 30;
    });
    setSpiralogicPattern(pattern);
  }, []);

  const coreModules = [
    {
      id: "oracle",
      title: "Personal Oracle",
      subtitle: userConfig.oracleName || "Configure Guide",
      icon: "🧬",
      route: "/oracle",
      description: "Voice-guided insight interface",
      priority: "primary",
    },
    {
      id: "holoflower",
      title: "Holoflower Check-In",
      subtitle: "Elemental state mapping",
      icon: "🌸",
      route: "/holoflower",
      description: "Current coherence snapshot",
      priority: "primary",
    },
    {
      id: "memory",
      title: "Memory Portal",
      subtitle: "Insight threading & journal",
      icon: "📝",
      route: "/memory",
      description: "Pattern recognition system",
      priority: "primary",
    },
    {
      id: "astrology",
      title: "Spiralogic Astrology",
      subtitle: "Elemental timing intelligence",
      icon: "🧭",
      route: "/astrology",
      description: "Powered by Spiralogic™",
      priority: "primary",
    },
    {
      id: "agents",
      title: "Archetypal Agents",
      subtitle: "Developmental companions",
      icon: "🤝",
      route: "/agents",
      description: "Process-specific guidance",
      priority: "secondary",
    },
    {
      id: "expansion",
      title: "Build With Spiralogic",
      subtitle: "Integration & licensing",
      icon: "🌐",
      route: "/expansion",
      description: "For creators & organizations",
      priority: "secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Spiralogic Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="spiralogic"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M 100 100 ${spiralogicPattern
                  .map((val, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const radius = 20 + Math.abs(val);
                    const x = 100 + radius * Math.cos(angle);
                    const y = 100 + radius * Math.sin(angle);
                    return `L ${x} ${y}`;
                  })
                  .join(" ")}`}
                stroke="#d4af37"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spiralogic)" />
        </svg>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.618 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light text-amber-100 mb-2">
                Spiralogic Oracle System
              </h1>
              <p className="text-slate-300 text-lg">
                Consciousness technology for developmental intelligence
              </p>
              <div className="mt-2 text-sm text-slate-400">
                Powered by Spiralogic™ • Ensouled by Soullab®
              </div>
            </div>

            {/* Coherence Indicator */}
            {userConfig.coherenceLevel && (
              <div className="text-right">
                <div className="text-slate-400 text-sm mb-1">
                  Current Coherence
                </div>
                <div className="text-2xl font-light text-amber-100">
                  {userConfig.coherenceLevel}%
                </div>
                <div className="text-xs text-slate-500">
                  Based on recent patterns
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Core Modules Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.618,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className={`
                  group cursor-pointer p-6 bg-slate-800/60 backdrop-blur-sm border transition-all duration-300
                  ${
                    module.priority === "primary"
                      ? "border-slate-600 hover:border-amber-500 hover:bg-slate-800/80"
                      : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/70"
                  }
                `}
                onClick={() => onNavigate(module.route)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {module.icon}
                  </div>
                  {module.id === "astrology" && (
                    <div className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-400/10 border border-amber-400/20">
                      SPIRALOGIC™
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-medium text-amber-100 mb-2 group-hover:text-amber-50 transition-colors">
                  {module.title}
                </h3>

                <p className="text-slate-300 text-sm mb-3 group-hover:text-slate-200 transition-colors">
                  {module.subtitle}
                </p>

                <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  {module.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-700"
        >
          <div className="text-center text-slate-500 text-sm">
            <p className="mb-2">
              Built on Jungian archetypal frameworks and elemental developmental
              psychology
            </p>
            <p>
              This is not AI mysticism—it&apos;s consciousness engineering for
              rational seekers
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { CoreDashboard };
