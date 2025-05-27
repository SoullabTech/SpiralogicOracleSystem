// OracleInterface.tsx – Dream + Archetype Dialogue UI

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Moon, Eye, Flame, Brain } from 'lucide-react';

const archetypes = [
  { name: 'Sage', icon: <Brain />, style: 'text-indigo-700' },
  { name: 'Mystic', icon: <Moon />, style: 'text-purple-600' },
  { name: 'Shadow', icon: <Eye />, style: 'text-red-600' },
  { name: 'Hero', icon: <Flame />, style: 'text-orange-600' },
  { name: 'Oracle', icon: <Sparkles />, style: 'text-aether-500' },
];

export default function OracleInterface() {
  const [selected, setSelected] = useState('Mystic');
  const [journal, setJournal] = useState('');
  const [response, setResponse] = useState('');

  async function askOracle() {
    const res = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: journal, archetype: selected }),
    });
    const { message } = await res.json();
    setResponse(message);
  }

  return (
    <div className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Dream + Shadow Reflection</h2>
        <Textarea
          placeholder="Record your dream, insight, or struggle..."
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          className="h-40"
        />
        <div className="flex gap-2">
          {archetypes.map((a) => (
            <Button
              key={a.name}
              variant={selected === a.name ? 'default' : 'outline'}
              onClick={() => setSelected(a.name)}
              className={`${a.style}`}
            >
              {a.icon}
              <span className="ml-1">{a.name}</span>
            </Button>
          ))}
        </div>
        <Button onClick={askOracle} className="mt-2 w-full">
          Request Oracle Response
        </Button>
      </div>
      <div>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-2">{selected} Speaks:</h3>
            <p className="whitespace-pre-line text-muted-foreground">{response}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
