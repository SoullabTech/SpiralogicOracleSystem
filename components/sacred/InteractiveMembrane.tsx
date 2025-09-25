'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * INTERACTIVE MEMBRANE
 * The living interface between the central holoflower and four consciousness panels
 * A permeable field that allows bidirectional flow of awareness
 *
 * The membrane is not a barrier but a translation layer that:
 * - Receives impressions from the four panels
 * - Colors the central presence without overwhelming it
 * - Allows user intentions to ripple outward to activate panels
 * - Maintains coherence while permitting flow
 */

interface MembraneState {
  permeability: number; // 0-1, how open the membrane is
  viscosity: number; // 0-1, how quickly influences flow through
  resonance: number; // 0-1, how strongly the membrane vibrates
  color: {
    fire: number;  // Red/orange influence
    water: number; // Blue influence
    air: number;   // White/yellow influence
    earth: number; // Green/brown influence
  };
}

interface FieldInfluence {
  source: 'top' | 'bottom' | 'left' | 'right' | 'center';
  element: 'fire' | 'water' | 'air' | 'earth' | 'aether';
  intensity: number;
  quality: 'flowing' | 'pushing' | 'pulling' | 'spiraling' | 'pulsing';
  message?: string;
}

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  element: string;
  intensity: number;
  expanding: boolean;
}

export const InteractiveMembrane: React.FC<{
  activeFields: Set<string>;
  centerState: any;
  onFieldInteraction: (field: string, intensity: number) => void;
  onMembraneTouch: (x: number, y: number, element: string) => void;
}> = ({ activeFields, centerState, onFieldInteraction, onMembraneTouch }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);

  const [membraneState, setMembraneState] = useState<MembraneState>({
    permeability: 0.5,
    viscosity: 0.3,
    resonance: 0.7,
    color: {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0
    }
  });

  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [fieldInfluences, setFieldInfluences] = useState<FieldInfluence[]>([]);

  // Calculate membrane color based on active fields
  useEffect(() => {
    const newColor = {
      fire: 0,
      water: 0,
      air: 0,
      earth: 0
    };

    // Map active fields to elemental influences
    if (activeFields.has('top') && activeFields.has('right')) {
      newColor.fire = 0.7; // Fire = conscious right
    }
    if (activeFields.has('bottom') && activeFields.has('right')) {
      newColor.water = 0.7; // Water = subconscious right
    }
    if (activeFields.has('top') && activeFields.has('left')) {
      newColor.air = 0.7; // Air = conscious left
    }
    if (activeFields.has('bottom') && activeFields.has('left')) {
      newColor.earth = 0.7; // Earth = subconscious left
    }

    setMembraneState(prev => ({
      ...prev,
      color: newColor,
      permeability: Math.min(0.9, 0.3 + activeFields.size * 0.15),
      resonance: Math.min(1, 0.5 + activeFields.size * 0.125)
    }));
  }, [activeFields]);

  // Generate field influences based on active panels
  useEffect(() => {
    const influences: FieldInfluence[] = [];

    if (activeFields.has('top')) {
      influences.push({
        source: 'top',
        element: 'air',
        intensity: 0.6,
        quality: 'flowing',
        message: 'Conscious awareness descending'
      });
    }

    if (activeFields.has('bottom')) {
      influences.push({
        source: 'bottom',
        element: 'earth',
        intensity: 0.5,
        quality: 'spiraling',
        message: 'Unconscious wisdom rising'
      });
    }

    if (activeFields.has('left')) {
      influences.push({
        source: 'left',
        element: 'air',
        intensity: 0.55,
        quality: 'pushing',
        message: 'Analytical patterns emerging'
      });
    }

    if (activeFields.has('right')) {
      influences.push({
        source: 'right',
        element: 'water',
        intensity: 0.65,
        quality: 'pulling',
        message: 'Intuitive flow entering'
      });
    }

    setFieldInfluences(influences);
  }, [activeFields]);

  // Create ripple when membrane is touched
  const createRipple = useCallback((x: number, y: number, element: string = 'aether') => {
    const ripple: RippleEffect = {
      id: `ripple_${Date.now()}`,
      x,
      y,
      element,
      intensity: 1,
      expanding: true
    };

    setRipples(prev => [...prev, ripple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 2000);

    // Notify parent component
    onMembraneTouch(x, y, element);
  }, [onMembraneTouch]);

  // Particle system for membrane visualization
  const initializeParticles = useCallback(() => {
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        element: ['fire', 'water', 'air', 'earth'][Math.floor(Math.random() * 4)],
        size: Math.random() * 3 + 1,
        life: 1
      });
    }
    particlesRef.current = particles;
  }, []);

  // Animation loop for membrane dynamics
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    if (particlesRef.current.length === 0) {
      initializeParticles();
    }

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Draw membrane base layer
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.min(width, height) / 2
      );

      // Color based on elemental influences
      const r = Math.floor(membraneState.color.fire * 255);
      const g = Math.floor(membraneState.color.earth * 128 + membraneState.color.air * 127);
      const b = Math.floor(membraneState.color.water * 255);

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${membraneState.permeability * 0.1})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${membraneState.permeability * 0.05})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Apply field influences
        fieldInfluences.forEach(influence => {
          let fx = 0, fy = 0;

          switch(influence.source) {
            case 'top':
              fy = influence.intensity * 0.001;
              break;
            case 'bottom':
              fy = -influence.intensity * 0.001;
              break;
            case 'left':
              fx = influence.intensity * 0.001;
              break;
            case 'right':
              fx = -influence.intensity * 0.001;
              break;
          }

          particle.vx += fx * membraneState.permeability;
          particle.vy += fy * membraneState.permeability;
        });

        // Apply viscosity
        particle.vx *= (1 - membraneState.viscosity * 0.01);
        particle.vy *= (1 - membraneState.viscosity * 0.01);

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = 1;
        if (particle.x > 1) particle.x = 0;
        if (particle.y < 0) particle.y = 1;
        if (particle.y > 1) particle.y = 0;

        // Draw particle
        const px = particle.x * width;
        const py = particle.y * height;

        const elementColors: Record<string, string> = {
          fire: `rgba(255, 100, 50, ${particle.life * 0.5})`,
          water: `rgba(100, 150, 255, ${particle.life * 0.5})`,
          air: `rgba(255, 255, 200, ${particle.life * 0.5})`,
          earth: `rgba(100, 200, 100, ${particle.life * 0.5})`
        };

        ctx.fillStyle = elementColors[particle.element] || 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(px, py, particle.size * membraneState.resonance, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ripples
      ripples.forEach(ripple => {
        const radius = (2 - ripple.intensity) * 100;
        const alpha = ripple.intensity * 0.3;

        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ripple.x * width, ripple.y * height, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Update ripple
        ripple.intensity -= 0.02;
      });

      // Draw field connections
      fieldInfluences.forEach(influence => {
        const centerX = width / 2;
        const centerY = height / 2;
        let startX = centerX, startY = centerY;

        switch(influence.source) {
          case 'top':
            startY = 0;
            break;
          case 'bottom':
            startY = height;
            break;
          case 'left':
            startX = 0;
            break;
          case 'right':
            startX = width;
            break;
        }

        // Draw flowing connection
        ctx.strokeStyle = `rgba(147, 51, 234, ${influence.intensity * membraneState.permeability * 0.2})`;
        ctx.lineWidth = influence.intensity * 10 * membraneState.resonance;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        // Create curved path based on quality
        const controlX = (startX + centerX) / 2;
        const controlY = (startY + centerY) / 2;

        if (influence.quality === 'spiraling') {
          const offset = Math.sin(Date.now() / 500) * 50;
          ctx.quadraticCurveTo(
            controlX + offset,
            controlY - offset,
            centerX,
            centerY
          );
        } else {
          ctx.lineTo(centerX, centerY);
        }

        ctx.stroke();
        ctx.setLineDash([]);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [membraneState, fieldInfluences, ripples, initializeParticles]);

  // Handle mouse/touch interaction
  const handleInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;

    if ('touches' in event) {
      x = (event.touches[0].clientX - rect.left) / rect.width;
      y = (event.touches[0].clientY - rect.top) / rect.height;
    } else {
      x = (event.clientX - rect.left) / rect.width;
      y = (event.clientY - rect.top) / rect.height;
    }

    // Determine which element based on position
    const element = x < 0.5
      ? (y < 0.5 ? 'air' : 'earth')
      : (y < 0.5 ? 'fire' : 'water');

    createRipple(x, y, element);

    // Activate corresponding field
    const fieldMap: Record<string, string[]> = {
      fire: ['right', 'top'],
      water: ['right', 'bottom'],
      air: ['left', 'top'],
      earth: ['left', 'bottom']
    };

    fieldMap[element].forEach(field => {
      onFieldInteraction(field, 0.7);
    });
  }, [createRipple, onFieldInteraction]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Membrane canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 pointer-events-auto"
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Field influence indicators */}
      <AnimatePresence>
        {fieldInfluences.map(influence => (
          <motion.div
            key={`${influence.source}_${influence.element}`}
            className="absolute text-xs text-amber-300/50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: influence.intensity }}
            exit={{ opacity: 0 }}
            style={{
              top: influence.source === 'top' ? '10%' : influence.source === 'bottom' ? '90%' : '50%',
              left: influence.source === 'left' ? '10%' : influence.source === 'right' ? '90%' : '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {influence.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Membrane state indicator */}
      <div className="absolute top-4 right-4 text-xs text-gray-500 space-y-1">
        <div>Permeability: {(membraneState.permeability * 100).toFixed(0)}%</div>
        <div>Resonance: {(membraneState.resonance * 100).toFixed(0)}%</div>
        <div>Fields Active: {activeFields.size}</div>
      </div>
    </div>
  );
};