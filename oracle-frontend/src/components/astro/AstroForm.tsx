'use client';

import { useState } from 'react';

export default function AstroForm() {
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    email: '',
    saveProfile: false,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

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

    const payload = {
      name: form.fullName,
      date: form.dateOfBirth,
      time: form.timeOfBirth,
      location: form.placeOfBirth,
      email: form.email,
      save: form.saveProfile,
    };

    try {
      const res = await fetch('/api/astro-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data.positions);
    } catch (err) {
      console.error('Astro submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-8 bg-white/80 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-purple-700">🌠 Birth Chart Entry</h2>

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="w-full border rounded p-2"
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
        placeholder="Place of Birth (City, Country)"
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
        {loading ? 'Calculating...' : '✨ Generate Spiralogic Chart'}
      </button>

      {response && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-indigo-700">🔮 Spiralogic Results</h3>
          {response.map((entry: any, idx: number) => (
            <div key={idx} className="border p-4 rounded shadow bg-white">
              <p><strong>{entry.planet}</strong> in {entry.sign} • House {entry.house}</p>
              <p className="text-sm text-gray-600">↳ Facet: <strong>{entry.facet}</strong></p>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
