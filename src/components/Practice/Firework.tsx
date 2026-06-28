import { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const COLORS = ['#4fd1c5', '#f6c453', '#f06595', '#74c0fc', '#69db7c', '#da77f2'];
const PARTICLE_COUNT = 28;

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

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
`;

const Particle = styled.span<{ $tx: number; $ty: number; $color: string; $delay: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
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

function createParticles(): ParticleSpec[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 70;
    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 80,
    };
  });
}

export function Firework() {
  const particles = useMemo(createParticles, []);

  return (
    <Wrapper>
      {particles.map((p, i) => (
        <Particle key={i} $tx={p.tx} $ty={p.ty} $color={p.color} $delay={p.delay} />
      ))}
    </Wrapper>
  );
}
