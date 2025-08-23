"use client";

import { useEffect, useState } from "react";
import { Settings, RefreshCw, Save, RotateCcw, Plus, Check, X } from "lucide-react";
import { BetaConfig } from "../../../../lib/beta/types";

export default function AdminBetaTuningPage() {
  const [config, setConfig] = useState<BetaConfig | null>(null);
  const [defaults, setDefaults] = useState<BetaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadConfig() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/beta/tuning');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load config');
      }
      
      setConfig(data.config);
      setDefaults(data.defaults);
      setError(null);
    } catch (error) {
      console.error('Failed to load config:', error);
      setError(error instanceof Error ? error.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  }

  async function saveConfig() {
    if (!config) return;
    
    try {
      setSaving(true);
      const res = await fetch('/api/admin/beta/tuning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch: config })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save config');
      }
      
      setConfig(data.config);
      setSuccess('Configuration saved successfully');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      setError(error instanceof Error ? error.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefaults() {
    if (!defaults) return;
    
    setConfig({ ...defaults });
    setError(null);
  }

  async function createInvites() {
    try {
      const res = await fetch('/api/admin/beta/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10, prefix: 'TUNE' })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invites');
      }
      
      setSuccess(`Created ${data.created} invite codes: ${data.codes.slice(0, 3).join(', ')}${data.codes.length > 3 ? '...' : ''}`);
      setError(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Failed to create invites:', error);
      setError(error instanceof Error ? error.message : 'Failed to create invites');
    }
  }

  function updateConfig(patch: Partial<BetaConfig>) {
    if (!config) return;
    setConfig({ ...config, ...patch });
  }

  function toggleStarterPackItem(item: string) {
    if (!config) return;
    
    const newStarterPack = config.starterPack.includes(item)
      ? config.starterPack.filter(i => i !== item)
      : [...config.starterPack, item];
    
    updateConfig({ starterPack: newStarterPack });
  }

  useEffect(() => {
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-zinc-400">Loading beta configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <div className="text-center text-red-400">Failed to load configuration</div>
        <button 
          onClick={loadConfig}
          className="mt-2 mx-auto block px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const starterPackOptions = [
    { key: 'oracle_turn', label: 'Oracle Turn' },
    { key: 'voice_preview', label: 'Voice Preview' },
    { key: 'holoflower_set', label: 'Holoflower Set' },
    { key: 'soul_memory_saved', label: 'Soul Memory Saved' },
    { key: 'thread_weave', label: 'Thread Weave' },
    { key: 'shadow_work', label: 'Shadow Work' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-400" />
          Beta Tuning Panel
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadConfig}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Badge System Settings */}
        <section className="rounded-2xl border border-zinc-800 p-5 bg-black/30">
          <h2 className="text-lg font-semibold mb-4">Badge System</h2>
          
          <div className="space-y-4">
            {/* Badges Enabled Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Badges Enabled</label>
              <button
                onClick={() => updateConfig({ badgesEnabled: !config.badgesEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  config.badgesEnabled ? 'bg-violet-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    config.badgesEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Pathfinder Days */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pathfinder Days Required: {config.pathfinderDays}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={config.pathfinderDays}
                onChange={(e) => updateConfig({ pathfinderDays: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>1 day</span>
                <span>7 days</span>
              </div>
            </div>

            {/* Pathfinder Window */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pathfinder Window: {config.pathfinderWindowDays} days
              </label>
              <input
                type="range"
                min="3"
                max="14"
                value={config.pathfinderWindowDays}
                onChange={(e) => updateConfig({ pathfinderWindowDays: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>3 days</span>
                <span>14 days</span>
              </div>
            </div>

            {/* Shadow Steward Threshold */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Shadow Steward Min Score: {config.shadowStewardMinScore.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="0.9"
                step="0.05"
                value={config.shadowStewardMinScore}
                onChange={(e) => updateConfig({ shadowStewardMinScore: Number(e.target.value) })}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-1">
                <span>0.5</span>
                <span>0.9</span>
              </div>
            </div>
          </div>
        </section>

        {/* Starter Pack Configuration */}
        <section className="rounded-2xl border border-zinc-800 p-5 bg-black/30">
          <h2 className="text-lg font-semibold mb-4">Starter Pack Events</h2>
          
          <div className="space-y-2">
            {starterPackOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => toggleStarterPackItem(option.key)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                  config.starterPack.includes(option.key)
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                    : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {config.starterPack.includes(option.key) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4 opacity-50" />
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-zinc-400">
            Selected: {config.starterPack.length} events required for Pioneer badge
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 rounded-lg font-semibold text-white transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        
        <button
          onClick={resetToDefaults}
          className="inline-flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        
        <button
          onClick={createInvites}
          className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition"
        >
          <Plus className="w-4 h-4" />
          Seed 10 Invites
        </button>
      </div>

      {/* Current Values Summary */}
      <section className="rounded-2xl border border-zinc-800 p-5 bg-black/30">
        <h3 className="text-sm font-semibold mb-3">Current Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-zinc-400">Badges</div>
            <div className={config.badgesEnabled ? 'text-emerald-400' : 'text-red-400'}>
              {config.badgesEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div>
            <div className="text-zinc-400">Pathfinder</div>
            <div>{config.pathfinderDays}/{config.pathfinderWindowDays} days</div>
          </div>
          <div>
            <div className="text-zinc-400">Shadow Min</div>
            <div>{config.shadowStewardMinScore.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-zinc-400">Starter Pack</div>
            <div>{config.starterPack.length} events</div>
          </div>
        </div>
      </section>
    </div>
  );
}