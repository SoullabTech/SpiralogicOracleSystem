'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useUserSession } from '@/lib/hooks/useUserSession';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const SpiralCanvas = dynamic(() => import('@/components/SpiralCanvas'), { ssr: false });

interface MemoryEntry {
  id: string;
  type: string;
  content: string;
  element?: string;
  tags?: string[];
  timestamp: string;
}

export default function MemoryTimelinePage() {
  const { user } = useUserSession();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [tagData, setTagData] = useState<{ tag: string; count: number }[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterElement, setFilterElement] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [view, setView] = useState<'grid' | 'spiral'>('grid');

  useEffect(() => {
    if (!user) return;

    fetch(`/api/oracle/reflection/timeline/${user.id}`)
      .then((res) => res.json())
      .then((data) => setMemories(data.memories || []));

    fetch(`/api/oracle/reflection/timeline-tags/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = Object.entries(data.tags || {}).map(([tag, count]) => ({ tag, count }));
        setTagData(formatted);
      });
  }, [user]);

  const filteredMemories = memories.filter((m) => {
    const matchType = filterType === 'all' || m.type === filterType;
    const matchElement = filterElement === 'all' || m.element === filterElement;
    const matchDate = !dateRange || (
      new Date(m.timestamp) >= new Date(dateRange.from) &&
      new Date(m.timestamp) <= new Date(dateRange.to)
    );
    return matchType && matchElement && matchDate;
  });

  const exportToPDF = () => {
    const printable = filteredMemories.map((m) => {
      return `🗓 ${new Date(m.timestamp).toLocaleDateString()}\n🧠 ${m.type}\n🌿 ${m.element || ''}\n🏷 ${m.tags?.join(', ') || ''}\n📝 ${m.content}\n`;
    }).join('\n---\n');

    const blob = new Blob([printable], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oracle-memory-timeline.pdf';
    link.click();
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 space-y-6">
        <h1 className="text-4xl font-bold text-soullab-gold text-center">🌀 Memory Timeline</h1>
        <p className="text-center text-soullab-moon">A symbolic view of your evolving Oracle memories.</p>

        <div className="flex flex-wrap justify-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/10 text-white px-4 py-2 rounded"
          >
            <option value="all">All Types</option>
            <option value="reflection">Reflection</option>
            <option value="ritual">Ritual</option>
            <option value="recommendation">Recommendation</option>
          </select>
          <select
            value={filterElement}
            onChange={(e) => setFilterElement(e.target.value)}
            className="bg-white/10 text-white px-4 py-2 rounded"
          >
            <option value="all">All Elements</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="earth">Earth</option>
            <option value="air">Air</option>
            <option value="aether">Aether</option>
          </select>
          <input
            type="date"
            className="bg-white/10 text-white px-4 py-2 rounded"
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
          />
          <input
            type="date"
            className="bg-white/10 text-white px-4 py-2 rounded"
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
          />
          <button
            onClick={exportToPDF}
            className="bg-soullab-gold text-white px-4 py-2 rounded shadow hover:bg-yellow-500"
          >
            📤 Export to PDF
          </button>
          <button
            onClick={() => setView(view === 'grid' ? 'spiral' : 'grid')}
            className="bg-white/10 text-white px-4 py-2 rounded shadow"
          >
            {view === 'grid' ? '🌀 Spiral View' : '📜 Grid View'}
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-6 shadow border border-white/10">
          <h2 className="text-xl text-white mb-4">Symbol Frequency</h2>
          <RadarChart outerRadius={120} width={500} height={400} data={tagData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="tag" stroke="#fff" />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} stroke="#ccc" />
            <Radar name="Tags" dataKey="count" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMemories.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 rounded-xl p-4 border border-white/10"
              >
                <p className="text-sm text-gray-300 mb-1">{new Date(m.timestamp).toLocaleString()}</p>
                <p className="text-white text-sm font-medium">{m.content}</p>
                <div className="text-xs text-soullab-moon mt-2">
                  {m.type && <span className="mr-3">🧠 {m.type}</span>}
                  {m.element && <span className="mr-3">🌿 {m.element}</span>}
                  {m.tags?.length > 0 && (
                    <span>
                      🏷 {m.tags.map((tag, i) => (
                        <span key={i} className="inline-block bg-soullab-indigo/50 text-white px-2 py-0.5 rounded mr-1">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="relative h-[600px] w-full rounded-xl overflow-hidden">
            <SpiralCanvas memories={filteredMemories} />
          </div>
        )}
      </div>
    </Layout>
  );
}
