import styled from 'styled-components';
import type { Handedness } from '../../music/notes';

// Board is the single source of truth for column tracks. FretNumbers, MarkerRow, and
// each StringRow use `grid-template-columns: subgrid` to inherit these exact tracks
// instead of each redeclaring "repeat(12, 1fr)" in their own separate grid — multiple
// independent grids with identical CSS can still round fractional 1fr pixel widths
// slightly differently from one another, which showed up as fret columns drifting a
// pixel left/right between adjacent strings. Subgrid guarantees they're identical.
//
// Row order is fixed (8 rows: numbers, 3 strings, the marker row, 3 more strings) since
// the app always renders exactly 6 strings with the marker row in the middle — see
// Fretboard.tsx's middleStringIndex.
export const Board = styled.div<{ $handedness: Handedness }>`
  display: grid;
  grid-template-columns: ${({ $handedness }) =>
    $handedness === 'left' ? 'repeat(12, 1fr) 70px' : '70px repeat(12, 1fr)'};
  grid-template-rows: auto 1fr 1fr 1fr auto 1fr 1fr 1fr;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 40px 48px;
  width: 100%;
  max-width: 1180px;
  /* Board is a flex child of FretArea. Flex items default to min-width: auto, which
     resolves to their content's min-content size — without overriding this, Board
     refuses to shrink below the width its 12 columns "want" even though width:100% says
     otherwise, and overflows past its allotted space (most visibly on its last column —
     the string label for left-handed mode — spilling into the cards beside it). */
  min-width: 0;

  @media (max-width: 900px), (max-height: 500px) {
    grid-template-columns: ${({ $handedness }) =>
      $handedness === 'left' ? 'repeat(12, 1fr) 30px' : '30px repeat(12, 1fr)'};
    padding: 6px 8px;
    border-radius: 10px;
  }
`;

export const FretNumbers = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  margin-bottom: 10px;

  @media (max-width: 900px), (max-height: 500px) {
    margin-bottom: 2px;
  }
`;

// Same flex offset (justify-content + padding) as StringRow's FretCell, with a
// fixed-width inner box matching NoteBubble's size — this is what keeps the fret
// number directly above the note circle's center instead of the column's center,
// since note bubbles themselves sit flush with the start of the fret, not centered.
export const FretNumber = styled.div<{ $handedness: Handedness }>`
  height: 100%;
  min-width: 0;
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

  @media (max-width: 900px), (max-height: 500px) {
    padding: 0 3px;

    span {
      width: 18px;
      font-size: 9px;
    }
  }
`;

export const Spacer = styled.div``;

export const MarkerRow = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  height: 44px;

  @media (max-width: 900px), (max-height: 500px) {
    height: 14px;
  }
`;

export const MarkerCell = styled.div<{ $handedness: Handedness }>`
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $handedness }) => ($handedness === 'right' ? 'flex-start' : 'flex-end')};
  padding: 0 14px;

  @media (max-width: 900px), (max-height: 500px) {
    padding: 0 3px;
  }
`;

// Fixed-width slot the marker dot centers within (see FretNumber's comment above for
// why this matches NoteBubble's width rather than spanning the whole column).
export const MarkerSlot = styled.div`
  position: relative;
  width: 36px;
  height: 100%;

  @media (max-width: 900px), (max-height: 500px) {
    width: 18px;
  }
`;
