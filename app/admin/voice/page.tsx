// Voice/TTS Management Panel
"use client";

import { useState, useEffect } from 'react';

interface VoiceSettings {
  enabled: boolean;
  provider: 'elevenlabs' | 'openai' | 'azure';
  voice_id: string;
  speed: number;
  pitch: number;
  stability: number;
  clarity: number;
  style: number;
}

export default function VoiceManagementPage() {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    provider: 'elevenlabs',
    voice_id: '',
    speed: 1.0,
    pitch: 1.0,
    stability: 0.75,
    clarity: 0.75,
    style: 0.5
  });
  const [loading, setLoading] = useState(false);
  const [testAudio, setTestAudio] = useState<string | null>(null);
  const [testPlaying, setTestPlaying] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save voice settings
      console.log('Saving voice settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Voice settings saved successfully');
    } catch (error) {
      console.error('Failed to save voice settings:', error);
      alert('Failed to save voice settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTestPlaying(true);
    try {
      // TODO: Implement TTS test
      const testText = "Hello, this is a test of the Oracle voice synthesis. The sacred intelligence speaks with wisdom and compassion.";
      console.log('Testing voice with text:', testText);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate TTS generation
      alert('Voice test completed (placeholder)');
    } catch (error) {
      console.error('Voice test failed:', error);
      alert('Voice test failed');
    } finally {
      setTestPlaying(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎙️ Voice/TTS Management
          </h1>
          <a 
            href="/admin/overview"
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Back to Console
          </a>
        </div>

        {/* Global Voice Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Global Voice Settings
          </h2>
          
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice Synthesis Enabled
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enable text-to-speech for Oracle responses
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                TTS Provider
              </label>
              <select
                value={settings.provider}
                onChange={(e) => setSettings(prev => ({ ...prev, provider: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!settings.enabled}
              >
                <option value="elevenlabs">ElevenLabs (Recommended)</option>
                <option value="openai">OpenAI TTS</option>
                <option value="azure">Azure Cognitive Services</option>
              </select>
            </div>

            {/* Voice ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice ID
              </label>
              <input
                type="text"
                value={settings.voice_id}
                onChange={(e) => setSettings(prev => ({ ...prev, voice_id: e.target.value }))}
                placeholder="Enter voice ID (e.g., pNInz6obpgDQGcFmaJgB)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!settings.enabled}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ElevenLabs voice ID or equivalent for other providers
              </p>
            </div>
          </div>
        </div>

        {/* Voice Parameters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Voice Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Speed: {settings.speed.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.speed}
                onChange={(e) => setSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={!settings.enabled}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Pitch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pitch: {settings.pitch.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => setSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={!settings.enabled}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Stability (ElevenLabs specific) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stability: {(settings.stability * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.stability}
                onChange={(e) => setSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={!settings.enabled || settings.provider !== 'elevenlabs'}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Variable</span>
                <span>Consistent</span>
              </div>
            </div>

            {/* Clarity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clarity: {(settings.clarity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.clarity}
                onChange={(e) => setSettings(prev => ({ ...prev, clarity: parseFloat(e.target.value) }))}
                className="w-full"
                disabled={!settings.enabled || settings.provider !== 'elevenlabs'}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Soft</span>
                <span>Crisp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test & Actions
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTest}
              disabled={!settings.enabled || testPlaying}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {testPlaying ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  🔊 Test Voice
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Voice Library (Future) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-dashed">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Voice Library (Coming Soon)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Curated collection of voices optimized for Oracle interactions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white">Sage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wise, contemplative tone</p>
              <button className="mt-2 text-xs text-blue-600 dark:text-blue-400" disabled>
                Preview (Soon)
              </button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white">Compassion</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warm, nurturing tone</p>
              <button className="mt-2 text-xs text-blue-600 dark:text-blue-400" disabled>
                Preview (Soon)
              </button>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white">Clarity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clear, articulate tone</p>
              <button className="mt-2 text-xs text-blue-600 dark:text-blue-400" disabled>
                Preview (Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}