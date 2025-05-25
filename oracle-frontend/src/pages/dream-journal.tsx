'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Feather, Sparkles, Mic, MicOff } from 'lucide-react';
import { useWhisperRecorder } from '@/lib/hooks/useWhisperRecorder';
import WhisperPlayer from '@/components/WhisperPlayer';
import { PersonalOracleAgent } from '@/core/agents/PersonalOracleAgent';

interface DreamEntry {
  id: number;
  date: string;
  dream: string;
  element?: string;
  tags?: string[];
  insight?: string;
  symbols?: string[];
  phase?: string;
  archetype?: string;
  reflection?: string;
}

const elementColors: Record<string, string> = {
  fire: 'bg-orange-100 text-orange-800',
  water: 'bg-blue-100 text-blue-800',
  earth: 'bg-green-100 text-green-800',
  air: 'bg-sky-100 text-sky-800',
  aether: 'bg-purple-100 text-purple-800',
};

export default function DreamJournalPage() {
  const [dream, setDream] = useState('');
  const [tags, setTags] = useState('');
  const [archetype, setArchetype] = useState('Mystic');
  const [lucidity, setLucidity] = useState('unknown');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectingId, setReflectingId] = useState<number | null>(null);

  const { startRecording, stopRecording, transcript, isRecording } = useWhisperRecorder();

  // Auto-fill transcript if dream field is empty
  useEffect(() => {
    if (transcript && dream.trim() === '') {
      setDream(transcript);
    }
  }, [transcript]);

  const fetchDreams = async () => {
    const { data, error } = await supabase.from('spiral_breaths').select('*').neq('dream', null);
    if (!error && data) setDreams(data);
  };

  useEffect(() => {
    fetchDreams();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const tagArray = tags.split(',').map((t) => t.trim()).filter((t) => t);
    const userId = 'demo-user-1'; // Replace with session hook

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
      // 🔮 Fetch oracle insight and reflection
      const oracle = new PersonalOracleAgent({
        userId,
        oracleName: 'AÍÑ',
        tone: archetype.toLowerCase(),
      });

      const insight = await oracle.getArchetypalInsight('aether');
      const reflection = await oracle.getDailyReflection();

      await supabase.from('spiral_breaths')
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
      fetchDreams();
    }

    setSaving(false);
  };

  const saveReflection = async (id: number) => {
    await supabase.from('spiral_breaths').update({ reflection: reflectionText }).eq('id', id);
    setDreams((prev) => prev.map((d) => (d.id === id ? { ...d, reflection: reflectionText } : d)));
    setReflectingId(null);
    setReflectionText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-100 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-4">🌙 Spiral Dream Journal</h1>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <textarea
            rows={3}
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="Describe your dream..."
            className="w-full p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="px-3 py-1 bg-indigo-600 text-white rounded flex items-center gap-1"
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              {isRecording ? 'Stop' : '🎙 Record'}
            </button>

            {transcript && (
              <p className="text-xs text-indigo-700 italic mt-1">
                Transcript ready. <WhisperPlayer text={transcript} archetype={archetype} />
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Archetype</label>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                className="w-full p-2 border mt-1 rounded"
              >
                {['Mystic', 'Warrior', 'Healer', 'Oracle', 'Sage', 'Child'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Lucidity</label>
              <select
                value={lucidity}
                onChange={(e) => setLucidity(e.target.value)}
                className="w-full p-2 border mt-1 rounded"
              >
                {['unknown', 'lucid', 'non-lucid', 'visionary'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. mirror, ocean"
                className="w-full p-2 border mt-1 rounded"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !dream.trim()}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            {saving ? 'Saving...' : '💾 Save Dream'}
          </button>

          {success && (
            <p className="text-center text-sm text-green-600">✨ Dream saved successfully</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dreams.map((d) => {
            const isExpanded = expandedId === d.id;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-xl border shadow-sm"
              >
                <div onClick={() => setExpandedId(isExpanded ? null : d.id)}>
                  <div className="flex justify-between items-center cursor-pointer">
                    <p className="text-sm font-medium text-indigo-700">{d.dream}</p>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{new Date(d.date).toLocaleDateString()}</p>
                  {d.element && (
                    <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${elementColors[d.element]}`}>
                      {d.element.toUpperCase()}
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-3 text-sm space-y-2">
                    {d.phase && <p>Phase: {d.phase}</p>}
                    {d.archetype && <p>Archetype: {d.archetype}</p>}
                    {d.insight && <p className="italic">Insight: {d.insight}</p>}
                    {d.reflection && <p className="italic text-purple-700">Reflection: {d.reflection}</p>}

                    {reflectingId === d.id ? (
                      <div className="mt-2">
                        <textarea
                          rows={3}
                          className="w-full p-2 border rounded"
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                        />
                        <button
                          onClick={() => saveReflection(d.id)}
                          className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Save Reflection
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-indigo-600 underline mt-2"
                        onClick={() => {
                          setReflectingId(d.id);
                          setReflectionText(d.reflection || '');
                        }}
                      >
                        Reflect
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
