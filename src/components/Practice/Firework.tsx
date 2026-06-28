import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { FireworkDensity, FireworkDuration, FireworkSize } from '../../storage/fireworkSettings';

// Tron/Akira-style electric neon palette.
const NEON_COLORS = ['#00fff7', '#ff00e6', '#00aaff', '#ff0050', '#39ff14', '#bf00ff', '#fff200'];

const BURST_INTERVAL_MS = 90;
const TRAIL_HISTORY_LENGTH = 5;
const GRAVITY = 0.00055;
const DRAG = 0.985;
const GLOW_SPRITE_SIZE = 64;
const MAX_DPR = 2;

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
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  // Fixed-capacity ring buffer instead of push/shift — avoids both per-frame array
  // resizing and shifting every element down by one for every particle.
  historyX: Float32Array;
  historyY: Float32Array;
  historyHead: number;
  historyCount: number;
}

interface FireworkProps {
  particlesPerBurst?: number;
  burstCount?: number;
  trails?: boolean;
  particleSize?: number;
  distanceMultiplier?: number;
  durationMs?: number;
}

// ctx.shadowBlur is a real blur convolution recomputed on every single draw call — it
// cannot be cached or batched. Calling it per-particle (and per trail segment!) for
// hundreds of particles a frame is what made an earlier version of this canvas slower
// than the original DOM/CSS one. Pre-rendering one soft radial-gradient "glow" sprite
// per color and stamping it with drawImage (a cheap GPU blit) gets the same look for a
// tiny fraction of the cost — built once at module scope, not per Firework mount, since
// every correctly-played note mounts a fresh instance and the 7 colors never change.
let cachedGlowSprites: Map<string, HTMLCanvasElement> | null = null;

function getGlowSprites(): Map<string, HTMLCanvasElement> {
  if (cachedGlowSprites) return cachedGlowSprites;

  const sprites = new Map<string, HTMLCanvasElement>();
  for (const color of NEON_COLORS) {
    const sprite = document.createElement('canvas');
    sprite.width = GLOW_SPRITE_SIZE;
    sprite.height = GLOW_SPRITE_SIZE;
    const sctx = sprite.getContext('2d');
    if (!sctx) continue;
    const r = GLOW_SPRITE_SIZE / 2;
    const gradient = sctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, 'transparent');
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE);
    sprites.set(color, sprite);
  }
  cachedGlowSprites = sprites;
  return sprites;
}

function createParticlePool(size: number): Particle[] {
  return Array.from({ length: size }, () => ({
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    color: NEON_COLORS[0],
    size: 0,
    historyX: new Float32Array(TRAIL_HISTORY_LENGTH),
    historyY: new Float32Array(TRAIL_HISTORY_LENGTH),
    historyHead: 0,
    historyCount: 0,
  }));
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

    // Capping DPR matters a lot here: clearRect and drawImage both cost roughly
    // proportional to pixel area, so a DPR-3 phone would otherwise pay 9x the fill
    // cost of a DPR-1 display for no visible gain on an effect this size.
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const glowSprites = getGlowSprites();

    // A fixed-capacity pool sized for the worst case (every burst's particles alive at
    // once) means spawning never allocates a new object, and the per-frame sweep never
    // allocates a new array the way `particles.filter(...)` would.
    const pool = createParticlePool(particlesPerBurst * burstCount);
    let aliveCount = 0;
    let nextFreeIndex = 0;

    let rafId = 0;
    let lastTime = performance.now();
    let burstsRemaining = burstCount;
    let burstTimer = BURST_INTERVAL_MS; // spawn the first burst immediately

    function spawnBurst() {
      const originX = viewportWidth * (0.1 + Math.random() * 0.8);
      const originY = viewportHeight * (0.1 + Math.random() * 0.8);
      for (let i = 0; i < particlesPerBurst && nextFreeIndex < pool.length; i += 1) {
        const p = pool[nextFreeIndex];
        nextFreeIndex += 1;

        const angle = Math.random() * Math.PI * 2;
        const speed = (0.08 + Math.random() * 0.18) * distanceMultiplier;
        p.alive = true;
        p.x = originX;
        p.y = originY;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.life = durationMs;
        p.maxLife = durationMs;
        p.color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        p.size = particleSize * (0.7 + Math.random() * 0.6);
        p.historyHead = 0;
        p.historyCount = 0;
        aliveCount += 1;
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

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      ctx.globalCompositeOperation = 'lighter';

      let stillAlive = 0;
      for (let idx = 0; idx < nextFreeIndex; idx += 1) {
        const p = pool[idx];
        if (!p.alive) continue;

        p.vy += GRAVITY * dt;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        if (p.life <= 0) {
          p.alive = false;
          continue;
        }
        stillAlive += 1;

        const alpha = Math.max(p.life / p.maxLife, 0);

        if (trails) {
          p.historyX[p.historyHead] = p.x;
          p.historyY[p.historyHead] = p.y;
          p.historyHead = (p.historyHead + 1) % TRAIL_HISTORY_LENGTH;
          p.historyCount = Math.min(p.historyCount + 1, TRAIL_HISTORY_LENGTH);

          // Plain additive-blended strokes, no shadowBlur — 'lighter' compositing
          // already makes overlapping trail segments glow brighter on its own.
          ctx.strokeStyle = p.color;
          for (let i = 1; i < p.historyCount; i += 1) {
            const fromIdx = (p.historyHead - i - 1 + 2 * TRAIL_HISTORY_LENGTH) % TRAIL_HISTORY_LENGTH;
            const toIdx = (p.historyHead - i + 2 * TRAIL_HISTORY_LENGTH) % TRAIL_HISTORY_LENGTH;
            const t = 1 - i / p.historyCount;
            ctx.globalAlpha = alpha * t * 0.6;
            ctx.lineWidth = Math.max(0.5, p.size * t * 0.7);
            ctx.beginPath();
            ctx.moveTo(p.historyX[fromIdx], p.historyY[fromIdx]);
            ctx.lineTo(p.historyX[toIdx], p.historyY[toIdx]);
            ctx.stroke();
          }
        }

        const sprite = glowSprites.get(p.color);
        if (sprite) {
          const drawSize = p.size * 4.5 * (0.6 + alpha * 0.4);
          ctx.globalAlpha = alpha;
          ctx.drawImage(sprite, p.x - drawSize / 2, p.y - drawSize / 2, drawSize, drawSize);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      aliveCount = stillAlive;

      if (aliveCount > 0 || burstsRemaining > 0) {
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
