'use client';

import { useState } from 'react';

interface BirthForm {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  email?: string;
  saveProfile: boolean;
}

interface ChartResult {
  planet: string;
  sign: string;
  house: number;
  facet: string;
}

export default function AstroFormPage() {
  const [form, setForm] = useState<BirthForm>({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    email: '',
    saveProfile: false,
  });

  const [chart, setChart] = useState<ChartResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/astro-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setChart(data.positions || []);
    } catch (err) {
      console.error('Error generating chart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white/80 p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-purple-700">🌠 Spiralogic Birth Chart</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="time"
          name="timeOfBirth"
          value={form.timeOfBirth}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="text"
          name="placeOfBirth"
          placeholder="City, Country"
          value={form.placeOfBirth}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="saveProfile"
            checked={form.saveProfile}
            onChange={handleChange}
          />
          <span>Save my profile for later access</span>
        </label>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Generating...' : '✨ Create Spiralogic Chart'}
        </button>
      </form>

      {chart.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-purple-800">🔮 Your Spiralogic Profile</h3>
          {chart.map((entry, idx) => (
            <div key={idx} className="border rounded p-4 bg-white mb-3 shadow">
              <p className="font-medium">
                {entry.planet} in {entry.sign} • House {entry.house}
              </p>
              <p className="text-sm text-gray-700">
                ↳ Spiralogic Facet: <strong>{entry.facet}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
