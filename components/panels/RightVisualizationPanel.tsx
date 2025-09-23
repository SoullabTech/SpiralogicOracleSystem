'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * RIGHT VISUALIZATION PANEL
 * Intuitive, visual, pattern-based view of system coherence
 * Right-brain artistic approach - cymatics, waves, living patterns
 */

interface FieldResonance {
  amplitude: number;
  frequency: number;
  phase: number;
  color: string;
}

const RightVisualizationPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPulsing, setIsPulsing] = useState(true);
  const [fieldResonances, setFieldResonances] = useState<FieldResonance[]>([
    { amplitude: 0.3, frequency: 0.5, phase: 0, color: 'rgba(147, 51, 234, 0.3)' }, // Purple - Sacred
    { amplitude: 0.25, frequency: 0.7, phase: Math.PI / 3, color: 'rgba(59, 130, 246, 0.3)' }, // Blue - Semantic
    { amplitude: 0.35, frequency: 0.3, phase: Math.PI / 2, color: 'rgba(34, 197, 94, 0.3)' }, // Green - Connection
    { amplitude: 0.2, frequency: 0.9, phase: Math.PI, color: 'rgba(251, 146, 60, 0.3)' }, // Orange - Emotional
    { amplitude: 0.28, frequency: 0.4, phase: Math.PI * 1.5, color: 'rgba(236, 72, 153, 0.3)' }, // Pink - Somatic
    { amplitude: 0.32, frequency: 0.6, phase: Math.PI / 6, color: 'rgba(250, 204, 21, 0.3)' } // Yellow - Temporal
  ]);

  const [driftParticles, setDriftParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    type: 'isolation' | 'integration' | 'transformation';
  }>>([]);

  const [coherenceField, setCoherenceField] = useState<number[][]>([]);
  const [immuneNodes, setImmuneNodes] = useState<Array<{
    x: number;
    y: number;
    strength: number;
    connections: number[];
    activated: boolean;
  }>>([]);

  // Initialize coherence field grid
  useEffect(() => {
    const grid: number[][] = [];
    for (let i = 0; i < 20; i++) {
      grid[i] = [];
      for (let j = 0; j < 20; j++) {
        grid[i][j] = Math.random();
      }
    }
    setCoherenceField(grid);

    // Initialize immune nodes
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: Math.random(),
        y: Math.random(),
        strength: 0.5 + Math.random() * 0.5,
        connections: [],
        activated: Math.random() > 0.7
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) +
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        if (distance < 0.4) {
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }
    }

    setImmuneNodes(nodes);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPulsing) return;

    const animate = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Fade effect
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw coherence field as background
      drawCoherenceField(ctx, width, height, time);

      // Draw cymatic interference patterns
      drawCymaticPatterns(ctx, width, height, time);

      // Draw immune network
      drawImmuneNetwork(ctx, width, height, time);

      // Draw drift particles
      drawDriftParticles(ctx, width, height, time);

      // Draw central mandala
      drawCentralMandala(ctx, width, height, time);

      // Update field resonances
      setFieldResonances(prev => prev.map(resonance => ({
        ...resonance,
        phase: resonance.phase + resonance.frequency * 0.02
      })));

      // Update particles
      updateDriftParticles();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPulsing, fieldResonances, driftParticles, coherenceField, immuneNodes]);

  const drawCoherenceField = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const cellWidth = width / coherenceField.length;
    const cellHeight = height / coherenceField[0]?.length;

    coherenceField.forEach((row, i) => {
      row.forEach((value, j) => {
        // Oscillate values slightly
        const oscillatedValue = value + Math.sin(time / 1000 + i + j) * 0.1;
        const intensity = Math.max(0, Math.min(1, oscillatedValue));

        // Color based on coherence level
        const hue = 270 - intensity * 60; // Purple to Blue
        const saturation = 50 + intensity * 30;
        const lightness = 10 + intensity * 20;

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`;
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      });
    });
  };

  const drawCymaticPatterns = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    fieldResonances.forEach((resonance, index) => {
      ctx.strokeStyle = resonance.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw circular interference patterns
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const radius = 100 + resonance.amplitude * 50 *
          Math.sin(angle * resonance.frequency * 3 + resonance.phase + time / 1000);

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();

      // Draw radial waves
      for (let r = 0; r < 5; r++) {
        const waveRadius = (r * 40 + time / 10 * resonance.frequency) % 200;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = resonance.color.replace('0.3', `${0.3 - waveRadius / 200 * 0.3}`);
        ctx.stroke();
      }
    });
  };

  const drawImmuneNetwork = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Draw connections
    immuneNodes.forEach((node, i) => {
      node.connections.forEach(j => {
        const targetNode = immuneNodes[j];
        if (targetNode) {
          ctx.strokeStyle = node.activated && targetNode.activated
            ? 'rgba(34, 197, 94, 0.5)'  // Green for active connection
            : 'rgba(147, 51, 234, 0.2)'; // Purple for dormant

          ctx.lineWidth = node.strength * 2;
          ctx.beginPath();
          ctx.moveTo(node.x * width, node.y * height);
          ctx.lineTo(targetNode.x * width, targetNode.y * height);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    immuneNodes.forEach(node => {
      const x = node.x * width;
      const y = node.y * height;
      const radius = 5 + node.strength * 10 + (node.activated ? Math.sin(time / 200) * 3 : 0);

      // Node glow
      if (node.activated) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
      }

      // Node core
      ctx.fillStyle = node.activated
        ? 'rgba(34, 197, 94, 0.8)'
        : 'rgba(147, 51, 234, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawDriftParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    driftParticles.forEach(particle => {
      const opacity = particle.life;

      switch(particle.type) {
        case 'isolation':
          ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`; // Red
          break;
        case 'integration':
          ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`; // Green
          break;
        case 'transformation':
          ctx.fillStyle = `rgba(147, 51, 234, ${opacity})`; // Purple
          break;
      }

      ctx.beginPath();
      ctx.arc(particle.x * width, particle.y * height, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw trail
      ctx.strokeStyle = ctx.fillStyle.replace(`${opacity}`, `${opacity * 0.3}`);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x * width, particle.y * height);
      ctx.lineTo(
        (particle.x - particle.vx * 10) * width,
        (particle.y - particle.vy * 10) * height
      );
      ctx.stroke();
    });
  };

  const drawCentralMandala = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate overall coherence
    const overallCoherence = fieldResonances.reduce((sum, r) => sum + r.amplitude, 0) / fieldResonances.length;

    // Draw sacred geometry
    for (let layer = 0; layer < 6; layer++) {
      const radius = 30 + layer * 15;
      const rotation = time / 1000 / (layer + 1);

      ctx.strokeStyle = `rgba(147, 51, 234, ${0.6 - layer * 0.1})`;
      ctx.lineWidth = 2 - layer * 0.2;

      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rotation + (Math.PI * 2 / 6) * i;
        const x = centerX + Math.cos(angle) * radius * overallCoherence;
        const y = centerY + Math.sin(angle) * radius * overallCoherence;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Central pulse
    const pulseRadius = 10 + Math.sin(time / 500) * 5;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 1)');
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const updateDriftParticles = () => {
    setDriftParticles(prev => {
      // Update existing particles
      let updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 0.01
      })).filter(particle => particle.life > 0 && particle.x >= 0 && particle.x <= 1 && particle.y >= 0 && particle.y <= 1);

      // Occasionally spawn new particles
      if (Math.random() > 0.95 && updated.length < 50) {
        updated.push({
          x: Math.random(),
          y: Math.random(),
          vx: (Math.random() - 0.5) * 0.002,
          vy: (Math.random() - 0.5) * 0.002,
          life: 1,
          type: Math.random() > 0.7 ? 'transformation' : Math.random() > 0.5 ? 'integration' : 'isolation'
        });
      }

      return updated;
    });
  };

  // Simplified stats overlay
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="h-full bg-gray-900 relative overflow-hidden">
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Control Overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => setIsPulsing(!isPulsing)}
          className="bg-purple-600/20 backdrop-blur-sm text-white px-3 py-1 rounded text-xs"
        >
          {isPulsing ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-purple-600/20 backdrop-blur-sm text-white px-3 py-1 rounded text-xs"
        >
          {showStats ? 'Hide' : 'Show'} Info
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 space-y-1 text-xs">
        <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded">
          <div className="font-medium mb-1">Field Resonances</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-gray-300">Sacred</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-300">Semantic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-300">Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-300">Emotional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <div className="absolute top-16 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded text-xs space-y-2">
          <div>
            <div className="text-gray-400">Overall Coherence</div>
            <div className="text-lg font-bold text-purple-400">
              {(fieldResonances.reduce((sum, r) => sum + r.amplitude, 0) / fieldResonances.length * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400">Active Nodes</div>
            <div className="text-lg font-bold text-green-400">
              {immuneNodes.filter(n => n.activated).length}/{immuneNodes.length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Drift Particles</div>
            <div className="text-lg font-bold text-blue-400">
              {driftParticles.length}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-400">Transformation Rate</div>
            <div className="text-lg font-bold text-purple-400">
              {(driftParticles.filter(p => p.type === 'transformation').length / Math.max(1, driftParticles.length) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex justify-between text-xs text-gray-300">
          <div>Field Integrity: <span className="text-green-400">Stable</span></div>
          <div>Pattern Recognition: <span className="text-purple-400">Active</span></div>
          <div>Immune Response: <span className="text-blue-400">Learning</span></div>
        </div>
      </div>
    </div>
  );
};

export default RightVisualizationPanel;