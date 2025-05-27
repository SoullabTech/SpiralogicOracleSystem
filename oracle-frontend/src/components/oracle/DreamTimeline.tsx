// DreamTimeline.tsx – Visual history of dreams, rituals, and symbols
import { Card, CardContent } from '@/components/ui/card';

const mockDreams = [
  {
    date: '2025-05-20',
    theme: 'Flight through starlight',
    archetype: 'Visionary',
    symbol: '🦋',
    message: 'You are being invited to transcend limits and dance with freedom.',
  },
  {
    date: '2025-05-18',
    theme: 'Labyrinth and Mirror',
    archetype: 'Shadow',
    symbol: '🜃',
    message: 'Face what has been hidden, and you will find clarity.',
  },
];

export default function DreamTimeline() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dream Timeline</h2>
      {mockDreams.map((dream, i) => (
        <Card key={i} className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{dream.date}</div>
            <div className="text-lg font-bold flex items-center gap-2">
              {dream.symbol} {dream.theme} — <span className="text-indigo-600">{dream.archetype}</span>
            </div>
            <p className="mt-1 text-sm">{dream.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}