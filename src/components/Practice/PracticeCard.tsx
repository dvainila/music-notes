import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import type { Note } from '../../music/notes';

const Wrapper = styled.div<{ $correct: boolean }>`
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;

  ${({ $correct, theme }) =>
    $correct &&
    css`
      border-color: ${theme.colors.accent};
    `}

  @media (max-width: 900px) {
    padding: 8px;
    gap: 4px;
    border-radius: 8px;
  }
`;

// Card-flip mechanic: FlipScene gives the 3D viewing context, FlipCard is the part that
// actually rotates (around the vertical axis, like turning a card left-to-right), and
// each Face is pinned to whichever side faces the viewer at 0deg vs 180deg via
// backface-visibility — the classic flip-card technique.
const FlipScene = styled.div`
  position: relative;
  width: 100%;
  perspective: 800px;
`;

const FlipCard = styled.div<{ $rotation: number }>`
  position: relative;
  width: 100%;
  transform-style: preserve-3d;
  transform: rotateY(${({ $rotation }) => $rotation}deg);
  transition: transform 0.6s ease;
`;

const Face = styled.div<{ $back?: boolean; $visible: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 14px;
  backface-visibility: hidden;
  /* backface-visibility hides the face visually, but hit-testing behavior for a
     rotated-away face isn't fully consistent across browsers — explicitly disable
     pointer events on whichever face isn't currently facing the viewer so its
     overlapping buttons can't steal clicks meant for the visible one. */
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  ${({ $back }) =>
    $back
      ? css`
          transform: rotateY(180deg);
          position: absolute;
          inset: 0;
        `
      : css`
          position: relative;
        `}
`;

const Hint = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;

  @media (max-width: 900px) {
    font-size: 9px;
  }
`;

const NoteName = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};

  @media (max-width: 900px) {
    font-size: 22px;
  }
`;

const StatusLine = styled.div<{ $correct: boolean }>`
  font-size: 13px;
  font-weight: 600;
  min-height: 18px;
  text-align: center;
  color: ${({ theme, $correct }) => ($correct ? theme.colors.accent : theme.colors.textMuted)};

  @media (max-width: 900px) {
    font-size: 9px;
    min-height: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;

  @media (max-width: 900px) {
    gap: 4px;
  }
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: 900px) {
    font-size: 9px;
    gap: 5px;
  }
`;

const Switch = styled.input`
  appearance: none;
  width: 34px;
  height: 19px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.fret};
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:checked {
    background: ${({ theme }) => theme.colors.accent};
  }

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s ease;
  }

  &:checked::before {
    transform: translateX(15px);
  }
`;

const Button = styled.button<{ $variant?: 'primary' }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  background: ${({ theme, $variant }) => ($variant === 'primary' ? theme.colors.accent : theme.colors.fret)};
  color: ${({ theme, $variant }) => ($variant === 'primary' ? theme.colors.noteTextActive : theme.colors.noteText)};

  @media (max-width: 900px) {
    padding: 5px 8px;
    font-size: 10px;
  }
`;

interface PracticeCardProps {
  stringLabel: string;
  note: Note;
  isListeningForMatch: boolean;
  isCorrect: boolean;
  detectedNote: Note | null;
  showNotesOnString: boolean;
  onToggleShowNotes: (show: boolean) => void;
  onNext: () => void;
  onFinish: () => void;
}

export function PracticeCard({
  stringLabel,
  note,
  isListeningForMatch,
  isCorrect,
  detectedNote,
  showNotesOnString,
  onToggleShowNotes,
  onNext,
  onFinish,
}: PracticeCardProps) {
  // Two physical faces, alternately updated and revealed. flipCount only ever
  // increases, so the card always spins the same way round rather than flipping back
  // and forth — each correctly-played note turns it another half-turn to reveal the
  // next one on what was, a moment ago, the hidden back.
  const [flipCount, setFlipCount] = useState(0);
  const [frontNote, setFrontNote] = useState(note);
  const [backNote, setBackNote] = useState(note);
  const prevNoteRef = useRef(note);

  useEffect(() => {
    if (note === prevNoteRef.current) return;
    prevNoteRef.current = note;

    setFlipCount((count) => {
      const showingFront = count % 2 === 0;
      if (showingFront) {
        setBackNote(note);
      } else {
        setFrontNote(note);
      }
      return count + 1;
    });
  }, [note]);

  const status = isListeningForMatch
    ? isCorrect
      ? 'Correct! ✓'
      : detectedNote
        ? `Hearing: ${detectedNote}`
        : 'Play a note on the guitar...'
    : ' ';

  const frontVisible = flipCount % 2 === 0;

  return (
    <Wrapper $correct={isCorrect}>
      <FlipScene>
        <FlipCard $rotation={flipCount * 180}>
          <Face $visible={frontVisible}>
            <Hint>Find this note on string {stringLabel}</Hint>
            <NoteName>{frontNote}</NoteName>
            <StatusLine $correct={isCorrect}>{status}</StatusLine>
            <ToggleRow>
              <Switch
                type="checkbox"
                checked={showNotesOnString}
                onChange={(e) => onToggleShowNotes(e.target.checked)}
              />
              Show notes on string
            </ToggleRow>
            <Actions>
              <Button type="button" $variant="primary" onClick={onNext}>
                Next note
              </Button>
              <Button type="button" onClick={onFinish}>
                Finish practice
              </Button>
            </Actions>
          </Face>
          <Face $back $visible={!frontVisible}>
            <Hint>Find this note on string {stringLabel}</Hint>
            <NoteName>{backNote}</NoteName>
            <StatusLine $correct={isCorrect}>{status}</StatusLine>
            <ToggleRow>
              <Switch
                type="checkbox"
                checked={showNotesOnString}
                onChange={(e) => onToggleShowNotes(e.target.checked)}
              />
              Show notes on string
            </ToggleRow>
            <Actions>
              <Button type="button" $variant="primary" onClick={onNext}>
                Next note
              </Button>
              <Button type="button" onClick={onFinish}>
                Finish practice
              </Button>
            </Actions>
          </Face>
        </FlipCard>
      </FlipScene>
    </Wrapper>
  );
}
