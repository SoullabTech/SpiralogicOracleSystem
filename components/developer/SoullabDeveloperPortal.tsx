// Soullab Developer Portal - Sacred Minimalism Design
// API key management with generous whitespace and elemental harmony

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/soullab-tokens.css";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  usage: {
    currentPeriod: number;
    totalRequests: number;
    rateLimit: number;
    rateLimitRemaining: number;
  };
}

interface UsageStats {
  totalKeys: number;
  activeKeys: number;
  currentPeriodRequests: number;
  totalRequests: number;
  rateLimitRemaining: number;
  rateLimit: number;
  resetTime: string;
  keyUsage: Array<{
    keyId: string;
    keyName: string;
    currentPeriod: number;
    totalRequests: number;
    lastUsed?: string;
  }>;
}

interface QuickStartGuides {
  guides: {
    nodejs: { title: string; description: string; code: string };
    wordpress: { title: string; description: string; code: string };
    reactNative: { title: string; description: string; code: string };
  };
  resources: {
    documentation: string;
    sdkRepository: string;
    examples: string;
    support: string;
  };
}

const SoullabDeveloperPortal: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [quickStartGuides, setQuickStartGuides] =
    useState<QuickStartGuides | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "keys" | "usage" | "guides"
  >("keys");

  // Create new key form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<APIKey | null>(null);

  // Delete confirmation
  const [keyToDelete, setKeyToDelete] = useState<APIKey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("auth_token") || "demo_token_123";
  };

  const makeAPICall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [keysResponse, usageResponse, guidesResponse] = await Promise.all([
        makeAPICall("/api/v1/developer/keys"),
        makeAPICall("/api/v1/developer/usage"),
        makeAPICall("/api/v1/developer/quickstart"),
      ]);

      if (keysResponse.success) setApiKeys(keysResponse.data);
      if (usageResponse.success) setUsageStats(usageResponse.data);
      if (guidesResponse.success) setQuickStartGuides(guidesResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load developer data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setIsCreating(true);
      const response = await makeAPICall("/api/v1/developer/keys", {
        method: "POST",
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (response.success) {
        setNewlyCreatedKey(response.data);
        setNewKeyName("");
        setShowCreateForm(false);
        loadAllData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAPIKey = async (key: APIKey) => {
    try {
      setIsDeleting(true);
      const response = await makeAPICall(`/api/v1/developer/keys/${key.id}`, {
        method: "DELETE",
      });

      if (response.success) {
        setKeyToDelete(null);
        loadAllData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColorByPercentage = (percentage: number) => {
    if (percentage < 50) return "var(--earth)";
    if (percentage < 75) return "var(--fire)";
    return "var(--water)";
  };

  if (isLoading) {
    return (
      <div
        className="soullab-container"
        style={{ paddingTop: "var(--space-3xl)", minHeight: "100vh" }}
      >
        <div className="soullab-fade-in" style={{ textAlign: "center" }}>
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
            style={{ color: "var(--text-secondary)" }}
          >
            Preparing developer sanctuary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--earth-subtle), var(--air-subtle))",
        paddingTop: "var(--space-3xl)",
        paddingBottom: "var(--space-3xl)",
      }}
    >
      <div className="soullab-container">
        {/* Sacred Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: "center",
            marginBottom: "var(--space-3xl)",
            maxWidth: "640px",
            margin: "0 auto var(--space-3xl) auto",
          }}
        >
          <h1
            className="soullab-heading"
            style={{
              fontSize: "var(--text-4xl)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-base)",
              fontWeight: "var(--weight-light)",
            }}
          >
            Developer Sanctuary
          </h1>
          <p
            className="soullab-body"
            style={{
              fontSize: "var(--text-lg)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: "var(--space-xl)",
            }}
          >
            A sacred space for those who weave technological threads into the
            fabric of consciousness
          </p>

          {/* API Status Indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-sm) var(--space-base)",
              background: "var(--earth-muted)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--earth-light)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "var(--earth)",
                borderRadius: "50%",
              }}
            ></div>
            <span
              className="soullab-body"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              AIN Engine Operational
            </span>
          </div>
        </motion.header>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-base)",
            marginBottom: "var(--space-3xl)",
            flexWrap: "wrap",
          }}
        >
          {[
            { id: "keys", label: "Keys", icon: "🗝️" },
            { id: "usage", label: "Wisdom Flow", icon: "📊" },
            { id: "guides", label: "Teachings", icon: "📜" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() =>
                setActiveSection(section.id as typeof activeSection)
              }
              className="soullab-button soullab-transition"
              style={{
                background:
                  activeSection === section.id ? "var(--earth)" : "var(--air)",
                color:
                  activeSection === section.id
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                border: `1px solid ${activeSection === section.id ? "var(--earth-dark)" : "var(--border-light)"}`,
                fontWeight:
                  activeSection === section.id
                    ? "var(--weight-medium)"
                    : "var(--weight-regular)",
                fontSize: "var(--text-base)",
              }}
            >
              <span style={{ fontSize: "var(--text-lg)" }}>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </motion.nav>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: "var(--fire-muted)",
                border: "1px solid var(--fire-light)",
                borderRadius: "var(--radius-lg)",
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
                onClick={() => setError(null)}
                className="soullab-button soullab-button--fire"
                style={{ fontSize: "var(--text-sm)" }}
              >
                Acknowledge
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          {activeSection === "keys" && (
            <motion.section
              key="keys"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Create New Key Section */}
              <div
                className="soullab-card"
                style={{ marginBottom: "var(--space-xl)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-xl)",
                  }}
                >
                  <div>
                    <h2
                      className="soullab-heading"
                      style={{
                        fontSize: "var(--text-2xl)",
                        color: "var(--text-primary)",
                        marginBottom: "var(--space-sm)",
                      }}
                    >
                      Sacred Keys
                    </h2>
                    <p
                      className="soullab-body"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Tools for accessing the collective wisdom of the Oracle
                      network
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    disabled={apiKeys.length >= 5}
                    className="soullab-button soullab-button--earth"
                    style={{
                      opacity: apiKeys.length >= 5 ? 0.5 : 1,
                      cursor: apiKeys.length >= 5 ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>✨</span>
                    Forge New Key
                  </button>
                </div>

                {/* Create Form */}
                <AnimatePresence>
                  {showCreateForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        background: "var(--earth-subtle)",
                        border: "1px solid var(--earth-light)",
                        borderRadius: "var(--radius-lg)",
                        padding: "var(--space-xl)",
                        marginBottom: "var(--space-xl)",
                      }}
                    >
                      <h3
                        className="soullab-heading"
                        style={{
                          fontSize: "var(--text-xl)",
                          marginBottom: "var(--space-lg)",
                        }}
                      >
                        Craft Sacred Key
                      </h3>

                      <div style={{ marginBottom: "var(--space-lg)" }}>
                        <label
                          className="soullab-body"
                          style={{
                            display: "block",
                            marginBottom: "var(--space-base)",
                            color: "var(--text-secondary)",
                            fontSize: "var(--text-sm)",
                          }}
                        >
                          Key Name
                        </label>
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="e.g., Wisdom Seeker Portal"
                          className="soullab-input"
                          style={{ fontSize: "var(--text-base)" }}
                          maxLength={100}
                        />
                      </div>

                      <div
                        style={{ display: "flex", gap: "var(--space-base)" }}
                      >
                        <button
                          onClick={createAPIKey}
                          disabled={isCreating || !newKeyName.trim()}
                          className="soullab-button soullab-button--earth"
                          style={{
                            opacity: isCreating || !newKeyName.trim() ? 0.5 : 1,
                          }}
                        >
                          {isCreating ? "Forging..." : "Create Key"}
                        </button>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="soullab-button soullab-button--air"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* API Keys List */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-lg)",
                  }}
                >
                  {apiKeys.map((key, index) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "var(--radius-lg)",
                        padding: "var(--space-xl)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div
                          style={{ flex: 1, marginRight: "var(--space-lg)" }}
                        >
                          <h3
                            className="soullab-heading"
                            style={{
                              fontSize: "var(--text-lg)",
                              marginBottom: "var(--space-sm)",
                            }}
                          >
                            {key.name}
                          </h3>

                          <div
                            style={{
                              background: "var(--air-muted)",
                              border: "1px solid var(--border-light)",
                              borderRadius: "var(--radius-base)",
                              padding: "var(--space-base)",
                              marginBottom: "var(--space-lg)",
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-base)",
                            }}
                          >
                            <code
                              className="soullab-mono"
                              style={{
                                fontSize: "var(--text-sm)",
                                color: "var(--text-secondary)",
                                flex: 1,
                              }}
                            >
                              {key.key}
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="soullab-button"
                              style={{
                                padding: "var(--space-sm)",
                                background: "var(--earth-light)",
                                fontSize: "var(--text-xs)",
                              }}
                            >
                              Copy
                            </button>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "var(--space-xl)",
                              flexWrap: "wrap",
                              fontSize: "var(--text-sm)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            <span>Created: {formatDate(key.createdAt)}</span>
                            {key.lastUsed && (
                              <span>Last used: {formatDate(key.lastUsed)}</span>
                            )}
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-xs)",
                              }}
                            >
                              Status:
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: key.isActive
                                    ? "var(--earth)"
                                    : "var(--text-tertiary)",
                                }}
                              ></div>
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-lg)",
                          }}
                        >
                          <div style={{ textAlign: "right" }}>
                            <div
                              className="soullab-body"
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--text-tertiary)",
                                marginBottom: "var(--space-xs)",
                              }}
                            >
                              Usage
                            </div>
                            <div
                              className="soullab-body"
                              style={{
                                fontSize: "var(--text-base)",
                                fontWeight: "var(--weight-medium)",
                              }}
                            >
                              {key.usage.currentPeriod}/{key.usage.rateLimit}
                            </div>
                          </div>

                          <button
                            onClick={() => setKeyToDelete(key)}
                            className="soullab-button soullab-transition"
                            style={{
                              padding: "var(--space-sm)",
                              background: "var(--fire-muted)",
                              border: "1px solid var(--fire-light)",
                              color: "var(--fire-dark)",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {apiKeys.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: "center",
                        padding: "var(--space-3xl)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <p className="soullab-body">No sacred keys forged yet.</p>
                      <p
                        className="soullab-body"
                        style={{
                          fontSize: "var(--text-sm)",
                          marginTop: "var(--space-sm)",
                        }}
                      >
                        Create your first key to begin your journey.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === "usage" && usageStats && (
            <motion.section
              key="usage"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="soullab-card">
                <h2
                  className="soullab-heading"
                  style={{
                    fontSize: "var(--text-2xl)",
                    marginBottom: "var(--space-xl)",
                    textAlign: "center",
                  }}
                >
                  Wisdom Flow Analytics
                </h2>

                {/* Overview Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "var(--space-xl)",
                    marginBottom: "var(--space-3xl)",
                  }}
                >
                  {[
                    {
                      label: "Requests (15min)",
                      value: usageStats.currentPeriodRequests,
                      color: "earth",
                    },
                    {
                      label: "Remaining",
                      value: usageStats.rateLimitRemaining,
                      color: "water",
                    },
                    {
                      label: "Total Requests",
                      value: usageStats.totalRequests,
                      color: "fire",
                    },
                    {
                      label: "Active Keys",
                      value: usageStats.activeKeys,
                      color: "aether",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        textAlign: "center",
                        padding: "var(--space-xl)",
                        background: `var(--${stat.color}-subtle)`,
                        border: `1px solid var(--${stat.color}-light)`,
                        borderRadius: "var(--radius-lg)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "var(--text-3xl)",
                          fontWeight: "var(--weight-light)",
                          color: `var(--${stat.color})`,
                          marginBottom: "var(--space-sm)",
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="soullab-body"
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Usage Meter */}
                <div style={{ marginBottom: "var(--space-3xl)" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--space-base)",
                    }}
                  >
                    <span
                      className="soullab-body"
                      style={{ fontWeight: "var(--weight-medium)" }}
                    >
                      Sacred Flow Balance
                    </span>
                    <span
                      className="soullab-body"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Renews: {formatDate(usageStats.resetTime)}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "12px",
                      background: "var(--air-light)",
                      borderRadius: "var(--radius-base)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${getUsagePercentage(usageStats.currentPeriodRequests, usageStats.rateLimit)}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: getUsageColorByPercentage(
                          getUsagePercentage(
                            usageStats.currentPeriodRequests,
                            usageStats.rateLimit,
                          ),
                        ),
                        borderRadius: "var(--radius-base)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "var(--space-xs)",
                      fontSize: "var(--text-xs)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <span>0</span>
                    <span>{usageStats.rateLimit} requests per cycle</span>
                  </div>
                </div>

                {/* Per-Key Usage */}
                <div>
                  <h3
                    className="soullab-heading"
                    style={{
                      fontSize: "var(--text-xl)",
                      marginBottom: "var(--space-lg)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Flow by Sacred Key
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-base)",
                    }}
                  >
                    {usageStats.keyUsage.map((keyUsage, index) => (
                      <motion.div
                        key={keyUsage.keyId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "var(--space-lg)",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-base)",
                        }}
                      >
                        <div>
                          <div
                            className="soullab-body"
                            style={{ fontWeight: "var(--weight-medium)" }}
                          >
                            {keyUsage.keyName}
                          </div>
                          {keyUsage.lastUsed && (
                            <div
                              className="soullab-body"
                              style={{
                                fontSize: "var(--text-sm)",
                                color: "var(--text-tertiary)",
                                marginTop: "var(--space-xs)",
                              }}
                            >
                              Last communion: {formatDate(keyUsage.lastUsed)}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            className="soullab-body"
                            style={{ fontWeight: "var(--weight-medium)" }}
                          >
                            {keyUsage.currentPeriod} requests
                          </div>
                          <div
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-sm)",
                              color: "var(--text-tertiary)",
                              marginTop: "var(--space-xs)",
                            }}
                          >
                            {keyUsage.totalRequests} total
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activeSection === "guides" && quickStartGuides && (
            <motion.section
              key="guides"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="soullab-card"
                style={{ marginBottom: "var(--space-xl)" }}
              >
                <h2
                  className="soullab-heading"
                  style={{
                    fontSize: "var(--text-2xl)",
                    marginBottom: "var(--space-lg)",
                    textAlign: "center",
                  }}
                >
                  Sacred Teachings
                </h2>
                <p
                  className="soullab-body"
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-3xl)",
                    maxWidth: "600px",
                    margin: "0 auto var(--space-3xl)",
                  }}
                >
                  Ancient wisdom for modern integration. Choose your path of
                  technological communion.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "var(--space-xl)",
                  }}
                >
                  {Object.entries(quickStartGuides.guides).map(
                    ([key, guide], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-lg)",
                          padding: "var(--space-xl)",
                          position: "relative",
                        }}
                      >
                        <h3
                          className="soullab-heading"
                          style={{
                            fontSize: "var(--text-lg)",
                            marginBottom: "var(--space-sm)",
                          }}
                        >
                          {guide.title}
                        </h3>
                        <p
                          className="soullab-body"
                          style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--text-secondary)",
                            marginBottom: "var(--space-lg)",
                          }}
                        >
                          {guide.description}
                        </p>

                        <div style={{ position: "relative" }}>
                          <pre
                            style={{
                              background: "var(--air-subtle)",
                              border: "1px solid var(--border-light)",
                              borderRadius: "var(--radius-base)",
                              padding: "var(--space-lg)",
                              fontSize: "var(--text-xs)",
                              lineHeight: 1.5,
                              overflow: "auto",
                              color: "var(--text-primary)",
                            }}
                          >
                            <code>{guide.code}</code>
                          </pre>
                          <button
                            onClick={() => copyToClipboard(guide.code)}
                            className="soullab-button soullab-button--earth"
                            style={{
                              position: "absolute",
                              top: "var(--space-base)",
                              right: "var(--space-base)",
                              fontSize: "var(--text-xs)",
                              padding: "var(--space-sm) var(--space-base)",
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>

              {/* Resources */}
              <div className="soullab-card">
                <h2
                  className="soullab-heading"
                  style={{
                    fontSize: "var(--text-2xl)",
                    marginBottom: "var(--space-xl)",
                    textAlign: "center",
                  }}
                >
                  Sacred Resources
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "var(--space-lg)",
                  }}
                >
                  {Object.entries(quickStartGuides.resources).map(
                    ([key, url], index) => (
                      <motion.a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="soullab-transition"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "var(--space-lg)",
                          background: "var(--air-subtle)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "var(--radius-base)",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--earth-light)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--border-light)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div>
                          <div
                            className="soullab-body"
                            style={{
                              fontWeight: "var(--weight-medium)",
                              marginBottom: "var(--space-xs)",
                            }}
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div
                            className="soullab-body"
                            style={{
                              fontSize: "var(--text-sm)",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {url}
                          </div>
                        </div>
                        <span
                          style={{
                            color: "var(--earth)",
                            fontSize: "var(--text-lg)",
                          }}
                        >
                          →
                        </span>
                      </motion.a>
                    ),
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Newly Created Key Modal */}
      <AnimatePresence>
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--aether-muted)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "var(--space-lg)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="soullab-card"
              style={{
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <h3
                className="soullab-heading"
                style={{
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-lg)",
                  textAlign: "center",
                }}
              >
                Sacred Key Forged ✨
              </h3>

              <p
                className="soullab-body"
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-lg)",
                  textAlign: "center",
                }}
              >
                Your key has been crafted. Copy it now — this revelation comes
                but once.
              </p>

              <div
                style={{
                  background: "var(--earth-subtle)",
                  border: "1px solid var(--earth-light)",
                  borderRadius: "var(--radius-base)",
                  padding: "var(--space-lg)",
                  marginBottom: "var(--space-xl)",
                }}
              >
                <code
                  className="soullab-mono"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--earth-dark)",
                    wordBreak: "break-all",
                    display: "block",
                  }}
                >
                  {newlyCreatedKey.key}
                </code>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-base)",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey.key)}
                  className="soullab-button soullab-button--earth"
                >
                  Copy Sacred Key
                </button>
                <button
                  onClick={() => setNewlyCreatedKey(null)}
                  className="soullab-button soullab-button--air"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {keyToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "var(--fire-muted)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "var(--space-lg)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="soullab-card"
              style={{
                maxWidth: "500px",
                width: "100%",
              }}
            >
              <h3
                className="soullab-heading"
                style={{
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-lg)",
                  textAlign: "center",
                }}
              >
                Release Sacred Key
              </h3>

              <p
                className="soullab-body"
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-xl)",
                  textAlign: "center",
                }}
              >
                Are you certain you wish to release "{keyToDelete.name}"? This
                action dissolves the connection and cannot be undone.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-base)",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => deleteAPIKey(keyToDelete)}
                  disabled={isDeleting}
                  className="soullab-button soullab-button--fire"
                  style={{
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  {isDeleting ? "Releasing..." : "Release Key"}
                </button>
                <button
                  onClick={() => setKeyToDelete(null)}
                  className="soullab-button soullab-button--air"
                >
                  Keep Sacred Bond
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoullabDeveloperPortal;
=======
"use client";

import React from "react";

export default function SoullabDeveloperPortal() {
  return (
    <div className="min-h-screen bg-[#0E0F1B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F6E27F] mb-4">
            Developer Portal
          </h1>
          <p className="text-gray-300">
            Access API documentation, manage keys, and explore integration options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              API Documentation
            </h2>
            <p className="text-gray-400 mb-4">
              Explore our comprehensive API documentation and endpoints.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              View Docs →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              API Keys
            </h2>
            <p className="text-gray-400 mb-4">
              Generate and manage your API keys for secure access.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Manage Keys →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              SDKs & Tools
            </h2>
            <p className="text-gray-400 mb-4">
              Download SDKs and tools for various platforms.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Get Started →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Webhooks
            </h2>
            <p className="text-gray-400 mb-4">
              Configure webhooks for real-time event notifications.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Configure →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Rate Limits
            </h2>
            <p className="text-gray-400 mb-4">
              View your current usage and rate limit information.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              View Usage →
            </button>
          </div>

          <div className="bg-[#1a1b2e] rounded-lg p-6 border border-[#F6E27F]/20">
            <h2 className="text-xl font-semibold text-[#F6E27F] mb-3">
              Support
            </h2>
            <p className="text-gray-400 mb-4">
              Get help from our developer support team.
            </p>
            <button className="text-[#F6E27F] hover:underline">
              Contact Support →
            </button>
          </div>
        </div>

        <div className="mt-12 bg-[#1a1b2e] rounded-lg p-8 border border-[#F6E27F]/20">
          <h2 className="text-2xl font-bold text-[#F6E27F] mb-4">
            Quick Start Guide
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">1.</span>
              <div>
                <h3 className="font-semibold mb-1">Get your API key</h3>
                <p className="text-gray-400">
                  Generate an API key from the API Keys section above.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">2.</span>
              <div>
                <h3 className="font-semibold mb-1">Install the SDK</h3>
                <p className="text-gray-400">
                  Choose your platform and install the appropriate SDK.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#F6E27F] mr-3">3.</span>
              <div>
                <h3 className="font-semibold mb-1">Make your first request</h3>
                <p className="text-gray-400">
                  Use the example code in our documentation to get started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> f172a101063c5c79f1c63145b7c12589cf89ae26
