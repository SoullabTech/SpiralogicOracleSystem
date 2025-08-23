"use client";

import { useState, useEffect } from "react";
import { features, flags } from "@/lib/config/features";
import { Flag, AlertTriangle, CheckCircle, Clock, Users, Zap } from "lucide-react";

type FlagCategory = "Core" | "Features" | "Experimental" | "Debug";
type FlagStatus = "enabled" | "disabled" | "partial" | "error";

type FeatureFlag = {
  key: string;
  name: string;
  description: string;
  category: FlagCategory;
  status: FlagStatus;
  value: any;
  envVar: string;
  dependencies?: string[];
  impact: "low" | "medium" | "high";
  rolloutPercentage?: number;
};

const flagDefinitions: FeatureFlag[] = [
  // Core System
  {
    key: "library.enabled",
    name: "Library System",
    description: "Core document and conversation library functionality",
    category: "Core",
    status: features.library.enabled ? "enabled" : "disabled",
    value: features.library.enabled,
    envVar: "NEXT_PUBLIC_LIBRARY_ENABLED",
    impact: "high"
  },
  {
    key: "oracle.weaveEnabled", 
    name: "Oracle Weaving",
    description: "AI-powered conversation synthesis and memory creation",
    category: "Core",
    status: features.oracle.weaveEnabled ? "enabled" : "disabled",
    value: features.oracle.weaveEnabled,
    envVar: "NEXT_PUBLIC_ORACLE_WEAVE_ENABLED",
    impact: "high"
  },
  
  // Whispers System
  {
    key: "whispers.enabled",
    name: "Whispers System",
    description: "Contextual memory surfacing and micro-memories",
    category: "Features", 
    status: features.whispers?.enabled ? "enabled" : "disabled",
    value: features.whispers?.enabled,
    envVar: "NEXT_PUBLIC_WHISPERS_ENABLED",
    impact: "medium",
    rolloutPercentage: 0 // Start at 0% for safe rollout
  },
  {
    key: "whispers.contextRanking",
    name: "Context Ranking",
    description: "Intelligent ranking of whispers based on current context",
    category: "Features",
    status: features.whispers?.contextRanking ? "enabled" : "disabled", 
    value: features.whispers?.contextRanking,
    envVar: "NEXT_PUBLIC_WHISPERS_CONTEXT_RANKING",
    dependencies: ["whispers.enabled"],
    impact: "low"
  },
  
  // Voice & AI
  {
    key: "oracle.voiceEnabled",
    name: "Voice Interface",
    description: "Speech-to-text and text-to-speech capabilities",
    category: "Features",
    status: features.oracle.voiceEnabled ? "enabled" : "disabled",
    value: features.oracle.voiceEnabled,
    envVar: "NEXT_PUBLIC_ORACLE_VOICE_ENABLED",
    impact: "medium"
  },
  {
    key: "oracle.mayaVoice",
    name: "Maya Voice Assistant",
    description: "AI voice personality and contextual audio cues",
    category: "Features",
    status: features.oracle.mayaVoice ? "enabled" : "disabled",
    value: features.oracle.mayaVoice,
    envVar: "NEXT_PUBLIC_ORACLE_MAYA_VOICE",
    dependencies: ["oracle.voiceEnabled"],
    impact: "low"
  },
  
  // Neurodivergent Features
  {
    key: "neurodivergent.enabled",
    name: "Neurodivergent Mode", 
    description: "ADHD-friendly interfaces and quick capture tools",
    category: "Features",
    status: features.neurodivergent.enabled ? "enabled" : "disabled",
    value: features.neurodivergent.enabled,
    envVar: "NEXT_PUBLIC_ND_ENABLED",
    impact: "medium"
  },
  
  // Beta Features
  {
    key: "beta.constellationView",
    name: "Constellation View",
    description: "Experimental 3D visualization of memory connections",
    category: "Experimental",
    status: features.beta.constellationView ? "enabled" : "disabled",
    value: features.beta.constellationView,
    envVar: "NEXT_PUBLIC_BETA_CONSTELLATION",
    impact: "low"
  },
  {
    key: "beta.advancedMemory",
    name: "Advanced Memory",
    description: "Experimental memory formation and retrieval algorithms",
    category: "Experimental", 
    status: features.beta.advancedMemory ? "enabled" : "disabled",
    value: features.beta.advancedMemory,
    envVar: "NEXT_PUBLIC_BETA_MEMORY",
    impact: "high"
  },
  
  // Debug & Development
  {
    key: "dev.enabled",
    name: "Developer Tools",
    description: "Debug panels, performance monitors, and dev utilities",
    category: "Debug",
    status: features.dev.enabled ? "enabled" : "disabled",
    value: features.dev.enabled,
    envVar: "NEXT_PUBLIC_DEV_TOOLS", 
    impact: "low"
  }
];

export default function FeatureFlagPanel() {
  const [flags, setFlags] = useState<FeatureFlag[]>(flagDefinitions);
  const [selectedCategory, setSelectedCategory] = useState<FlagCategory | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFlags = flags.filter(flag => {
    const matchesCategory = selectedCategory === "All" || flag.category === selectedCategory;
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: FlagStatus) => {
    switch (status) {
      case "enabled": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "disabled": return <Flag className="w-4 h-4 text-gray-400" />;
      case "partial": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-400 bg-red-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "low": return "text-green-400 bg-green-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getCategoryColor = (category: FlagCategory) => {
    switch (category) {
      case "Core": return "text-blue-400 bg-blue-500/10";
      case "Features": return "text-green-400 bg-green-500/10";
      case "Experimental": return "text-purple-400 bg-purple-500/10";
      case "Debug": return "text-orange-400 bg-orange-500/10";
    }
  };

  const categoryStats = {
    Core: flags.filter(f => f.category === "Core"),
    Features: flags.filter(f => f.category === "Features"),
    Experimental: flags.filter(f => f.category === "Experimental"),
    Debug: flags.filter(f => f.category === "Debug")
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(categoryStats).map(([category, categoryFlags]) => {
          const enabled = categoryFlags.filter(f => f.status === "enabled").length;
          const total = categoryFlags.length;
          
          return (
            <div key={category} className="p-4 rounded-2xl border border-edge-700 bg-bg-900">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium px-2 py-1 rounded-full ${getCategoryColor(category as FlagCategory)}`}>
                  {category}
                </h3>
                <span className="text-xs text-ink-400">{enabled}/{total}</span>
              </div>
              <div className="text-2xl font-bold text-ink-100">{enabled}</div>
              <p className="text-xs text-ink-400">Active Features</p>
              <div className="mt-2 bg-edge-800 rounded-full h-1">
                <div 
                  className="bg-gold-400 h-1 rounded-full transition-all"
                  style={{ width: `${(enabled / total) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["All", "Core", "Features", "Experimental", "Debug"].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as FlagCategory | "All")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? "bg-gold-400 text-bg-900 font-medium"
                  : "bg-edge-800 text-ink-300 hover:bg-edge-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search flags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-bg-800 border border-edge-600 rounded-lg text-sm text-ink-100 placeholder:text-ink-400"
          />
          <button className="px-4 py-2 bg-gold-400 text-bg-900 rounded-lg text-sm font-medium hover:bg-gold-300 transition-colors">
            Apply Changes
          </button>
        </div>
      </div>

      {/* Flags List */}
      <div className="grid gap-4">
        {filteredFlags.map(flag => (
          <div key={flag.key} className="p-4 rounded-xl border border-edge-700 bg-bg-900">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(flag.status)}
                <div>
                  <h3 className="font-medium text-ink-100">{flag.name}</h3>
                  <p className="text-sm text-ink-300">{flag.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(flag.category)}`}>
                  {flag.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(flag.impact)}`}>
                  {flag.impact}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-ink-400">
                <span>Env: <code className="text-ink-300">{flag.envVar}</code></span>
                <span>Value: <code className="text-ink-300">{String(flag.value)}</code></span>
                {flag.rolloutPercentage !== undefined && (
                  <span>Rollout: <code className="text-gold-400">{flag.rolloutPercentage}%</code></span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {flag.rolloutPercentage !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-ink-400" />
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={flag.rolloutPercentage}
                      className="w-20 accent-gold-400"
                      onChange={(e) => {
                        const newFlags = flags.map(f => 
                          f.key === flag.key 
                            ? { ...f, rolloutPercentage: parseInt(e.target.value) }
                            : f
                        );
                        setFlags(newFlags);
                      }}
                    />
                    <span className="text-xs text-ink-300 w-8">{flag.rolloutPercentage}%</span>
                  </div>
                )}
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flag.status === "enabled"}
                    className="rounded accent-gold-400"
                    onChange={(e) => {
                      const newFlags = flags.map(f => 
                        f.key === flag.key 
                          ? { ...f, status: e.target.checked ? "enabled" : "disabled", value: e.target.checked }
                          : f
                      );
                      setFlags(newFlags);
                    }}
                  />
                  <span className="text-sm text-ink-300">Enable</span>
                </label>
              </div>
            </div>
            
            {flag.dependencies && (
              <div className="mt-3 pt-3 border-t border-edge-700">
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <Zap className="w-3 h-3" />
                  <span>Depends on: {flag.dependencies.join(", ")}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}