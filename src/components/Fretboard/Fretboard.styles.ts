import styled from 'styled-components';
import type { Handedness } from '../../music/notes';

export const Board = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 40px 32px;
  width: 100%;
  max-width: 1180px;

  @media (max-width: 900px) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 6px 8px;
    border-radius: 10px;
  }
`;

export const FretNumbers = styled.div<{ $handedness: Handedness }>`
  display: grid;
  grid-template-columns: ${({ $handedness }) =>
    $handedness === 'left' ? 'repeat(12, 1fr) 70px' : '70px repeat(12, 1fr)'};
  margin-bottom: 10px;

  @media (max-width: 900px) {
    grid-template-columns: ${({ $handedness }) =>
      $handedness === 'left' ? 'repeat(12, 1fr) 30px' : '30px repeat(12, 1fr)'};
    margin-bottom: 2px;
    flex-shrink: 0;
  }
`;

export const FretNumber = styled.div`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: 900px) {
    font-size: 9px;
  }
`;

export const Spacer = styled.div``;

export const MarkerRow = styled.div<{ $handedness: Handedness }>`
  display: grid;
  grid-template-columns: ${({ $handedness }) =>
    $handedness === 'left' ? 'repeat(12, 1fr) 70px' : '70px repeat(12, 1fr)'};
  height: 44px;

  @media (max-width: 900px) {
    grid-template-columns: ${({ $handedness }) =>
      $handedness === 'left' ? 'repeat(12, 1fr) 30px' : '30px repeat(12, 1fr)'};
    height: 14px;
    flex-shrink: 0;
  }
`;

export const MarkerCell = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
