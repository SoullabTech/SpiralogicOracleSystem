// oracle-frontend/components/SpiralCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface MemoryEntry {
  id: string;
  type: string;
  content: string;
  element?: string;
  tags?: string[];
  timestamp: string;
}

interface Props {
  memories: MemoryEntry[];
}

const narrativeZones = [
  { name: 'Threshold', start: 0, end: 9 },
  { name: 'Descent', start: 10, end: 19 },
  { name: 'Trial', start: 20, end: 29 },
  { name: 'Revelation', start: 30, end: 39 },
  { name: 'Return', start: 40, end: 999 },
];

export default function SpiralCanvas({ memories }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [selected, setSelected] = useState<MemoryEntry | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [frame, setFrame] = useState(0);
  const [filter, setFilter] = useState<{ element: string | null; tag: string | null }>({ element: null, tag: null });
  const [showGlyphs, setShowGlyphs] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const filteredMemories = memories
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter((m) => {
      const matchesElement = filter.element ? m.element === filter.element : true;
      const matchesTag = filter.tag ? m.tags?.includes(filter.tag) : true;
      return matchesElement && matchesTag;
    });

  const maxFrame = filteredMemories.length;

  const tagFrequency = memories.reduce<Record<string, number>>((acc, m) => {
    (m.tags || []).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const getHeatColor = (count: number) => {
    const alpha = Math.min(1, 0.1 + count / 10);
    return `rgba(255, 0, 0, ${alpha})`;
  };

  useEffect(() => {
    let rafId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const spacing = 10;
    const angleStep = 0.3;

    const nodePositions: { x: number; y: number; r: number; memory: MemoryEntry }[] = [];
    const tagCenters: Record<string, { x: number; y: number; count: number }> = {};

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2 + offset.x;
      const centerY = height / 2 + offset.y;
      const max = Math.min(frame, filteredMemories.length);

      for (let i = 0; i < max; i++) {
        const memory = filteredMemories[i];
        const angle = angleStep * i;
        const radius = spacing * i * zoom;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const r = 6;
        nodePositions[i] = { x, y, r, memory };

        (memory.tags || []).forEach((tag) => {
          if (!tagCenters[tag]) tagCenters[tag] = { x: 0, y: 0, count: 0 };
          tagCenters[tag].x += x;
          tagCenters[tag].y += y;
          tagCenters[tag].count++;
        });
      }

      if (showHeatmap) {
        Object.entries(tagCenters).forEach(([tag, { x, y, count }]) => {
          if (count < 2) return;
          const avgX = x / count;
          const avgY = y / count;
          const gradient = ctx.createRadialGradient(avgX, avgY, 0, avgX, avgY, 80);
          gradient.addColorStop(0, getHeatColor(count));
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(avgX, avgY, 80, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      const tagMap: Record<string, { x: number; y: number }[]> = {};
      for (const { x, y, memory } of nodePositions) {
        (memory.tags || []).forEach((tag) => {
          if (!tagMap[tag]) tagMap[tag] = [];
          tagMap[tag].push({ x, y });
        });
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([4, 2]);
      Object.values(tagMap).forEach((points) => {
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      });
      ctx.restore();

      ctx.save();
      ctx.font = '12px serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'center';
      narrativeZones.forEach(({ name, start, end }) => {
        const indexes = nodePositions.slice(start, end + 1);
        if (indexes.length === 0) return;
        const avgX = indexes.reduce((sum, p) => sum + p.x, 0) / indexes.length;
        const avgY = indexes.reduce((sum, p) => sum + p.y, 0) / indexes.length;
        ctx.fillText(name, avgX, avgY);
      });
      ctx.restore();

      nodePositions.forEach(({ x, y, r, memory }) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();

        if (showGlyphs && memory.element) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.fillText(memory.element[0].toUpperCase(), x + 8, y);
        }
      });
    };

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const hit = nodePositions.find(({ x, y, r }) => Math.hypot(x - mouseX, y - mouseY) < r);
      if (hit) {
        setTooltip({ x: mouseX, y: mouseY, content: hit.memory.content });
      } else {
        setTooltip(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const hit = nodePositions.find(({ x, y, r }) => Math.hypot(x - mouseX, y - mouseY) < r);
      if (hit) setSelected(hit.memory);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [filteredMemories, zoom, offset, frame, showGlyphs, showHeatmap]);

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 z-50 space-x-2 text-xs bg-black/30 backdrop-blur px-3 py-2 rounded shadow">
        <label>
          <input type="checkbox" checked={showGlyphs} onChange={(e) => setShowGlyphs(e.target.checked)} className="mr-1" />
          Show Glyphs
        </label>
        <label>
          <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="ml-4 mr-1" />
          Show Heatmap
        </label>
        <input
          type="range"
          min="1"
          max={maxFrame}
          value={frame}
          onChange={(e) => setFrame(Number(e.target.value))}
          className="ml-4 align-middle"
        />
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={(e) => {
          e.preventDefault();
          const direction = e.deltaY < 0 ? 1.05 : 0.95;
          setZoom((z) => Math.min(5, Math.max(0.2, z * direction)));
        }}
        onMouseDown={(e) => setDragging(true) || setDragStart({ x: e.clientX, y: e.clientY })}
        onMouseUp={() => setDragging(false) || setDragStart(null)}
        onMouseMove={(e) => {
          if (dragging && dragStart) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            setDragStart({ x: e.clientX, y: e.clientY });
          }
        }}
        className="rounded-xl bg-black/80 w-full h-auto border border-white/10 shadow cursor-grab"
      />

      {tooltip && (
        <div
          className="absolute text-xs bg-white text-black px-2 py-1 rounded shadow max-w-sm"
          style={{ top: tooltip.y, left: tooltip.x, pointerEvents: 'none' }}
        >
          {tooltip.content.length > 100 ? tooltip.content.slice(0, 100) + '...' : tooltip.content}
        </div>
      )}

      {selected && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 max-w-xl shadow-xl relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-sm text-gray-500 hover:text-black"
            >
              ✖ Close
            </button>
            <h3 className="text-lg font-semibold mb-2">{selected.type} — {selected.element}</h3>
            <p className="text-sm whitespace-pre-line">{selected.content}</p>
            {selected.tags?.length > 0 && (
              <p className="mt-4 text-xs text-gray-600">Tags: {selected.tags.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
