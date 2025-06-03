'use client';

import React, { useState, useEffect } from 'react';
import { RiveHoloflower } from '@/components/sacred/RiveHoloflower';

type PetalKeys =
  | 'consciousness'
  | 'community'
  | 'connection'
  | 'medicine'
  | 'means'
  | 'mission'
  | 'holiness'
  | 'healing'
  | 'heart'
  | 'expansion'
  | 'expression'
  | 'experience';

type PetalMap = Record<PetalKeys, number>;

const defaultPetals: PetalMap = {
  consciousness: 0,
  community: 0,
  connection: 0,
  medicine: 0,
  means: 0,
  mission: 0,
  holiness: 0,
  healing: 0,
  heart: 0,
  expansion: 0,
  expression: 0,
  experience: 0,
};

export default function HoloflowerJournalPage() {
  const [petals, setPetals] = useState<PetalMap>(defaultPetals);
  const [journal, setJournal] = useState('');

  // ⏳ Load saved state if it exists
  useEffect(() => {
    const saved = localStorage.getItem('holoflowerPetals');
    const savedJournal = localStorage.getItem('holoflowerJournal');
    if (saved) setPetals(JSON.parse(saved));
    if (savedJournal) setJournal(savedJournal);
  }, []);

  // 💾 Save changes automatically
  useEffect(() => {
    localStorage.setItem('holoflowerPetals', JSON.stringify(petals));
    localStorage.setItem('holoflowerJournal', journal);
  }, [petals, journal]);

  const handleSliderChange = (key: PetalKeys, value: number) => {
    setPetals((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-white p-8 space-y-8">
      <h1 className="text-3xl font-bold">🌸 Holoflower Journal</h1>

      <div className="h-[600px] border border-soullab-gray/20 rounded-xl relative bg-gray-50">
        <RiveHoloflower petals={petals} debug />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(petals).map(([key, val]) => (
          <div key={key}>
            <label className="font-medium capitalize">{key}</label>
            <input
              type="range"
              min={-100}
              max={100}
              value={val}
              onChange={(e) => handleSliderChange(key as PetalKeys, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block font-semibold mb-2">📝 Journal Reflection</label>
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Write your insights, emotions, and energetic observations here..."
        />
      </div>
    </div>
  );
}
