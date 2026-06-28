import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FireworkDensity } from '../../storage/fireworkSettings';

const COLORS = ['#4fd1c5', '#f6c453', '#f06595', '#74c0fc', '#69db7c', '#da77f2'];

// Higher density means both more particles per burst AND more simultaneous bursts.
export const DENSITY_CONFIG: Record<FireworkDensity, { particlesPerBurst: number; burstCount: number }> = {
  low: { particlesPerBurst: 16, burstCount: 3 },
  medium: { particlesPerBurst: 30, burstCount: 5 },
  high: { particlesPerBurst: 50, burstCount: 9 },
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
}

export function Firework({
  particlesPerBurst = DENSITY_CONFIG.medium.particlesPerBurst,
  burstCount = DENSITY_CONFIG.medium.burstCount,
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
            <Particle key={j} $tx={p.tx} $ty={p.ty} $color={p.color} $delay={p.delay} />
          ))}
        </BurstOrigin>
      ))}
    </Overlay>
  );
}
