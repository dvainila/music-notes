import styled, { css } from 'styled-components';
import type { Handedness } from '../../music/notes';

export const Row = styled.div<{ $active: boolean; $dimmed: boolean }>`
  grid-column: 1 / -1;
  position: relative;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  height: 100%;
  min-height: 36px;
  cursor: pointer;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.35 : 1)};
  transition: opacity 0.2s ease;
`;

export const StringLine = styled.div<{ $active: boolean; $thickness: number; $handedness: Handedness }>`
  position: absolute;
  ${({ $handedness }) =>
    $handedness === 'left' ? css`left: 0; right: 70px;` : css`left: 70px; right: 0;`}
  top: 50%;
  height: ${({ $thickness }) => $thickness}px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.stringActive : theme.colors.string};
  transform: translateY(-50%);
  border-radius: 2px;
  transition: background 0.2s ease;

  @media (max-width: 900px) {
    ${({ $handedness }) =>
      $handedness === 'left' ? css`left: 0; right: 30px;` : css`left: 30px; right: 0;`}
    height: ${({ $thickness }) => Math.max(1, Math.round($thickness / 1.8))}px;
  }
`;

export const StringLabel = styled.div<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: ${({ theme, $active }) => ($active ? theme.colors.stringActive : theme.colors.textMuted)};

  @media (max-width: 900px) {
    gap: 0;
  }
`;

export const StringNumber = styled.span`
  font-size: 12px;
  font-weight: 400;
  opacity: 0.7;

  @media (max-width: 900px) {
    font-size: 7px;
  }
`;

export const StringNoteName = styled.span`
  font-weight: 600;
  font-size: 17px;

  @media (max-width: 900px) {
    font-size: 9px;
  }
`;

export const FretCell = styled.div<{
  $isNut?: boolean;
  $nutSide?: 'left' | 'right';
  $handedness: Handedness;
}>`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: ${({ $handedness }) => ($handedness === 'right' ? 'flex-start' : 'flex-end')};
  padding: 0 14px;
  border-right: 1px solid ${({ theme }) => theme.colors.fret};

  ${({ $isNut, $nutSide, theme }) =>
    $isNut &&
    $nutSide === 'left' &&
    css`
      border-left: 3px solid ${theme.colors.nut};
    `}

  ${({ $isNut, $nutSide, theme }) =>
    $isNut &&
    $nutSide === 'right' &&
    css`
      border-right: 3px solid ${theme.colors.nut};
    `}

  @media (max-width: 900px) {
    padding: 0 3px;
  }
`;

export const NoteBubble = styled.div<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  background: ${({ theme, $active }) => ($active ? theme.colors.noteBgActive : theme.colors.noteBg)};
  color: ${({ theme, $active }) => ($active ? theme.colors.noteTextActive : theme.colors.noteText)};

  @media (max-width: 900px) {
    width: 18px;
    height: 18px;
    font-size: 8px;
  }
`;
