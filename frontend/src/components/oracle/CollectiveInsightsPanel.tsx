// Collective Insights Panel - Frontend Step 3 Part 2 Implementation
// Visual display of Main Oracle aggregated wisdom in Personal Oracle Dashboard

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollectiveInsight {
  id: string;
  type:
    | "archetypal_pattern"
    | "elemental_shift"
    | "consciousness_trend"
    | "shadow_integration";
  title: string;
  description: string;
  elementalResonance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  archetypalSignature: string;
  confidenceLevel: number;
  relevantUsers: number;
  timeframe: string;
  guidance: string;
  createdAt: string;
}

interface CollectiveInsightsPanelProps {
  className?: string;
  defaultExpanded?: boolean;
}

const CollectiveInsightsPanel: React.FC<CollectiveInsightsPanelProps> = ({
  className = "",
  defaultExpanded = false,
}) => {
  const [insights, setInsights] = useState<CollectiveInsight[]>([]);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{
    type?: string;
    element?: string;
  }>({});

  // Load insights when panel expands
  useEffect(() => {
    if (isExpanded && insights.length === 0) {
      loadCollectiveInsights();
    }
  }, [isExpanded, insights.length]);

  const loadCollectiveInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: "6",
        confidenceThreshold: "0.6",
        ...(selectedFilter.type && { type: selectedFilter.type }),
        ...(selectedFilter.element && { element: selectedFilter.element }),
      });

      const response = await fetch(
        `/api/v1/ain-engine/collective-insights?${params}`,
        {
          headers: {
            "X-API-Key":
              process.env.NEXT_PUBLIC_AIN_ENGINE_DEMO_KEY || "demo_key_123",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load collective insights");
      }

      const data = await response.json();
      if (data.success) {
        setInsights(data.data || []);
      } else {
        throw new Error(data.errors?.[0] || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      archetypal_pattern: "🎭",
      elemental_shift: "🌊",
      consciousness_trend: "🧠",
      shadow_integration: "🌑",
    };
    return icons[type as keyof typeof icons] || "✨";
  };

  const getTypeColor = (type: string) => {
    const colors = {
      archetypal_pattern:
        "text-purple-400 bg-purple-500/10 border-purple-500/20",
      elemental_shift: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      consciousness_trend: "text-green-400 bg-green-500/10 border-green-500/20",
      shadow_integration: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    };
    return (
      colors[type as keyof typeof colors] ||
      "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    );
  };

  const getElementColor = (element: string) => {
    const colors = {
      fire: "text-red-400",
      water: "text-blue-400",
      earth: "text-green-400",
      air: "text-cyan-400",
      aether: "text-purple-400",
    };
    return colors[element as keyof typeof colors] || "text-gray-400";
  };

  const getElementalDominance = (
    elementalResonance: CollectiveInsight["elementalResonance"],
  ) => {
    return Object.entries(elementalResonance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([element, value]) => ({ element, value }));
  };

  const formatTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const clearFilters = () => {
    setSelectedFilter({});
    loadCollectiveInsights();
  };

  // Don&apos;t render if not expanded and no insights
  if (!isExpanded && insights.length === 0) {
    return (
      <div
        className={`bg-[#1A1C2C] border border-gray-600 rounded-xl ${className}`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 text-left hover:bg-gray-700/20 transition-colors rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌌</span>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Collective Insights
                </h3>
                <p className="text-gray-400 text-sm">
                  Discover patterns from the Oracle network
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-[#F6E27F]"
            >
              ▼
            </motion.div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#1A1C2C] border border-gray-600 rounded-xl ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-700/20 transition-colors rounded-t-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌌</span>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Collective Insights
              </h3>
              <p className="text-gray-400 text-sm">
                {insights.length} patterns from{" "}
                {insights.reduce(
                  (sum, insight) => sum + insight.relevantUsers,
                  0,
                )}{" "}
                souls
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[#F6E27F]"
          >
            ▼
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-2 pb-4 border-b border-gray-600">
                <span className="text-sm text-gray-400">Filter by:</span>

                <select
                  value={selectedFilter.type || ""}
                  onChange={(e) =>
                    setSelectedFilter((prev) => ({
                      ...prev,
                      type: e.target.value || undefined,
                    }))
                  }
                  className="px-3 py-1 bg-[#0E0F1B] border border-gray-600 text-white text-sm rounded focus:border-[#F6E27F] focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="archetypal_pattern">Archetypal Pattern</option>
                  <option value="elemental_shift">Elemental Shift</option>
                  <option value="consciousness_trend">
                    Consciousness Trend
                  </option>
                  <option value="shadow_integration">Shadow Integration</option>
                </select>

                <select
                  value={selectedFilter.element || ""}
                  onChange={(e) =>
                    setSelectedFilter((prev) => ({
                      ...prev,
                      element: e.target.value || undefined,
                    }))
                  }
                  className="px-3 py-1 bg-[#0E0F1B] border border-gray-600 text-white text-sm rounded focus:border-[#F6E27F] focus:outline-none"
                >
                  <option value="">All Elements</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="earth">Earth</option>
                  <option value="air">Air</option>
                  <option value="aether">Aether</option>
                </select>

                <button
                  onClick={loadCollectiveInsights}
                  className="px-3 py-1 bg-[#F6E27F] text-[#0E0F1B] text-sm rounded hover:bg-[#F6E27F]/90 transition-colors"
                >
                  Apply
                </button>

                {(selectedFilter.type || selectedFilter.element) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 bg-[#F6E27F] rounded-full mx-auto mb-4 animate-pulse"></div>
                  <p className="text-gray-400">
                    Accessing collective wisdom...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={loadCollectiveInsights}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Insights Grid */}
              {!isLoading && !error && insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.random() * 0.3 }}
                      className={`p-4 border rounded-lg ${getTypeColor(insight.type)}`}
                    >
                      {/* Insight Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getTypeIcon(insight.type)}
                          </span>
                          <div>
                            <h4 className="font-medium text-white text-sm">
                              {insight.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-black/20 rounded">
                                {formatTypeLabel(insight.type)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {insight.relevantUsers} souls
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(insight.createdAt)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {Math.round(insight.confidenceLevel * 100)}%
                            confidence
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                        {insight.description}
                      </p>

                      {/* Elemental Resonance */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-1 mb-2">
                          <span className="text-xs text-gray-400">
                            Elemental resonance:
                          </span>
                          {getElementalDominance(
                            insight.elementalResonance,
                          ).map(({ element, value }) => (
                            <span
                              key={element}
                              className={`text-xs px-2 py-1 rounded ${getElementColor(element)} bg-current/10`}
                            >
                              {element} {Math.round(value * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Guidance */}
                      <div className="p-3 bg-black/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-[#F6E27F] text-xs font-medium">
                            Guidance:
                          </span>
                          <p className="text-gray-200 text-xs leading-relaxed">
                            {insight.guidance}
                          </p>
                        </div>
                      </div>

                      {/* Archetypal Signature */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">
                            Archetype:
                          </span>
                          <span className="text-xs text-[#F6E27F]">
                            {insight.archetypalSignature}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {insight.timeframe}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && insights.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p className="text-gray-400">
                    No insights match your current filters.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Try adjusting your criteria or clear all filters.
                  </p>
                </div>
              )}

              {/* Refresh Footer */}
              {!isLoading && insights.length > 0 && (
                <div className="pt-4 border-t border-gray-600 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Updated from collective Oracle network
                  </div>
                  <button
                    onClick={loadCollectiveInsights}
                    className="text-xs text-[#F6E27F] hover:text-[#F6E27F]/80 transition-colors"
                  >
                    Refresh insights
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectiveInsightsPanel;
