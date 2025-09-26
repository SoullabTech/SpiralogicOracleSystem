'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

interface ProfileData {
  name: string;
  age?: string;
  pronouns?: string;
  location?: string;
  biography?: string;
  greetingStyle?: 'warm' | 'gentle' | 'direct' | 'playful';
  communicationPreference?: 'voice' | 'chat' | 'either';
  focusAreas?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData>({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('onboardingData');
    const explorerName = sessionStorage.getItem('explorerName') ||
                        localStorage.getItem('explorerName');

    if (storedData) {
      setData(JSON.parse(storedData));
    } else if (explorerName) {
      setData({ name: explorerName });
    } else {
      router.replace('/beta-entry');
    }
  }, [router]);

  const updateData = (field: keyof ProfileData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    localStorage.setItem('onboardingData', JSON.stringify(data));
    localStorage.setItem('explorerName', data.name);
    sessionStorage.setItem('explorerName', data.name);

    const explorerId = sessionStorage.getItem('explorerId') ||
                      localStorage.getItem('explorerId');

    try {
      await fetch('/api/beta/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, explorerId })
      });

      setSaveMessage('Profile saved successfully!');
    } catch (error) {
      setSaveMessage('Saved locally');
    }

    setIsSaving(false);

    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-amber-200/60 hover:text-amber-200/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Holoflower size="md" glowIntensity="medium" />
            <div>
              <h1 className="text-2xl font-light text-amber-50">Your Profile</h1>
              <p className="text-sm text-amber-200/50">Update your information anytime</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-amber-200/70 mb-2">Name</label>
              <input
                type="text"
                value={data.name || ''}
                onChange={(e) => updateData('name', e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-amber-200/70 mb-2">Age range (optional)</label>
                <select
                  value={data.age || ''}
                  onChange={(e) => updateData('age', e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/40"
                >
                  <option value="">Prefer not to say</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-amber-200/70 mb-2">Pronouns (optional)</label>
                <select
                  value={data.pronouns || ''}
                  onChange={(e) => updateData('pronouns', e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/40"
                >
                  <option value="">Prefer not to say</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                  <option value="they/them">they/them</option>
                  <option value="she/they">she/they</option>
                  <option value="he/they">he/they</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/70 mb-2">Location (optional)</label>
              <input
                type="text"
                value={data.location || ''}
                onChange={(e) => updateData('location', e.target.value)}
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/70 mb-2">About you (optional)</label>
              <textarea
                value={data.biography || ''}
                onChange={(e) => updateData('biography', e.target.value)}
                placeholder="Your personal, professional, or spiritual background..."
                rows={6}
                className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-200/70 mb-3">Greeting style</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'warm', label: 'Warm & nurturing', emoji: '🤗' },
                  { value: 'gentle', label: 'Gentle & soft', emoji: '🕊️' },
                  { value: 'direct', label: 'Direct & clear', emoji: '💎' },
                  { value: 'playful', label: 'Playful & creative', emoji: '✨' }
                ].map(style => (
                  <button
                    key={style.value}
                    onClick={() => updateData('greetingStyle', style.value)}
                    className={`px-4 py-3 rounded-lg border transition-all text-left ${
                      data.greetingStyle === style.value
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-100'
                        : 'bg-black/20 border-amber-500/20 text-amber-200/50 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="text-lg mb-1">{style.emoji}</div>
                    <div className="text-sm">{style.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/70 mb-3">Communication preference</label>
              <div className="flex gap-3">
                {[
                  { value: 'voice', label: 'Voice first' },
                  { value: 'chat', label: 'Chat first' },
                  { value: 'either', label: 'Either way' }
                ].map(pref => (
                  <button
                    key={pref.value}
                    onClick={() => updateData('communicationPreference', pref.value)}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      data.communicationPreference === pref.value
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-100'
                        : 'bg-black/20 border-amber-500/20 text-amber-200/50 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="text-sm">{pref.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-amber-200/70 mb-3">Focus areas (optional)</label>
              <div className="space-y-2">
                {[
                  'Self-discovery',
                  'Life transitions',
                  'Creative exploration',
                  'Spiritual growth',
                  'Personal healing',
                  'Relationship insights',
                  'Purpose & meaning',
                  'Just curious'
                ].map(area => (
                  <label key={area} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.focusAreas?.includes(area) || false}
                      onChange={(e) => {
                        const current = data.focusAreas || [];
                        if (e.target.checked) {
                          updateData('focusAreas', [...current, area]);
                        } else {
                          updateData('focusAreas', current.filter(a => a !== area));
                        }
                      }}
                      className="mr-3 rounded border-amber-500/30 bg-black/30 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span className="text-sm text-amber-200/60 group-hover:text-amber-200/80 transition-colors">
                      {area}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-amber-500/20">
            <div className="text-sm">
              {saveMessage && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-amber-400"
                >
                  {saveMessage}
                </motion.span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}