import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(79, 209, 197, 0.5); }
  100% { box-shadow: 0 0 0 12px rgba(79, 209, 197, 0); }
`;

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.div<{ $state: 'idle' | 'listening' | 'error'; $volume: number }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ theme, $state }) =>
    $state === 'error' ? '#e07a7a' : $state === 'listening' ? theme.colors.accent : theme.colors.fret};
  transform: scale(${({ $state, $volume }) => ($state === 'listening' ? 1 + Math.min($volume * 8, 0.6) : 1)});
  transition: transform 0.08s ease, background 0.2s ease;

  ${({ $state }) =>
    $state === 'listening' &&
    css`
      animation: ${pulse} 1.6s ease-out infinite;
    `}
`;

const Label = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: 900px) {
    font-size: 9px;
  }
`;

interface MicIndicatorProps {
  isListening: boolean;
  hasError: boolean;
  volume: number;
}

export function MicIndicator({ isListening, hasError, volume }: MicIndicatorProps) {
  const state = hasError ? 'error' : isListening ? 'listening' : 'idle';
  const label = hasError ? 'Microphone error' : isListening ? 'Listening' : 'Microphone off';

  return (
    <Wrapper>
      <Dot $state={state} $volume={volume} />
      <Label>{label}</Label>
    </Wrapper>
  );
}
