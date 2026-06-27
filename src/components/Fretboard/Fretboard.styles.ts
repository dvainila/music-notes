import styled from 'styled-components';
import type { Handedness } from '../../music/notes';

export const Board = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 40px 32px;
  width: 100%;
  max-width: 1180px;
`;

export const FretNumbers = styled.div<{ $handedness: Handedness }>`
  display: grid;
  grid-template-columns: ${({ $handedness }) =>
    $handedness === 'left' ? 'repeat(12, 1fr) 70px' : '70px repeat(12, 1fr)'};
  margin-bottom: 10px;
`;

export const FretNumber = styled.div`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Spacer = styled.div``;

export const MarkerRow = styled.div<{ $handedness: Handedness }>`
  display: grid;
  grid-template-columns: ${({ $handedness }) =>
    $handedness === 'left' ? 'repeat(12, 1fr) 70px' : '70px repeat(12, 1fr)'};
  height: 44px;
`;

export const MarkerCell = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
