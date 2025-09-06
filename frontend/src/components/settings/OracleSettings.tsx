// Personal Oracle Settings - Enhanced for Step 2 Frontend Implementation

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const voiceOptions = [
  { id: "aunt-annie", label: "Aunt Annie", description: "Warm & Wise" },
  { id: "sage-masculine", label: "Sage", description: "Masculine & Grounded" },
  { id: "visionary-soft", label: "Visionary", description: "Soft & Ethereal" },
  { id: "clarity-crisp", label: "Clarity", description: "Crisp & Direct" },
  { id: "maya-wisdom", label: "Maya", description: "Ancient Wisdom" },
  {
    id: "aether-guide",
    label: "Aether Guide",
    description: "Transcendent & Universal",
  },
];

const personaOptions = [
  {
    id: "warm",
    label: "Warm",
    description: "Nurturing and supportive approach",
  },
  {
    id: "formal",
    label: "Professional",
    description: "Clear and structured guidance",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Light-hearted with gentle wisdom",
  },
];

const interactionStyles = [
  { id: "brief", label: "Brief", description: "Concise insights and guidance" },
  {
    id: "detailed",
    label: "Detailed",
    description: "Comprehensive explanations",
  },
  {
    id: "comprehensive",
    label: "Comprehensive",
    description: "Deep exploration with context",
  },
];

const elementalPreferences = [
  {
    id: "fire",
    label: "Fire",
    color: "text-red-400",
    description: "Action, passion, creativity",
  },
  {
    id: "water",
    label: "Water",
    color: "text-blue-400",
    description: "Emotion, intuition, flow",
  },
  {
    id: "earth",
    label: "Earth",
    color: "text-green-400",
    description: "Grounding, stability, growth",
  },
  {
    id: "air",
    label: "Air",
    color: "text-cyan-400",
    description: "Ideas, communication, clarity",
  },
  {
    id: "aether",
    label: "Aether",
    color: "text-purple-400",
    description: "Spirit, transcendence, wisdom",
  },
];

interface PersonalOracleSettings {
  name?: string;
  voice?: string;
  persona?: "warm" | "formal" | "playful";
  preferredElements?: string[];
  interactionStyle?: "brief" | "detailed" | "comprehensive";
}

const OracleSettings: React.FC = () => {
  const [settings, setSettings] = useState<PersonalOracleSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<PersonalOracleSettings>({});

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/personal-oracle/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data || {});
        setFormData(data.data || {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch("/api/v1/personal-oracle/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setIsEditing(false);
      } else {
        throw new Error(data.errors?.[0] || "Save failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    setIsEditing(false);
    setError(null);
  };

  const handleElementToggle = (elementId: string) => {
    const currentElements = formData.preferredElements || [];
    const newElements = currentElements.includes(elementId)
      ? currentElements.filter((e) => e !== elementId)
      : [...currentElements, elementId];

    setFormData({ ...formData, preferredElements: newElements });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-[#1A1C2C] border border-gray-600 rounded-xl">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
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
      className="max-w-4xl mx-auto"
    >
      <div className="bg-[#1A1C2C] border border-gray-600 rounded-xl p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#F6E27F]">
              Personal Oracle Settings
            </h2>
            <p className="text-gray-400 mt-1">
              Customize your Oracle&apos;s personality and interaction style
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#F6E27F] text-[#0E0F1B] rounded-lg hover:bg-[#F6E27F]/90 transition-colors font-medium"
            >
              Edit Settings
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Oracle Identity
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Oracle Name
                    </label>
                    <div className="text-white font-medium">
                      {settings.name || "Not configured"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Voice
                    </label>
                    <div className="text-white">
                      {voiceOptions.find((v) => v.id === settings.voice)
                        ?.label || "Not selected"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Persona
                    </label>
                    <div className="text-white">
                      {personaOptions.find((p) => p.id === settings.persona)
                        ?.label || "Not selected"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Interaction Style
                    </label>
                    <div className="text-white">
                      {interactionStyles.find(
                        (s) => s.id === settings.interactionStyle,
                      )?.label || "Not selected"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Preferred Elements
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {settings.preferredElements?.map((elementId) => {
                        const element = elementalPreferences.find(
                          (e) => e.id === elementId,
                        );
                        return element ? (
                          <span
                            key={elementId}
                            className={`px-3 py-1 rounded-full text-sm ${element.color} bg-gray-700/50`}
                          >
                            {element.label}
                          </span>
                        ) : null;
                      }) || (
                        <span className="text-gray-500 italic">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Oracle Identity */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Oracle Identity
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Oracle Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your Oracle&apos;s name..."
                      className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Voice
                    </label>
                    <div className="space-y-2">
                      {voiceOptions.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() =>
                            setFormData({ ...formData, voice: voice.id })
                          }
                          className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                            formData.voice === voice.id
                              ? "bg-[#F6E27F] text-[#0E0F1B] border-[#F6E27F]"
                              : "bg-[#0E0F1B] border-gray-600 text-white hover:border-[#F6E27F]"
                          }`}
                        >
                          <div className="font-medium">{voice.label}</div>
                          <div className="text-sm opacity-70">
                            {voice.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Persona
                    </label>
                    <div className="space-y-2">
                      {personaOptions.map((persona) => (
                        <button
                          key={persona.id}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              persona: persona.id as any,
                            })
                          }
                          className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                            formData.persona === persona.id
                              ? "bg-[#F6E27F] text-[#0E0F1B] border-[#F6E27F]"
                              : "bg-[#0E0F1B] border-gray-600 text-white hover:border-[#F6E27F]"
                          }`}
                        >
                          <div className="font-medium">{persona.label}</div>
                          <div className="text-sm opacity-70">
                            {persona.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Interaction Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Interaction Style
                    </label>
                    <div className="space-y-2">
                      {interactionStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              interactionStyle: style.id as any,
                            })
                          }
                          className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                            formData.interactionStyle === style.id
                              ? "bg-[#F6E27F] text-[#0E0F1B] border-[#F6E27F]"
                              : "bg-[#0E0F1B] border-gray-600 text-white hover:border-[#F6E27F]"
                          }`}
                        >
                          <div className="font-medium">{style.label}</div>
                          <div className="text-sm opacity-70">
                            {style.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Preferred Elements (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select elements you&apos;d like your Oracle to emphasize
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {elementalPreferences.map((element) => (
                        <button
                          key={element.id}
                          onClick={() => handleElementToggle(element.id)}
                          className={`text-left px-4 py-3 border rounded-lg transition-colors ${
                            formData.preferredElements?.includes(element.id)
                              ? "bg-[#F6E27F] text-[#0E0F1B] border-[#F6E27F]"
                              : "bg-[#0E0F1B] border-gray-600 text-white hover:border-[#F6E27F]"
                          }`}
                        >
                          <div
                            className={`font-medium ${formData.preferredElements?.includes(element.id) ? "" : element.color}`}
                          >
                            {element.label}
                          </div>
                          <div className="text-sm opacity-70">
                            {element.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#F6E27F] text-[#0E0F1B] rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OracleSettings;
