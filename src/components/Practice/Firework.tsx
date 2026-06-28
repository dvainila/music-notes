import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const COLORS = ['#4fd1c5', '#f6c453', '#f06595', '#74c0fc', '#69db7c', '#da77f2'];
const PARTICLES_PER_BURST = 45;
const BURST_COUNT = 5;

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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  --tx: ${({ $tx }) => $tx}px;
  --ty: ${({ $ty }) => $ty}px;
  animation: ${burst} 750ms ease-out forwards;
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

function createParticles(): ParticleSpec[] {
  return Array.from({ length: PARTICLES_PER_BURST }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 110;
    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 150,
    };
  });
}

function createBursts(): BurstSpec[] {
  return Array.from({ length: BURST_COUNT }, (_, index) => {
    const particles = createParticles().map((p) => ({ ...p, delay: p.delay + index * 80 }));
    return { left: 10 + Math.random() * 80, top: 10 + Math.random() * 80, particles };
  });
}

export function Firework() {
  const bursts = useMemo(createBursts, []);

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
