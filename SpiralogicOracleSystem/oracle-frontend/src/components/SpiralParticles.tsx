// src/components/SpiralParticles.tsx
import React, { useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

interface SpiralParticlesProps {
  element: string;
  small?: boolean;
}

export function SpiralParticles({ element, small = false }: SpiralParticlesProps) {
  const options = useMemo(() => {
    let color = '#ffffff';
    let speed = 1;
    let shape = 'circle';
    const count = small ? 15 : 50;
    const sizeVal = small ? { min: 0.5, max: 1.5 } : { min: 1, max: 3 };

    switch (element) {
      case 'Fire':
        color = '#ff6b6b';
        speed = 2;
        shape = 'triangle';
        break;
      case 'Water':
        color = '#60a5fa';
        speed = 0.5;
        shape = 'circle';
        break;
      case 'Earth':
        color = '#a3e635';
        speed = 0.8;
        shape = 'square';
        break;
      case 'Air':
        color = '#c084fc';
        speed = 1.5;
        shape = 'star';
        break;
      case 'Aether':
        color = '#facc15';
        speed = 1;
        shape = 'polygon';
        break;
    }

    return {
      fullScreen: small ? { enable: false } : { enable: true, zIndex: -1 },
      detectRetina: true,
      fpsLimit: 60,
      particles: {
        number: { value: count },
        color: { value: color },
        shape: { type: shape },
        opacity: { value: 0.6, random: { enable: true, minimumValue: 0.3 } },
        size: { value: sizeVal },
        move: { enable: true, speed },
        links: { enable: false },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' },
          resize: true,
        },
        modes: {
          grab: { distance: small ? 80 : 120, links: { opacity: 0.5 } },
          push: { quantity: small ? 2 : 4 },
        },
      },
      background: { color: { value: 'transparent' } },
    };
  }, [element, small]);

  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return <Particles init={particlesInit} options={options} />;
}
