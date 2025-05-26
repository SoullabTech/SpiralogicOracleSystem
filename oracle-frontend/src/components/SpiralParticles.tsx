import React from 'react';

interface SpiralParticlesProps {
  element: string;
  small?: boolean;
}

export function SpiralParticles({ element, small = false }: SpiralParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let color = '#ffffff';
    let speed = 1;
    const particleCount = small ? 15 : 50;

    switch (element) {
      case 'Fire':
        color = '#ff6b6b';
        speed = 2;
        break;
      case 'Water':
        color = '#60a5fa';
        speed = 0.5;
        break;
      case 'Earth':
        color = '#a3e635';
        speed = 0.8;
        break;
      case 'Air':
        color = '#c084fc';
        speed = 1.5;
        break;
      case 'Aether':
        color = '#facc15';
        speed = 1;
        break;
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = small ? 300 : window.innerWidth;
      canvas.height = small ? 200 : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;

      constructor() {
        if (!canvas) {
          this.x = 0;
          this.y = 0;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.6 + 0.3;
      }

      update() {
        if (!canvas) return;
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [element, small]);

  return (
    <canvas
      ref={canvasRef}
      className={small ? 'w-full h-full' : 'fixed inset-0 pointer-events-none z-0'}
      style={{ background: 'transparent' }}
    />
  );
}

export default SpiralParticles;
