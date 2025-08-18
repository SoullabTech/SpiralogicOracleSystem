// Voice Settings Page - Configure agent name, voice, and speech parameters
"use client";

import { useState, useEffect } from 'react';
import { VOICE_OPTIONS, preview, getVoiceName } from '../../../lib/voice';
import { VoicePlayer } from '../../../components/voice/VoicePlayer';

interface VoiceSettings {
  agent_name?: string | null;
  voice_provider?: string;
  voice_id?: string | null;
  tts_enabled?: boolean;
  speech_rate?: number;
  speech_pitch?: number;
}

const PREVIEW_TEXT = "Hi, I'm your Oracle. I'll keep things clear and honest.";

export default function VoiceSettingsPage() {
  const [settings, setSettings] = useState<VoiceSettings>({
    agent_name: '',
    voice_provider: 'elevenlabs',
    voice_id: '',
    tts_enabled: false,
    speech_rate: 1.0,
    speech_pitch: 1.0,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings/voice-agent');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.warn('Failed to load settings');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handlePreview = async () => {
    if (!settings.voice_id || settings.voice_id === 'later') return;
    
    setPreviewing(true);
    setPreviewError(null);
    setPreviewAudio(null);

    try {
      const result = await preview(PREVIEW_TEXT, settings.voice_id);
      
      if (result.success) {
        if (result.usedFallback) {
          setPreviewError("using system voice");
        } else if (result.audioUrl) {
          setPreviewAudio(result.audioUrl);
        }
      } else {
        setPreviewError(result.error || "Preview failed");
      }
    } catch (error) {
      setPreviewError("voice offline");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/settings/voice-agent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage(`Error: ${error.error || 'Failed to save'}`);
      }
    } catch (error) {
      setSaveMessage("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-app-muted">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-headline text-app-text">
            Voice Settings
          </h1>
          <p className="text-app-muted text-body">
            Customize how your Oracle speaks and responds
          </p>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Agent Name */}
          <div className="bg-app-surface rounded-apple p-6 border border-app-border">
            <label className="block mb-3">
              <span className="text-app-text text-body font-medium">Agent Name</span>
              <p className="text-app-muted text-caption mt-1">
                What should your Oracle call itself?
              </p>
            </label>
            <input
              type="text"
              value={settings.agent_name || ''}
              onChange={(e) => updateSetting('agent_name', e.target.value.slice(0, 32) || null)}
              placeholder="Oracle, Sage, Wisdom, etc."
              className="
                w-full p-3 rounded-apple-sm bg-app-bg border border-app-border
                text-app-text placeholder-app-muted
                focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                transition-all duration-apple
              "
              maxLength={32}
            />
            <p className="text-xs text-app-muted mt-1">
              {(settings.agent_name || '').length}/32 characters
            </p>
          </div>

          {/* Voice Selection */}
          <div className="bg-app-surface rounded-apple p-6 border border-app-border">
            <label className="block mb-3">
              <span className="text-app-text text-body font-medium">Voice</span>
              <p className="text-app-muted text-caption mt-1">
                Choose how your Oracle should sound
              </p>
            </label>
            
            <select
              value={settings.voice_id || ''}
              onChange={(e) => updateSetting('voice_id', e.target.value || null)}
              className="
                w-full p-3 rounded-apple-sm bg-app-bg border border-app-border
                text-app-text focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20
                transition-all duration-apple
              "
            >
              <option value="">Select a voice</option>
              {VOICE_OPTIONS.filter(v => v.id !== 'later').map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>

            {/* Preview Button */}
            {settings.voice_id && settings.voice_id !== 'later' && (
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewing}
                  className="
                    px-4 py-2 rounded-apple-sm bg-app-border text-app-text
                    hover:bg-app-border/80 disabled:opacity-50
                    transition-all duration-apple focus:outline-none focus:ring-2 focus:ring-white/20
                  "
                >
                  {previewing ? 'Previewing...' : 'Preview Voice'}
                </button>
                
                {previewAudio && (
                  <VoicePlayer 
                    src={previewAudio} 
                    className="w-full"
                    onEnd={() => setPreviewAudio(null)}
                  />
                )}
                
                {previewError && (
                  <p className="text-xs text-orange-400">
                    {previewError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Speech Enabled Toggle */}
          <div className="bg-app-surface rounded-apple p-6 border border-app-border">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={settings.tts_enabled || false}
                onChange={(e) => updateSetting('tts_enabled', e.target.checked)}
                className="
                  mt-1 rounded border-app-border bg-app-bg text-indigo-500 
                  focus:ring-indigo-500 focus:ring-offset-0 focus:ring-2
                "
              />
              <div>
                <span className="text-app-text text-body font-medium">Speak replies aloud</span>
                <p className="text-app-muted text-caption mt-1">
                  Enable text-to-speech for Oracle responses
                </p>
              </div>
            </label>
          </div>

          {/* Speech Rate Slider */}
          <div className="bg-app-surface rounded-apple p-6 border border-app-border">
            <label className="block mb-3">
              <span className="text-app-text text-body font-medium">Speech Rate</span>
              <p className="text-app-muted text-caption mt-1">
                How fast should the Oracle speak? ({settings.speech_rate?.toFixed(2)}x)
              </p>
            </label>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={settings.speech_rate || 1.0}
              onChange={(e) => updateSetting('speech_rate', parseFloat(e.target.value))}
              className="
                w-full h-2 bg-app-border rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-app-text [&::-webkit-slider-thumb]:cursor-pointer
              "
            />
            <div className="flex justify-between text-xs text-app-muted mt-1">
              <span>Slower (0.8x)</span>
              <span>Normal (1.0x)</span>
              <span>Faster (1.25x)</span>
            </div>
          </div>

          {/* Speech Pitch Slider */}
          <div className="bg-app-surface rounded-apple p-6 border border-app-border">
            <label className="block mb-3">
              <span className="text-app-text text-body font-medium">Speech Pitch</span>
              <p className="text-app-muted text-caption mt-1">
                Adjust the voice pitch ({settings.speech_pitch?.toFixed(2)}x)
              </p>
            </label>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={settings.speech_pitch || 1.0}
              onChange={(e) => updateSetting('speech_pitch', parseFloat(e.target.value))}
              className="
                w-full h-2 bg-app-border rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-app-text [&::-webkit-slider-thumb]:cursor-pointer
              "
            />
            <div className="flex justify-between text-xs text-app-muted mt-1">
              <span>Lower (0.8x)</span>
              <span>Normal (1.0x)</span>
              <span>Higher (1.25x)</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-center space-y-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              px-8 py-3 rounded-apple bg-indigo-500 text-white font-medium
              hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-apple focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            "
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          {saveMessage && (
            <p className={`text-caption ${
              saveMessage.includes('Error') ? 'text-red-400' : 'text-green-400'
            }`}>
              {saveMessage}
            </p>
          )}
        </div>

        {/* Back to App */}
        <div className="text-center">
          <a
            href="/now"
            className="text-app-muted hover:text-app-text text-caption transition-colors"
          >
            ← Back to Oracle
          </a>
        </div>
      </div>
    </div>
  );
}