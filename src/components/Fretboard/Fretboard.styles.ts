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

// Same flex offset (justify-content + padding) as StringRow's FretCell, with a
// fixed-width inner box matching NoteBubble's size — this is what keeps the fret
// number directly above the note circle's center instead of the column's center,
// since note bubbles themselves sit flush with the start of the fret, not centered.
export const FretNumber = styled.div<{ $handedness: Handedness }>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ $handedness }) => ($handedness === 'right' ? 'flex-start' : 'flex-end')};
  padding: 0 14px;

  span {
    display: inline-block;
    width: 36px;
    text-align: center;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  @media (max-width: 900px) {
    padding: 0 3px;

    span {
      width: 18px;
      font-size: 9px;
    }
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

export const MarkerCell = styled.div<{ $handedness: Handedness }>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ $handedness }) => ($handedness === 'right' ? 'flex-start' : 'flex-end')};
  padding: 0 14px;

  @media (max-width: 900px) {
    padding: 0 3px;
  }
`;

// Fixed-width slot the marker dot centers within (see FretNumber's comment above for
// why this matches NoteBubble's width rather than spanning the whole column).
export const MarkerSlot = styled.div`
  position: relative;
  width: 36px;
  height: 100%;

  @media (max-width: 900px) {
    width: 18px;
  }
`;
