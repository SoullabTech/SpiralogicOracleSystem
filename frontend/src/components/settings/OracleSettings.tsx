// frontend/src/components/settings/OracleSettings.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useOracleConfig } from "../../hooks/useOracleConfig";

const voiceOptions = [
  { id: "aunt-annie", label: "Aunt Annie (Warm & Wise)" },
  { id: "sage-masculine", label: "Sage (Masculine & Grounded)" },
  { id: "visionary-soft", label: "Visionary (Soft & Ethereal)" },
  { id: "clarity-crisp", label: "Clarity (Crisp & Direct)" },
];

const OracleSettings: React.FC = () => {
  const { config, saveConfig, clearConfig, isLoading } = useOracleConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(config.oracleName);
  const [editVoice, setEditVoice] = useState(config.oracleVoice);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when config changes
  React.useEffect(() => {
    setEditName(config.oracleName);
    setEditVoice(config.oracleVoice);
  }, [config]);

  const handleSave = async () => {
    if (!editName.trim() || !editVoice) return;

    setIsSaving(true);
    try {
      await saveConfig({
        oracleName: editName.trim(),
        oracleVoice: editVoice,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save Oracle settings:', error);
      // Could show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(config.oracleName);
    setEditVoice(config.oracleVoice);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your Oracle configuration? This will clear all settings.')) {
      clearConfig();
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-[#1A1C2C] border border-gray-600 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-[#1A1C2C] border border-gray-600 rounded-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#F6E27F]">Oracle Configuration</h3>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-400 hover:text-[#F6E27F] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        // View Mode
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Oracle Name</label>
            <div className="text-lg text-white font-medium">
              {config.oracleName || "Not configured"}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Voice</label>
            <div className="text-lg text-white">
              {voiceOptions.find(v => v.id === config.oracleVoice)?.label || "Not selected"}
            </div>
          </div>

          {config.oracleName && config.oracleVoice && (
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleReset}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Reset Oracle Configuration
              </button>
            </div>
          )}
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Oracle Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter Oracle name..."
              className="w-full px-4 py-3 bg-[#0E0F1B] border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-[#F6E27F] focus:outline-none transition-colors"
              maxLength={50}
            />
            <div className="text-xs text-gray-500 mt-1">
              {editName.length}/50 characters
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Voice</label>
            <div className="space-y-2">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setEditVoice(voice.id)}
                  className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                    editVoice === voice.id
                      ? "bg-[#F6E27F] text-[#0E0F1B] border-[#F6E27F]"
                      : "bg-[#0E0F1B] border-gray-600 text-white hover:border-[#F6E27F]"
                  }`}
                >
                  {voice.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!editName.trim() || !editVoice || isSaving}
              className="flex-1 bg-[#F6E27F] text-[#0E0F1B] px-4 py-2 rounded-lg font-medium hover:bg-[#F6E27F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 bg-transparent border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OracleSettings;