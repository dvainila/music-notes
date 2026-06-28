import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FireworkDensity } from '../../storage/fireworkSettings';

const COLORS = ['#4fd1c5', '#f6c453', '#f06595', '#74c0fc', '#69db7c', '#da77f2'];
const TRAIL_STEPS = 3;

// Higher density means both more particles per burst AND more simultaneous bursts.
export const DENSITY_CONFIG: Record<FireworkDensity, { particlesPerBurst: number; burstCount: number }> = {
  low: { particlesPerBurst: 26, burstCount: 5 },
  medium: { particlesPerBurst: 42, burstCount: 8 },
  high: { particlesPerBurst: 65, burstCount: 12 },
};

const burst = keyframes`
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0.2);
    opacity: 0;
  }
`;

// Trail dots ride the exact same path as their particle but start a little later, so at
// any moment they sit behind it along the same line — and fade in (rather than start at
// full opacity) so they read as a dimmer tail instead of a second firework.
const trail = keyframes`
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 0;
  }
  30% {
    opacity: 0.55;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0.1);
    opacity: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 999;
`;

const BurstOrigin = styled.div<{ $left: number; $top: number }>`
  position: absolute;
  left: ${({ $left }) => $left}%;
  top: ${({ $top }) => $top}%;
`;

const Particle = styled.span<{ $tx: number; $ty: number; $color: string; $delay: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  --tx: ${({ $tx }) => $tx}px;
  --ty: ${({ $ty }) => $ty}px;
  animation: ${burst} 650ms ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

const TrailDot = styled.span<{
  $tx: number;
  $ty: number;
  $color: string;
  $delay: number;
  $size: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  --tx: ${({ $tx }) => $tx}px;
  --ty: ${({ $ty }) => $ty}px;
  animation: ${trail} 650ms ease-out forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
`;

interface ParticleSpec {
  tx: number;
  ty: number;
  color: string;
  delay: number;
}

interface BurstSpec {
  left: number;
  top: number;
  particles: ParticleSpec[];
}

function createParticles(particlesPerBurst: number): ParticleSpec[] {
  return Array.from({ length: particlesPerBurst }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 80;
    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 150,
    };
  });
}

function createBursts(burstCount: number, particlesPerBurst: number): BurstSpec[] {
  return Array.from({ length: burstCount }, (_, index) => {
    const particles = createParticles(particlesPerBurst).map((p) => ({
      ...p,
      delay: p.delay + index * 80,
    }));
    return { left: 10 + Math.random() * 80, top: 10 + Math.random() * 80, particles };
  });
}

interface FireworkProps {
  particlesPerBurst?: number;
  burstCount?: number;
  trails?: boolean;
}

export function Firework({
  particlesPerBurst = DENSITY_CONFIG.medium.particlesPerBurst,
  burstCount = DENSITY_CONFIG.medium.burstCount,
  trails = false,
}: FireworkProps) {
  const bursts = useMemo(
    () => createBursts(burstCount, particlesPerBurst),
    [burstCount, particlesPerBurst],
  );

  return (
    <Overlay>
      {bursts.map((b, i) => (
        <BurstOrigin key={i} $left={b.left} $top={b.top}>
          {b.particles.map((p, j) => (
            <span key={j}>
              {trails &&
                Array.from({ length: TRAIL_STEPS }, (_, step) => (
                  <TrailDot
                    key={step}
                    $tx={p.tx}
                    $ty={p.ty}
                    $color={p.color}
                    $delay={p.delay + (step + 1) * 35}
                    $size={4 - step}
                  />
                ))}
              <Particle $tx={p.tx} $ty={p.ty} $color={p.color} $delay={p.delay} />
            </span>
          ))}
        </BurstOrigin>
      ))}
    </Overlay>
  );
}
