import { useEffect, useRef } from 'react';

interface XPConfettiProps {
  trigger: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

const COLORS = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#a855f7', // purple
  '#06b6d4', // cyan
];

export default function XPConfetti({ trigger }: XPConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Spawn burst of particles from the bottom centers or random locations
    const count = 70;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Spawn centered around bottom left/right or scattered
      const side = Math.random() > 0.5 ? 0 : 1;
      const startX = side === 0 ? canvas.width * 0.15 : canvas.width * 0.85;
      const startY = canvas.height * 0.9;

      newParticles.push({
        x: startX,
        y: startY,
        radius: Math.random() * 6 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        speedX: side === 0 ? Math.random() * 12 + 4 : -Math.random() * 12 - 4,
        speedY: -Math.random() * 15 - 10, // burst upwards
        opacity: 1,
        fadeSpeed: Math.random() * 0.01 + 0.008,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    let animationId: number;

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.x < 0 ? 0 : p.speedX;
        p.y += p.speedY;
        p.speedY += 0.45; // Gravity
        p.speedX *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= p.fadeSpeed;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Draw rectangle/confetti
        ctx.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    update();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      id="xp-confetti-canvas"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
