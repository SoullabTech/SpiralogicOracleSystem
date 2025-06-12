'use client';

import { useEffect, useState } from 'react';

type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

interface Pillar { 
  stem: string; 
  branch: string; 
  element: Element; 
  yinYang: 'Yin' | 'Yang'; 
}

interface Profile {
  year: Pillar; 
  month: Pillar; 
  day: Pillar; 
  hour: Pillar;
  elementTally: Record<Element, number>; 
  dominant: Element[]; 
  deficient: Element[];
  hexagram: string;
}

interface Ritual { 
  id: string; 
  title: string; 
  durationMin: number;
  description?: string;
  element: Element;
  type: string;
}

interface Insights {
  balanceScore: number;
  personality: string[];
  affirmations: string[];
  dailyRitual: Ritual;
  seasonalRitual: Ritual;
}

interface DashboardData {
  profile: Profile;
  rituals: Ritual[];
  insights: Insights;
}

const ELEMENT_COLORS: Record<Element, string> = {
  Wood: 'bg-green-100 text-green-800 border-green-300',
  Fire: 'bg-red-100 text-red-800 border-red-300',
  Earth: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Metal: 'bg-gray-100 text-gray-800 border-gray-300',
  Water: 'bg-blue-100 text-blue-800 border-blue-300'
};

const ELEMENT_SYMBOLS: Record<Element, string> = {
  Wood: '🌲',
  Fire: '🔥', 
  Earth: '🏔️',
  Metal: '⚡',
  Water: '💧'
};

export default function TaoistElementalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use stored birth data or default for demo
        const birthTimestamp = localStorage.getItem('birthTimestamp') || '1990-01-01T12:00:00Z';
        const tzOffset = new Date().getTimezoneOffset() * -1;

        const response = await fetch('/api/astrology/four-pillars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            birth: birthTimestamp, 
            tzOffsetMinutes: tzOffset 
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Four Pillars data');
        }

        const result = await response.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching Four Pillars data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your Five Element profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-semibold mb-2">Unable to Load Data</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { profile, rituals, insights } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🪷 Taoist Five Element Analysis</h1>
        <p className="text-gray-600">Your Ba Zi (Four Pillars) profile and elemental balance</p>
      </div>

      {/* Four Pillars Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          📅 Four Pillars (八字)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries({
            Year: profile.year,
            Month: profile.month, 
            Day: profile.day,
            Hour: profile.hour
          }).map(([pillarName, pillar]) => (
            <div key={pillarName} className="text-center">
              <h3 className="font-medium text-gray-700 mb-2">{pillarName} Pillar</h3>
              <div className={`p-3 rounded-lg border-2 ${ELEMENT_COLORS[pillar.element]}`}>
                <div className="text-lg font-bold">{pillar.stem}</div>
                <div className="text-sm">{pillar.branch}</div>
                <div className="text-xs mt-1">{pillar.element} • {pillar.yinYang}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Element Balance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          ⚖️ Five Element Balance
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Score: {insights.balanceScore}/100
          </span>
        </h2>
        
        <div className="grid grid-cols-5 gap-4 mb-4">
          {Object.entries(profile.elementTally).map(([element, count]) => (
            <div key={element} className="text-center">
              <div className={`p-4 rounded-lg ${ELEMENT_COLORS[element as Element]} border-2`}>
                <div className="text-2xl mb-1">{ELEMENT_SYMBOLS[element as Element]}</div>
                <div className="font-bold text-lg">{count}</div>
                <div className="text-sm">{element}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🌟 Dominant Elements</h3>
            <div className="flex flex-wrap gap-2">
              {profile.dominant.map(element => (
                <span key={element} className={`px-3 py-1 rounded-full text-sm ${ELEMENT_COLORS[element]}`}>
                  {ELEMENT_SYMBOLS[element]} {element}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">🎯 Elements to Strengthen</h3>
            <div className="flex flex-wrap gap-2">
              {profile.deficient.map(element => (
                <span key={element} className={`px-3 py-1 rounded-full text-sm ${ELEMENT_COLORS[element]}`}>
                  {ELEMENT_SYMBOLS[element]} {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* I Ching Hexagram */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🔮 I Ching Hexagram</h2>
        <div className="text-center py-4">
          <div className="text-4xl mb-2">{profile.hexagram}</div>
          <p className="text-gray-600">Your birth hexagram represents the cosmic pattern at your birth</p>
        </div>
      </div>

      {/* Personality Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🧭 Elemental Personality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.personality.map((trait, index) => (
            <div key={index} className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg border border-purple-200 text-center">
              {trait}
            </div>
          ))}
        </div>
      </div>

      {/* Taoist Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🧘 Recommended Taoist Practices</h2>
        
        {/* Daily & Seasonal Rituals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🌅 Today's Practice</h3>
            <div className="space-y-2">
              <div className="font-medium">{insights.dailyRitual.title}</div>
              <div className="text-sm text-gray-600">{insights.dailyRitual.description}</div>
              <div className="text-xs text-blue-600">
                {insights.dailyRitual.durationMin} minutes • {insights.dailyRitual.type}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="font-semibold text-amber-800 mb-2">🍂 Seasonal Practice</h3>
            <div className="space-y-2">
              <div className="font-medium">{insights.seasonalRitual.title}</div>
              <div className="text-sm text-gray-600">{insights.seasonalRitual.description}</div>
              <div className="text-xs text-amber-600">
                {insights.seasonalRitual.durationMin} minutes • {insights.seasonalRitual.type}
              </div>
            </div>
          </div>
        </div>

        {/* All Suggested Rituals */}
        <h3 className="font-semibold mb-3">All Recommended Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rituals.map((ritual) => (
            <div key={ritual.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{ritual.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${ELEMENT_COLORS[ritual.element]}`}>
                  {ELEMENT_SYMBOLS[ritual.element]} {ritual.element}
                </span>
              </div>
              {ritual.description && (
                <p className="text-sm text-gray-600 mb-2">{ritual.description}</p>
              )}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{ritual.durationMin} min</span>
                <span>{ritual.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affirmations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">💫 Elemental Affirmations</h2>
        <div className="space-y-3">
          {insights.affirmations.map((affirmation, index) => (
            <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
              <p className="text-gray-800 italic">"{affirmation}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}