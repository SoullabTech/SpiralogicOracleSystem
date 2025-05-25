'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import Layout from '@/components/Layout';

const data = [
  { archetype: 'Mystic', count: 15 },
  { archetype: 'Warrior', count: 9 },
  { archetype: 'Healer', count: 12 },
  { archetype: 'Oracle', count: 20 },
  { archetype: 'Sage', count: 11 },
  { archetype: 'Child', count: 7 },
];

export default function DreamJournalDashboard() {
  return (
    <Layout>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-soullab-gold">📊 Dream Archetype Dashboard</h1>
        <p className="text-soullab-moon">Explore how often each archetype appears in your dreams.</p>

        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="archetype" />
              <PolarRadiusAxis angle={30} domain={[0, 25]} />
              <Radar name="Dreams" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
