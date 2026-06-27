import styled from 'styled-components';
import { useMetronome } from '../../audio/useMetronome';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

const PlayButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.noteTextActive : theme.colors.noteText)};
  cursor: pointer;
  font-size: 13px;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.fret)};
  }

  @media (max-width: 900px) {
    width: 26px;
    height: 26px;
    font-size: 10px;
  }
`;

const BpmInput = styled.input`
  width: 48px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.noteText};
  font-size: 13px;
  text-align: center;

  @media (max-width: 900px) {
    width: 34px;
    padding: 3px;
    font-size: 10px;
  }
`;

const BpmLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: 900px) {
    display: none;
  }
`;

const TimeSignatureSelect = styled.select`
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.noteText};
  font-size: 13px;
  cursor: pointer;

  @media (max-width: 900px) {
    padding: 3px;
    font-size: 10px;
  }
`;

const BeatDots = styled.div`
  display: flex;
  gap: 4px;
`;

const BeatDot = styled.div<{ $active: boolean; $accent: boolean }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${({ theme, $active, $accent }) =>
    $active ? theme.colors.accent : $accent ? theme.colors.string : theme.colors.fret};
  transition: background 0.1s ease;

  @media (max-width: 900px) {
    width: 6px;
    height: 6px;
  }
`;

const TIME_SIGNATURES = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 6 },
];

export function MetronomeControl() {
  const { bpm, setBpm, beatsPerBar, setBeatsPerBar, isPlaying, currentBeat, toggle } = useMetronome();

  return (
    <Wrapper>
      <PlayButton type="button" $active={isPlaying} onClick={toggle} aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}>
        {isPlaying ? '⏸' : '▶'}
      </PlayButton>
      <BpmLabel>BPM</BpmLabel>
      <BpmInput
        type="number"
        min={40}
        max={240}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value) || 0)}
        onBlur={() => setBpm((value) => Math.min(240, Math.max(40, value || 40)))}
      />
      <TimeSignatureSelect
        value={beatsPerBar}
        onChange={(e) => setBeatsPerBar(Number(e.target.value))}
      >
        {TIME_SIGNATURES.map(({ label, beats }) => (
          <option key={beats} value={beats}>
            {label}
          </option>
        ))}
      </TimeSignatureSelect>
      {isPlaying && (
        <BeatDots>
          {Array.from({ length: beatsPerBar }, (_, i) => (
            <BeatDot key={i} $active={currentBeat === i} $accent={i === 0} />
          ))}
        </BeatDots>
      )}
    </Wrapper>
  );
}
