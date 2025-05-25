'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Mic, MicOff } from 'lucide-react';
import { useWhisperRecorder } from '@/lib/hooks/useWhisperRecorder';
import { PersonalOracleAgent } from '@/core/agents/PersonalOracleAgent';
import WhisperPlayer from '@/components/WhisperPlayer';

export default function DreamRecorderModal({ userId }: { userId: string }) {
  const [dream, setDream] = useState('');
  const [tags, setTags] = useState('');
  const [archetype, setArchetype] = useState('Mystic');
  const [lucidity, setLucidity] = useState('unknown');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { startRecording, stopRecording, transcript, isRecording } = useWhisperRecorder();

  // Auto-fill the dream from whisper transcript
  useEffect(() => {
    if (transcript && dream.trim() === '') {
      setDream(transcript);
    }
  }, [transcript]);

  const handleSave = async () => {
    setSaving(true);
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from('spiral_breaths').insert([
      {
        user_id: userId,
        dream,
        type: 'dream',
        element: 'aether',
        archetype,
        tags: tagArray,
        date: new Date().toISOString(),
        metadata: {
          lucidity,
          tone: archetype.toLowerCase(),
        },
      },
    ]);

    if (!error) {
      // 🧠 Activate the Oracle for insight and reflection
      const oracle = new PersonalOracleAgent({
        userId,
        oracleName: 'AÍÑ',
        tone: archetype.toLowerCase(),
      });

      const insight = await oracle.getArchetypalInsight('aether');
      const reflection = await oracle.getDailyReflection();

      // 🔄 Update same record with reflection + insight
      await supabase
        .from('spiral_breaths')
        .update({
          insight: insight.message,
          reflection,
        })
        .eq('dream', dream)
        .eq('user_id', userId);

      setSuccess(true);
      setDream('');
      setTags('');
      setTimeout(() => setSuccess(false), 2000);
    }

    setSaving(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-black/20 mt-6">
      <h2 className="text-lg font-bold text-indigo-700 mb-2 flex items-center gap-2">
        <Sparkles size={18} /> Record a New Dream
      </h2>

      <textarea
        rows={4}
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        placeholder="Describe your dream..."
        className="w-full p-2 border rounded"
      />

      {/* Voice Recording */}
      <div className="mt-2 flex gap-2 items-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
          {isRecording ? ' Stop' : '🎙 Record'}
        </button>
      </div>

      {transcript && (
        <p className="text-xs italic text-gray-600 mt-2">
          Whispered: “{transcript.slice(0, 100)}...”
        </p>
      )}

      {/* Archetype */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Archetype
        </label>
        <select
          value={archetype}
          onChange={(e) => setArchetype(e.target.value)}
          className="w-full p-2 border mt-1 rounded"
        >
          {['Mystic', 'Warrior', 'Healer', 'Oracle', 'Sage', 'Child'].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Lucidity */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Lucidity
        </label>
        <select
          value={lucidity}
          onChange={(e) => setLucidity(e.target.value)}
          className="w-full p-2 border mt-1 rounded"
        >
          {['unknown', 'lucid', 'non-lucid', 'visionary'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="mt-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. ocean, ancestors, mirror"
          className="w-full p-2 border rounded mt-1"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !dream.trim()}
        className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {saving ? 'Saving...' : '💾 Save Dream'}
      </button>

      {transcript && (
        <div className="mt-3 text-xs text-purple-700 italic">
          🗣️ Transcript Ready
          <WhisperPlayer text={transcript} archetype={archetype} />
        </div>
      )}

      {success && (
        <p className="text-sm mt-2 text-green-600 text-center">Dream saved successfully ✨</p>
      )}
    </div>
  );
}
