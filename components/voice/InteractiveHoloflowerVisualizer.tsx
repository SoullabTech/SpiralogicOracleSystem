'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveHoloflowerVisualizerProps {
  isActive?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  coherenceLevel?: number;
  onSectionClick?: (section: number) => void;
  size?: number;
  showLabel?: boolean;
}

export default function InteractiveHoloflowerVisualizer({
  isActive = false,
  isListening = false,
  isProcessing = false,
  coherenceLevel = 0.5,
  onSectionClick,
  size = 400,
  showLabel = true
}: InteractiveHoloflowerVisualizerProps) {
  const [activeSections, setActiveSections] = useState<Set<number>>(new Set());
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate section from angle
  const getSectionFromAngle = (x: number, y: number): number => {
    const centerX = size / 2;
    const centerY = size / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(normalizedAngle / (Math.PI / 4)); // 8 sections
  };

  // Handle click on sections
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const section = getSectionFromAngle(x * (size / rect.width), y * (size / rect.height));
    
    setActiveSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
    
    onSectionClick?.(section);
  };

  // Handle mouse move for hover effect
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const section = getSectionFromAngle(x * (size / rect.width), y * (size / rect.height));
    setHoveredSection(section);
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
  };

  // Create section path
  const createSectionPath = (sectionIndex: number, innerRadius: number, outerRadius: number) => {
    const startAngle = (sectionIndex * Math.PI) / 4;
    const endAngle = ((sectionIndex + 1) * Math.PI) / 4;
    const centerX = size / 2;
    const centerY = size / 2;

    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(startAngle) * outerRadius;
    const y2 = centerY + Math.sin(startAngle) * outerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(endAngle) * innerRadius;
    const y4 = centerY + Math.sin(endAngle) * innerRadius;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
  };

  const elementColors = ['#D4B896', '#C85450', '#6B9BD1', '#7A9A65'];

  return (
    <div className="relative inline-block">
      {/* Label Box */}
      {showLabel && (
        <div 
          className="absolute top-0 left-0 bg-transparent border border-white/30 px-3 py-1 text-white text-sm"
          style={{ borderRadius: '0px' }}
        >
          Spiralogic Holoflower
        </div>
      )}

      {/* Main Visualizer Container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG for rings and sections */}
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="absolute inset-0"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'pointer' }}
        >
          {/* Outer dotted ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.45}
            fill="none"
            stroke="#D4B896"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Middle dotted ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.35}
            fill="none"
            stroke="#6B9BD1"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Inner solid ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.25}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Interactive sections */}
          {Array.from({ length: 8 }, (_, i) => {
            const isActive = activeSections.has(i);
            const isHovered = hoveredSection === i;
            
            return (
              <g key={i}>
                {/* Section highlight */}
                {(isActive || isHovered) && (
                  <path
                    d={createSectionPath(i, size * 0.15, size * 0.45)}
                    fill={elementColors[i % 4]}
                    opacity={isActive ? 0.3 : 0.15}
                    style={{
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                )}
                
                {/* Active section markers */}
                {isActive && (
                  <circle
                    cx={size / 2 + Math.cos((i + 0.5) * Math.PI / 4) * size * 0.35}
                    cy={size / 2 + Math.sin((i + 0.5) * Math.PI / 4) * size * 0.35}
                    r="4"
                    fill="white"
                    opacity="0.8"
                  />
                )}
              </g>
            );
          })}

          {/* Center circle background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.12}
            fill="#1a1a2e"
            opacity="0.8"
          />
        </svg>

        {/* Center Holoflower Image */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * 0.2, height: size * 0.2 }}
        >
          <img 
            src="/holoflower.png" 
            alt="Holoflower"
            className="w-full h-full object-contain"
            style={{
              filter: isProcessing ? 'brightness(1.5)' : 'brightness(1)',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>

        {/* Processing Animation */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: size * 0.6,
                height: size * 0.6,
                border: '2px solid #D4B896',
                borderRadius: '50%',
                borderStyle: 'dotted'
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        )}

        {/* Listening Pulse */}
        {isListening && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 184, 150, 0.3) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Status Text */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {isProcessing && 'Processing...'}
          {isListening && !isProcessing && 'Listening...'}
        </div>

        {/* Coherence Level Indicator */}
        {coherenceLevel > 0 && (
          <div className="absolute bottom-4 right-4 text-white text-xs">
            <div className="text-right mb-1">COHERENCE</div>
            <div className="text-2xl font-bold">{Math.round(coherenceLevel * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );
}