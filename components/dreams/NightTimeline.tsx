'use client'
import { DreamSegment } from '@/types/dreams'

type Props = { segments: DreamSegment[] }

export function NightTimeline({ segments }: Props) {
  return (
    <div className="w-full p-4 bg-background/30 rounded-xl border border-border">
      <h2 className="text-lg font-semibold mb-3">Night Timeline</h2>
      <div className="flex flex-row overflow-x-auto gap-4">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`min-w-[180px] p-3 rounded-lg shadow-sm ${
              seg.type === 'lucid' ? 'bg-purple-200' : 'bg-muted'
            }`}
          >
            <p className="text-sm font-bold">{seg.title || seg.type}</p>
            <p className="text-xs opacity-70">{seg.start} → {seg.end}</p>
            {seg.symbols && (
              <p className="text-xs mt-1">Symbols: {seg.symbols.join(', ')}</p>
            )}
            {seg.awareness !== undefined && (
              <p className="text-xs mt-1">Awareness: {seg.awareness}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}