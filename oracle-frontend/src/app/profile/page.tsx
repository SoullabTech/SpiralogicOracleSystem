'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ElementalProfile {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ElementalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = 'demo-user'; // ⚠️ Replace with actual Supabase Auth user ID

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('elemental_profiles')
        .select('fire, water, earth, air, aether')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading profile...</p>;

  if (!profile) return <p className="p-6 text-center text-red-500">No profile data found.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-oracle text-center mb-6">🧬 Elemental Profile</h1>
      <div className="space-y-4">
        {Object.entries(profile).map(([element, value]) => (
          <div key={element}>
            <p className="font-semibold capitalize">{element}</p>
            <div className="w-full bg-gray-200 h-4 rounded overflow-hidden shadow-sm">
              <div
                className="h-4 transition-all duration-500"
                style={{
                  width: `${Math.min(value * 10, 100)}%`,
                  backgroundColor: getElementColor(element),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    fire: '#e25822',
    water: '#3b82f6',
    earth: '#6b7280',
    air: '#60a5fa',
    aether: '#d4af37',
  };
  return colors[element] || '#999';
}
