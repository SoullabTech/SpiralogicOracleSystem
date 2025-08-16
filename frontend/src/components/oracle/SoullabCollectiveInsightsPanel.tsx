// Soullab Collective Insights Panel - Sacred Minimalism Design
// Oracular chamber experience for Main Oracle aggregated wisdom

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/soullab-tokens.css";

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

interface SoullabCollectiveInsightsPanelProps {
  className?: string;
  defaultExpanded?: boolean;
}

const SoullabCollectiveInsightsPanel: React.FC<
  SoullabCollectiveInsightsPanelProps
> = ({ className = "", defaultExpanded = false }) => {
  const [insights, setInsights] = useState<CollectiveInsight[]>([]);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
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
        ...(selectedFilters.type && { type: selectedFilters.type }),
        ...(selectedFilters.element && { element: selectedFilters.element }),
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
        throw new Error("Failed to access collective wisdom");
      }

      const data = await response.json();
      if (data.success) {
        setInsights(data.data || []);
      } else {
        throw new Error(data.errors?.[0] || "Unknown error");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to commune with the collective",
      );
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

  const getTypeColor = (type: string): string => {
    const colors = {
      archetypal_pattern: "aether",
      elemental_shift: "water",
      consciousness_trend: "earth",
      shadow_integration: "fire",
    };
    return colors[type as keyof typeof colors] || "air";
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

  const applyFilters = () => {
    loadCollectiveInsights();
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setTimeout(() => loadCollectiveInsights(), 100);
  };

  // Collapsed state - sacred invitation
  if (!isExpanded) {
    return (
      <motion.div
        className={`soullab-card ${className}`}
        style={{
          background:
            "linear-gradient(135deg, var(--earth-subtle), var(--aether-subtle))",
          border: "1px solid var(--earth-light)",
          cursor: "pointer",
        }}
        whileHover={{
          borderColor: "var(--earth)",
          boxShadow: "var(--shadow-soft)",
        }}
        onClick={() => setIsExpanded(true)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-lg)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-3xl)",
                filter: "sepia(20%) brightness(1.1)",
              }}
            >
              🌌
            </div>
            <div>
              <h3
                className="soullab-heading"
                style={{
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-sm)",
                  color: "var(--text-primary)",
                }}
              >
                Collective Oracle
              </h3>
              <p
                className="soullab-body"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                Wisdom from the network of awakening souls
              </p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 15 }}
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--earth)",
              marginLeft: "var(--space-lg)",
            }}
          >
            ✨
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`soullab-card ${className}`}
      style={{
        background:
          "linear-gradient(135deg, var(--earth-subtle), var(--aether-subtle))",
        border: "1px solid var(--earth-light)",
      }}
      initial={false}
    >
      {/* Header - Collapsible */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="soullab-transition"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          marginBottom: "var(--space-xl)",
          cursor: "pointer",
        }}
        whileHover={{
          opacity: 0.8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-lg)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-3xl)",
                filter: "sepia(20%) brightness(1.1)",
              }}
            >
              🌌
            </div>
            <div style={{ textAlign: "left" }}>
              <h3
                className="soullab-heading"
                style={{
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-sm)",
                  color: "var(--text-primary)",
                }}
              >
                Collective Oracle
              </h3>
              <p
                className="soullab-body"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                {insights.length} sacred patterns •{" "}
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
            transition={{ duration: 0.3 }}
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--earth)",
            }}
          >
            ▼
          </motion.div>
        </div>
      </motion.button>

      {/* Sacred Content - Curtain Opening Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="soullab-curtain-open"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
          >
            {/* Sacred Filters */}
            <div
              style={{
                background: "var(--air-subtle)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-base)",
                padding: "var(--space-lg)",
                marginBottom: "var(--space-xl)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-base)",
                  flexWrap: "wrap",
                  marginBottom: "var(--space-base)",
                }}
              >
                <span
                  className="soullab-body"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    fontWeight: "var(--weight-medium)",
                  }}
                >
                  Sacred Filters:
                </span>

                {/* Type Filter */}
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedFilters.type || ""}
                    onChange={(e) =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        type: e.target.value || undefined,
                      }))
                    }
                    className="soullab-input"
                    style={{
                      fontSize: "var(--text-sm)",
                      padding: "var(--space-sm) var(--space-base)",
                      background: "var(--bg-primary)",
                      minWidth: "160px",
                    }}
                  >
                    <option value="">All Patterns</option>
                    <option value="archetypal_pattern">
                      Archetypal Pattern
                    </option>
                    <option value="elemental_shift">Elemental Shift</option>
                    <option value="consciousness_trend">
                      Consciousness Trend
                    </option>
                    <option value="shadow_integration">
                      Shadow Integration
                    </option>
                  </select>
                </div>

                {/* Element Filter */}
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedFilters.element || ""}
                    onChange={(e) =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        element: e.target.value || undefined,
                      }))
                    }
                    className="soullab-input"
                    style={{
                      fontSize: "var(--text-sm)",
                      padding: "var(--space-sm) var(--space-base)",
                      background: "var(--bg-primary)",
                      minWidth: "140px",
                    }}
                  >
                    <option value="">All Elements</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="earth">Earth</option>
                    <option value="air">Air</option>
                    <option value="aether">Aether</option>
                  </select>
                </div>

                <button
                  onClick={applyFilters}
                  className="soullab-button soullab-button--earth"
                  style={{
                    fontSize: "var(--text-sm)",
                    padding: "var(--space-sm) var(--space-base)",
                  }}
                >
                  Commune
                </button>

                {(selectedFilters.type || selectedFilters.element) && (
                  <button
                    onClick={clearFilters}
                    className="soullab-button soullab-button--air"
                    style={{
                      fontSize: "var(--text-sm)",
                      padding: "var(--space-sm) var(--space-base)",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: "center",
                  padding: "var(--space-3xl)",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    background: "var(--earth)",
                    borderRadius: "50%",
                    margin: "0 auto var(--space-lg)",
                    opacity: 0.6,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                ></div>
                <p
                  className="soullab-body"
                  style={{
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                  }}
                >
                  Opening the sacred chamber...
                </p>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "var(--fire-muted)",
                  border: "1px solid var(--fire-light)",
                  borderRadius: "var(--radius-base)",
                  padding: "var(--space-lg)",
                  marginBottom: "var(--space-xl)",
                  textAlign: "center",
                }}
              >
                <p
                  className="soullab-body"
                  style={{
                    color: "var(--fire-dark)",
                    marginBottom: "var(--space-base)",
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={loadCollectiveInsights}
                  className="soullab-button soullab-button--fire"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  Seek Again
                </button>
              </motion.div>
            )}

            {/* Sacred Insights Grid */}
            {!isLoading && !error && insights.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "var(--space-xl)",
                }}
              >
                {insights.map((insight, index) => {
                  const typeColor = getTypeColor(insight.type);
                  const dominantElements = getElementalDominance(
                    insight.elementalResonance,
                  );

                  return (
                    <motion.article
                      key={insight.id}
                      className="soullab-fade-in"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.5 }}
                      style={{
                        background: `var(--${typeColor}-subtle)`,
                        border: `1px solid var(--${typeColor}-light)`,
                        borderRadius: "var(--radius-lg)",
                        padding: "var(--space-xl)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Subtle Background Pattern */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          fontSize: "4rem",
                          opacity: 0.05,
                          pointerEvents: "none",
                        }}
                      >
                        {getTypeIcon(insight.type)}
                      </div>

                      {/* Header */}
                      <header
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "var(--space-lg)",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-sm)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            <span style={{ fontSize: "var(--text-lg)" }}>
                              {getTypeIcon(insight.type)}
                            </span>
                            <h4
                              className="soullab-heading"
                              style={{
                                fontSize: "var(--text-lg)",
                                color: "var(--text-primary)",
                                lineHeight: 1.3,
                              }}
                            >
                              {insight.title}
                            </h4>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "var(--space-base)",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "var(--text-xs)",
                                padding: "var(--space-xs) var(--space-sm)",
                                background: `var(--${typeColor}-muted)`,
                                color: `var(--${typeColor}-dark)`,
                                borderRadius: "var(--radius-sm)",
                                fontWeight: "var(--weight-medium)",
                              }}
                            >
                              {formatTypeLabel(insight.type)}
                            </span>
                            <span
                              className="soullab-body"
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--text-tertiary)",
                                alignSelf: "center",
                              }}
                            >
                              {insight.relevantUsers} souls
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "right",
                            flexShrink: 0,
                            marginLeft: "var(--space-base)",
                          }}
                        >
                          <div
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {formatTimeAgo(insight.createdAt)}
                          </div>
                          <div
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-tertiary)",
                              marginTop: "var(--space-xs)",
                            }}
                          >
                            {Math.round(insight.confidenceLevel * 100)}%
                            resonance
                          </div>
                        </div>
                      </header>

                      {/* Sacred Description */}
                      <p
                        className="soullab-body"
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-primary)",
                          lineHeight: 1.6,
                          marginBottom: "var(--space-lg)",
                        }}
                      >
                        {insight.description}
                      </p>

                      {/* Elemental Resonance */}
                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-sm)",
                            marginBottom: "var(--space-sm)",
                          }}
                        >
                          <span
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-secondary)",
                              fontWeight: "var(--weight-medium)",
                            }}
                          >
                            Elemental Resonance:
                          </span>
                          {dominantElements.map(({ element, value }) => (
                            <span
                              key={element}
                              style={{
                                fontSize: "var(--text-xs)",
                                padding: "var(--space-xs) var(--space-sm)",
                                background: `var(--${element}-muted)`,
                                color: `var(--${element}-dark)`,
                                borderRadius: "var(--radius-sm)",
                                fontWeight: "var(--weight-medium)",
                              }}
                            >
                              {element} {Math.round(value * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sacred Guidance */}
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "var(--radius-base)",
                          padding: "var(--space-lg)",
                          marginBottom: "var(--space-base)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: "var(--space-sm)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-xs)",
                              color: `var(--${typeColor}-dark)`,
                              fontWeight: "var(--weight-semibold)",
                              flexShrink: 0,
                            }}
                          >
                            Guidance:
                          </span>
                          <p
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-primary)",
                              lineHeight: 1.5,
                              margin: 0,
                              fontStyle: "italic",
                            }}
                          >
                            {insight.guidance}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <footer
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-xs)",
                          }}
                        >
                          <span
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            Archetype:
                          </span>
                          <span
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-xs)",
                              color: `var(--${typeColor}-dark)`,
                              fontWeight: "var(--weight-medium)",
                            }}
                          >
                            {insight.archetypalSignature}
                          </span>
                        </div>
                        <div
                          className="soullab-body"
                          style={{
                            fontSize: "var(--text-xs)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {insight.timeframe}
                        </div>
                      </footer>
                    </motion.article>
                  );
                })}
              </div>
            )}

            {/* Empty Sacred Space */}
            {!isLoading && !error && insights.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: "center",
                  padding: "var(--space-3xl)",
                  color: "var(--text-tertiary)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--space-lg)",
                    opacity: 0.6,
                  }}
                >
                  🔍
                </div>
                <p className="soullab-body">
                  The sacred chamber echoes with silence.
                </p>
                <p
                  className="soullab-body"
                  style={{
                    fontSize: "var(--text-sm)",
                    marginTop: "var(--space-sm)",
                  }}
                >
                  Adjust your filters to commune with different patterns.
                </p>
              </motion.div>
            )}

            {/* Sacred Footer */}
            {!isLoading && insights.length > 0 && (
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  borderTop: "1px solid var(--earth-light)",
                  paddingTop: "var(--space-lg)",
                  marginTop: "var(--space-xl)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  className="soullab-body"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-tertiary)",
                    fontStyle: "italic",
                  }}
                >
                  Wisdom flows from the collective Oracle network
                </div>
                <button
                  onClick={loadCollectiveInsights}
                  className="soullab-button soullab-button--earth soullab-transition"
                  style={{
                    fontSize: "var(--text-xs)",
                    padding: "var(--space-sm) var(--space-base)",
                  }}
                >
                  ✨ Refresh Sacred Patterns
                </button>
              </motion.footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SoullabCollectiveInsightsPanel;
