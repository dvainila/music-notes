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
  onNext: () => void;
  onFinish: () => void;
}

export function PracticeCard({
  stringLabel,
  note,
  isListeningForMatch,
  isCorrect,
  detectedNote,
  onNext,
  onFinish,
}: PracticeCardProps) {
  return (
    <Wrapper $correct={isCorrect}>
      <Hint>Find this note on string {stringLabel}</Hint>
      <NoteName>{note}</NoteName>

      <StatusLine $correct={isCorrect}>
        {isListeningForMatch
          ? isCorrect
            ? 'Correct! ✓'
            : detectedNote
              ? `Hearing: ${detectedNote}`
              : 'Play a note on the guitar...'
          : ' '}
      </StatusLine>

      <Actions>
        <Button type="button" $variant="primary" onClick={onNext}>
          Next note
        </Button>
        <Button type="button" onClick={onFinish}>
          Finish practice
        </Button>
      </Actions>
    </Wrapper>
  );
}
