'use client';

import React, { useState, useEffect } from 'react';

interface IChingData {
  profile: any;
  birthArchetype: any;
  currentArchetype: any;
  compatibility?: any;
}

export default function AstrologyDashboard() {
  const [birthDate, setBirthDate] = useState('');
  const [iChingData, setIChingData] = useState<IChingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load default birth date from localStorage or use a sample date
  useEffect(() => {
    const savedBirthDate = localStorage.getItem('userBirthDate');
    if (savedBirthDate) {
      setBirthDate(savedBirthDate);
      loadIChingProfile(savedBirthDate);
    } else {
      // Default to a sample date for demo
      const sampleDate = '1990-06-15';
      setBirthDate(sampleDate);
      loadIChingProfile(sampleDate);
    }
  }, []);

  const loadIChingProfile = async (dateString: string) => {
    if (!dateString) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/iching/astro?birthDate=${dateString}`);
      const data = await response.json();

      if (data.success) {
        setIChingData(data);
        localStorage.setItem('userBirthDate', dateString);
      } else {
        setError(data.error || 'Failed to load I Ching profile');
      }
    } catch (err) {
      setError('Network error loading I Ching profile');
      console.error('I Ching profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate) {
      loadIChingProfile(birthDate);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⭐ Astrology Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore your cosmic blueprint through Taoist and I Ching astrology
          </p>
        </div>

        {/* Birth Date Input */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">📅 Birth Information</h3>
            <form onSubmit={handleDateSubmit} className="space-y-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Birth Date</label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !birthDate}
              >
                {loading ? '⏳ Loading Profile...' : 'Generate Astrology Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Astrology Content */}
        <div className="w-full">
          <div className="max-w-4xl mx-auto">
            {iChingData ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">🔮 Your I Ching Profile</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Birth Profile</h3>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(iChingData.profile, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Birth Archetype</h3>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(iChingData.birthArchetype, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Current Archetype</h3>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(iChingData.currentArchetype, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🧭</div>
                <p className="text-gray-600">Enter your birth date to generate your I Ching astrology profile</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">🔧 Astrology Tools</h3>
            <p className="text-gray-600 mb-4">Quick access to divination and timing tools</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">🧭</div>
                <div className="font-semibold">Daily Hexagram</div>
                <div className="text-xs text-gray-500">Get today's I Ching guidance</div>
              </button>

              <button className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold">Optimal Timing</div>
                <div className="text-xs text-gray-500">Find auspicious dates</div>
              </button>

              <button className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="font-semibold">Compatibility</div>
                <div className="text-xs text-gray-500">Compare trigram profiles</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}