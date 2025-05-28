'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SacredGeometryProps {
  type?: 'vectorEquilibrium' | 'metatronsCube' | 'seedOfLife' | 'flowerOfLife' | 'goldenSpiral';
  size?: number;
  color?: string;
  animate?: boolean;
  glowIntensity?: number;
  className?: string;
}

export const SacredGeometry: React.FC<SacredGeometryProps> = ({
  type = 'vectorEquilibrium',
  size = 200,
  color = '#FFD700',
  animate = true,
  glowIntensity = 0.3,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Save context state
      ctx.save();
      
      // Apply rotation for animation
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      ctx.translate(-centerX, -centerY);

      // Set up glow effect
      if (isHovered || glowIntensity > 0) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 * (isHovered ? 1.5 : glowIntensity);
      }

      // Draw based on type
      switch (type) {
        case 'vectorEquilibrium':
          drawVectorEquilibrium(ctx, centerX, centerY, radius, color);
          break;
        case 'metatronsCube':
          drawMetatronsCube(ctx, centerX, centerY, radius, color);
          break;
        case 'seedOfLife':
          drawSeedOfLife(ctx, centerX, centerY, radius, color);
          break;
        case 'flowerOfLife':
          drawFlowerOfLife(ctx, centerX, centerY, radius, color);
          break;
        case 'goldenSpiral':
          drawGoldenSpiral(ctx, centerX, centerY, radius, color);
          break;
      }

      // Restore context state
      ctx.restore();

      // Continue animation
      if (animate) {
        rotationRef.current += 0.001;
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, size, color, animate, glowIntensity, isHovered]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    />
  );
};

// Drawing functions for each sacred geometry type
function drawVectorEquilibrium(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  // Draw cuboctahedron (vector equilibrium)
  const vertices: [number, number][] = [];
  const n = 12;
  
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    vertices.push([x, y]);
  }

  // Draw edges
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if ((j - i) === 1 || (j - i) === 2 || (j - i) === n - 1) {
        ctx.moveTo(vertices[i][0], vertices[i][1]);
        ctx.lineTo(vertices[j][0], vertices[j][1]);
      }
    }
  }
  ctx.stroke();

  // Draw center connections
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (const vertex of vertices) {
    ctx.moveTo(cx, cy);
    ctx.lineTo(vertex[0], vertex[1]);
  }
  ctx.stroke();
}

function drawMetatronsCube(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw 13 circles (1 center + 6 inner + 6 outer)
  const circles: [number, number][] = [[cx, cy]];
  
  // Inner circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = cx + (r * 0.5) * Math.cos(angle);
    const y = cy + (r * 0.5) * Math.sin(angle);
    circles.push([x, y]);
  }

  // Draw circles
  ctx.globalAlpha = 0.6;
  for (const [x, y] of circles) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Connect all circles
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      ctx.moveTo(circles[i][0], circles[i][1]);
      ctx.lineTo(circles[j][0], circles[j][1]);
    }
  }
  ctx.stroke();
}

function drawSeedOfLife(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, 2 * Math.PI);
  ctx.stroke();

  // 6 surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = cx + (r * 0.3) * Math.cos(angle);
    const y = cy + (r * 0.3) * Math.sin(angle);
    
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function drawFlowerOfLife(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;

  const circleRadius = r * 0.15;
  const spacing = circleRadius * 2;

  // Create hexagonal grid of circles
  for (let row = -3; row <= 3; row++) {
    const numCircles = 7 - Math.abs(row);
    const startX = cx - ((numCircles - 1) * spacing) / 2;
    const y = cy + row * spacing * 0.866; // √3/2 for hexagonal spacing

    for (let col = 0; col < numCircles; col++) {
      const x = startX + col * spacing;
      
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

function drawGoldenSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.9;

  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  
  ctx.beginPath();
  for (let i = 0; i < 720; i++) {
    const angle = (i * Math.PI) / 180;
    const radius = Math.pow(phi, angle / (2 * Math.PI)) * 5;
    
    if (radius > r) break;
    
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Draw golden rectangles
  ctx.globalAlpha = 0.3;
  let rectSize = r * 0.8;
  let rectX = cx - rectSize / 2;
  let rectY = cy - rectSize / 2;

  for (let i = 0; i < 5; i++) {
    ctx.strokeRect(rectX, rectY, rectSize, rectSize / phi);
    rectSize = rectSize / phi;
    
    // Rotate position for next rectangle
    const temp = rectX;
    rectX = rectX + rectSize;
    rectY = rectY;
  }
}

// Sacred Geometry Grid Component
interface SacredGridProps {
  children: React.ReactNode;
  pattern?: 'hexagonal' | 'golden' | 'fibonacci';
  className?: string;
}

export const SacredGrid: React.FC<SacredGridProps> = ({
  children,
  pattern = 'golden',
  className = ''
}) => {
  const getGridClass = () => {
    switch (pattern) {
      case 'hexagonal':
        return 'grid-cols-3 gap-sacred-md';
      case 'golden':
        return 'grid-cols-[1fr_1.618fr_1fr] gap-sacred-lg';
      case 'fibonacci':
        return 'grid-cols-[1fr_1fr_2fr_3fr_5fr] gap-sacred-md';
      default:
        return 'grid-cols-3 gap-sacred-md';
    }
  };

  return (
    <div className={`grid ${getGridClass()} ${className}`}>
      {children}
    </div>
  );
};

// Sacred Container with geometric background
interface SacredContainerProps {
  children: React.ReactNode;
  showGeometry?: boolean;
  geometryType?: SacredGeometryProps['type'];
  className?: string;
}

export const SacredContainer: React.FC<SacredContainerProps> = ({
  children,
  showGeometry = true,
  geometryType = 'vectorEquilibrium',
  className = ''
}) => {
  return (
    <div className={`relative sacred-pattern ${className}`}>
      {showGeometry && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <SacredGeometry
            type={geometryType}
            size={600}
            color="#FFD700"
            animate={true}
            glowIntensity={0}
          />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};