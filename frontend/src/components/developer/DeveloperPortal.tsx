// Developer Portal - Frontend Step 3 Part 1 Implementation
// API key management, usage stats, and quick-start guides

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const DeveloperPortal: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [quickStartGuides, setQuickStartGuides] =
    useState<QuickStartGuides | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"keys" | "usage" | "guides">(
    "keys",
  );

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
        loadAllData(); // Refresh data
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
        loadAllData(); // Refresh data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-64"></div>
            <div className="h-4 bg-gray-700 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Developer Portal
            </h1>
            <p className="text-gray-400">
              Manage your AIN Engine API keys and integration resources
            </p>
          </div>
          <div className="text-right">
            <div className="w-4 h-4 bg-green-400 rounded-full mb-2"></div>
            <p className="text-sm text-gray-400">API Operational</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-1">
        <div className="flex space-x-1">
          {[
            { id: "keys", label: "API Keys", icon: "🔑" },
            { id: "usage", label: "Usage Stats", icon: "📊" },
            { id: "guides", label: "Quick Start", icon: "📚" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-[#F6E27F] text-[#0E0F1B]"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "keys" && (
          <motion.div
            key="keys"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Create New Key */}
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={apiKeys.length >= 5}
                  className="px-4 py-2 bg-[#F6E27F] text-[#0E0F1B] rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create New Key
                </button>
              </div>

              {showCreateForm && (
                <div className="mb-6 p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Create New API Key
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Key Name
                      </label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., My WordPress Site"
                        className="w-full px-3 py-2 bg-[#1A1C2C] border border-gray-600 text-white rounded-lg focus:border-[#F6E27F] focus:outline-none"
                        maxLength={100}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={createAPIKey}
                        disabled={isCreating || !newKeyName.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isCreating ? "Creating..." : "Create Key"}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys List */}
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">
                          {key.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="font-mono text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded">
                            {key.key}
                          </div>
                          <button
                            onClick={() => copyToClipboard(key.key)}
                            className="text-[#F6E27F] hover:text-[#F6E27F]/80 text-sm"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex items-center space-x-6 mt-3 text-sm text-gray-400">
                          <span>Created: {formatDate(key.createdAt)}</span>
                          {key.lastUsed && (
                            <span>Last used: {formatDate(key.lastUsed)}</span>
                          )}
                          <span className="flex items-center">
                            Status:
                            <span
                              className={`ml-1 w-2 h-2 rounded-full ${
                                key.isActive ? "bg-green-400" : "bg-red-400"
                              }`}
                            ></span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Usage</div>
                          <div className="text-white font-medium">
                            {key.usage.currentPeriod}/{key.usage.rateLimit}
                          </div>
                        </div>
                        <button
                          onClick={() => setKeyToDelete(key)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No API keys created yet.</p>
                    <p className="text-sm mt-1">
                      Create your first key to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "usage" && usageStats && (
          <motion.div
            key="usage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Usage Overview */}
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Usage Statistics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F6E27F]">
                    {usageStats.currentPeriodRequests}
                  </div>
                  <div className="text-sm text-gray-400">Requests (15min)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F6E27F]">
                    {usageStats.rateLimitRemaining}
                  </div>
                  <div className="text-sm text-gray-400">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F6E27F]">
                    {usageStats.totalRequests}
                  </div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F6E27F]">
                    {usageStats.activeKeys}
                  </div>
                  <div className="text-sm text-gray-400">Active Keys</div>
                </div>
              </div>

              {/* Usage Meter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    Rate Limit Usage
                  </span>
                  <span className="text-gray-400 text-sm">
                    Resets: {formatDate(usageStats.resetTime)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${getUsagePercentage(usageStats.currentPeriodRequests, usageStats.rateLimit)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>0</span>
                  <span>{usageStats.rateLimit} requests/15min</span>
                </div>
              </div>

              {/* Per-Key Usage */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Usage by Key
                </h3>
                <div className="space-y-3">
                  {usageStats.keyUsage.map((keyUsage) => (
                    <div
                      key={keyUsage.keyId}
                      className="flex items-center justify-between p-3 bg-[#0E0F1B] border border-gray-600 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {keyUsage.keyName}
                        </div>
                        {keyUsage.lastUsed && (
                          <div className="text-sm text-gray-400">
                            Last used: {formatDate(keyUsage.lastUsed)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {keyUsage.currentPeriod} requests
                        </div>
                        <div className="text-sm text-gray-400">
                          {keyUsage.totalRequests} total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "guides" && quickStartGuides && (
          <motion.div
            key="guides"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Quick Start Guides */}
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Quick Start Guides
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(quickStartGuides.guides).map(([key, guide]) => (
                  <div
                    key={key}
                    className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg"
                  >
                    <h3 className="text-lg font-medium text-white mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {guide.description}
                    </p>
                    <div className="relative">
                      <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-x-auto">
                        <code>{guide.code}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(guide.code)}
                        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(quickStartGuides.resources).map(
                  ([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0E0F1B] border border-gray-600 rounded-lg hover:border-[#F6E27F] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </div>
                          <div className="text-gray-400 text-sm">{url}</div>
                        </div>
                        <span className="text-[#F6E27F]">→</span>
                      </div>
                    </a>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newly Created Key Modal */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6 max-w-lg mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              API Key Created!
            </h3>
            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                Your new API key has been created. Copy it now - you won't be
                able to see the full key again.
              </p>
              <div className="p-3 bg-[#0E0F1B] border border-gray-600 rounded-lg">
                <div className="font-mono text-sm text-[#F6E27F] break-all">
                  {newlyCreatedKey.key}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(newlyCreatedKey.key)}
                className="flex-1 px-4 py-2 bg-[#F6E27F] text-[#0E0F1B] rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors"
              >
                Copy Key
              </button>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {keyToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6 max-w-lg mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Delete API Key
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the API key "{keyToDelete.name}"?
              This action cannot be undone and will immediately revoke access.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => deleteAPIKey(keyToDelete)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Key"}
              </button>
              <button
                onClick={() => setKeyToDelete(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DeveloperPortal;
