import styled from 'styled-components';
import type { DetectedNote } from '../../music/frequency';
import { MicIndicator } from './MicIndicator';

const Wrapper = styled.div`
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

  @media (max-width: 900px), (max-height: 500px) {
    padding: 8px;
    gap: 4px;
    border-radius: 8px;
  }
`;

const Title = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;

  @media (max-width: 900px), (max-height: 500px) {
    font-size: 9px;
  }
`;

const NoteName = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  line-height: 1;

  @media (max-width: 900px), (max-height: 500px) {
    font-size: 22px;
  }
`;

const Placeholder = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.fret};
  line-height: 1;

  @media (max-width: 900px), (max-height: 500px) {
    font-size: 16px;
  }
`;

const Details = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  min-height: 16px;

  @media (max-width: 900px), (max-height: 500px) {
    font-size: 9px;
    min-height: 0;
  }
`;

const Button = styled.button`
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.noteTextActive};

  @media (max-width: 900px), (max-height: 500px) {
    padding: 5px 8px;
    font-size: 10px;
  }
`;

const NotSupported = styled.div`
  font-size: 13px;
  color: #e07a7a;
  text-align: center;

  @media (max-width: 900px), (max-height: 500px) {
    font-size: 9px;
  }
`;

interface LiveNoteIndicatorProps {
  isMicSupported: boolean;
  isListening: boolean;
  detected: DetectedNote | null;
  volume: number;
  error: string | null;
  onToggleMic: () => void;
}

export function LiveNoteIndicator({
  isMicSupported,
  isListening,
  detected,
  volume,
  error,
  onToggleMic,
}: LiveNoteIndicatorProps) {
  if (!isMicSupported) {
    return (
      <Wrapper>
        <Title>Now playing</Title>
        <NotSupported>This browser does not support microphone access</NotSupported>
      </Wrapper>
    );
  }

  if (!isListening) {
    return (
      <Wrapper>
        <Title>Now playing</Title>
        <Button type="button" onClick={onToggleMic}>
          Enable microphone
        </Button>
        <MicIndicator isListening={false} hasError={!!error} volume={0} />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Title>Now playing</Title>
      {detected ? <NoteName>{detected.note}</NoteName> : <Placeholder>—</Placeholder>}
      <Details>
        {detected ? `Octave ${detected.octave}, ${detected.cents > 0 ? '+' : ''}${detected.cents} cents` : ' '}
      </Details>
      <MicIndicator isListening={isListening} hasError={!!error} volume={volume} />
      <Button type="button" onClick={onToggleMic}>
        Disable microphone
      </Button>
    </Wrapper>
  );
}
