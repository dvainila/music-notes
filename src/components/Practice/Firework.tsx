import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { FireworkDensity, FireworkDuration, FireworkSize } from '../../storage/fireworkSettings';

// Tron/Akira-style electric neon palette.
const NEON_COLORS = ['#00fff7', '#ff00e6', '#00aaff', '#ff0050', '#39ff14', '#bf00ff', '#fff200'];

const BURST_INTERVAL_MS = 90;
const TRAIL_HISTORY_LENGTH = 10;
const GRAVITY = 0.00055;
const DRAG = 0.985;

// Higher density means both more particles per burst AND more simultaneous bursts.
export const DENSITY_CONFIG: Record<FireworkDensity, { particlesPerBurst: number; burstCount: number }> = {
  low: { particlesPerBurst: 26, burstCount: 5 },
  medium: { particlesPerBurst: 42, burstCount: 8 },
  high: { particlesPerBurst: 65, burstCount: 12 },
};

export const SIZE_CONFIG: Record<FireworkSize, { particleSize: number; distanceMultiplier: number }> = {
  small: { particleSize: 3, distanceMultiplier: 0.7 },
  medium: { particleSize: 4.5, distanceMultiplier: 1 },
  large: { particleSize: 7, distanceMultiplier: 1.5 },
};

export const DURATION_CONFIG: Record<FireworkDuration, number> = {
  short: 500,
  normal: 900,
  long: 1500,
};

/** How long the Firework needs to stay mounted for every staggered burst to fully fade. */
export function getFireworkTotalDurationMs(burstCount: number, durationMs: number): number {
  return (burstCount - 1) * BURST_INTERVAL_MS + durationMs + 250;
}

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
`;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  history: { x: number; y: number }[];
}

interface FireworkProps {
  particlesPerBurst?: number;
  burstCount?: number;
  trails?: boolean;
  particleSize?: number;
  distanceMultiplier?: number;
  durationMs?: number;
}

// Runs entirely on a <canvas> with a vanilla requestAnimationFrame loop instead of one
// React-managed DOM node + CSS animation per particle — hundreds of those were causing
// the layout/paint jank. React only mounts the canvas once; nothing here re-renders.
export function Firework({
  particlesPerBurst = DENSITY_CONFIG.medium.particlesPerBurst,
  burstCount = DENSITY_CONFIG.medium.burstCount,
  trails = false,
  particleSize = SIZE_CONFIG.medium.particleSize,
  distanceMultiplier = SIZE_CONFIG.medium.distanceMultiplier,
  durationMs = DURATION_CONFIG.normal,
}: FireworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let particles: Particle[] = [];
    let rafId = 0;
    let lastTime = performance.now();
    let burstsRemaining = burstCount;
    let burstTimer = BURST_INTERVAL_MS; // spawn the first burst immediately

    function spawnBurst() {
      const originX = window.innerWidth * (0.1 + Math.random() * 0.8);
      const originY = window.innerHeight * (0.1 + Math.random() * 0.8);
      for (let i = 0; i < particlesPerBurst; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.08 + Math.random() * 0.18) * distanceMultiplier;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: durationMs,
          maxLife: durationMs,
          color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
          size: particleSize * (0.7 + Math.random() * 0.6),
          history: [],
        });
      }
    }

    function frame(now: number) {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      burstTimer += dt;
      if (burstsRemaining > 0 && burstTimer >= BURST_INTERVAL_MS) {
        burstTimer = 0;
        burstsRemaining -= 1;
        spawnBurst();
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = 'lighter';

      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.vy += GRAVITY * dt;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        const alpha = Math.max(p.life / p.maxLife, 0);

        if (trails) {
          p.history.push({ x: p.x, y: p.y });
          if (p.history.length > TRAIL_HISTORY_LENGTH) p.history.shift();

          for (let i = 1; i < p.history.length; i += 1) {
            const t = i / p.history.length;
            ctx.beginPath();
            ctx.moveTo(p.history[i - 1].x, p.history[i - 1].y);
            ctx.lineTo(p.history[i].x, p.history[i].y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha * t * 0.65;
            ctx.lineWidth = Math.max(0.5, p.size * t * 0.7);
            ctx.shadowBlur = 14;
            ctx.shadowColor = p.color;
            ctx.stroke();
          }
        }

        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.size * (0.5 + alpha * 0.5)), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';

      if (particles.length > 0 || burstsRemaining > 0) {
        rafId = requestAnimationFrame(frame);
      }
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [particlesPerBurst, burstCount, trails, particleSize, distanceMultiplier, durationMs]);

  return <Canvas ref={canvasRef} />;
}
