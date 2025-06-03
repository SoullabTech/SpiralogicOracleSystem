'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const userId = 'demo-user'; // Replace with real Supabase auth user ID

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('elemental_profiles')
        .select('fire, water, earth, air, aether')
        .eq('user_id', userId)
        .single();
      if (data) setProfile(data);
      if (error) console.error(error);
    };
    fetchProfile();
  }, []);

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-oracle text-center mb-6">🧬 Elemental Profile</h1>
      <div className="space-y-4">
        {Object.entries(profile).map(([element, value]) => (
          <div key={element}>
            <p className="font-semibold capitalize">{element}</p>
            <div className="w-full bg-gray-200 h-4 rounded overflow-hidden">
              <div
                className="h-4 transition-all duration-300"
                style={{
                  width: `${value * 10}%`,
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

function getElementColor(element: string) {
  const map: Record<string, string> = {
    fire: '#e25822',
    water: '#3b82f6',
    earth: '#6b7280',
    air: '#60a5fa',
    aether: '#d4af37',
  };
  return map[element] || '#999';
}
