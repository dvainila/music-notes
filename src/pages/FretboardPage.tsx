import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { TopBar } from '../components/Layout/TopBar';
import { Fretboard } from '../components/Fretboard/Fretboard';
import { PracticeModal, type PracticeConfig } from '../components/Practice/PracticeModal';
import { PracticeCard } from '../components/Practice/PracticeCard';
import { LiveNoteIndicator } from '../components/Practice/LiveNoteIndicator';
import { Firework, DENSITY_CONFIG } from '../components/Practice/Firework';
import { usePitchDetection } from '../audio/usePitchDetection';
import { loadHandedness } from '../storage/handedness';
import { loadShowSharps } from '../storage/sharps';
import { loadFireworkSettings } from '../storage/fireworkSettings';
import { matchesAnyFrequency } from '../music/frequency';
import {
  STANDARD_TUNING,
  createNoteBag,
  getNoteFrequencies,
  getStringNumber,
  type Note,
} from '../music/notes';

const Page = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StartButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.noteTextActive};
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 900px) {
    padding: 7px 14px;
    font-size: 12px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: 'fret note' 'fret practice';
  gap: 24px;
  padding: 32px 40px;
  overflow: hidden;

  @media (max-width: 900px) {
    gap: 10px;
    padding: 10px 14px;
    overflow-y: auto;
  }
`;

const FretArea = styled.div`
  grid-area: fret;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  min-height: 0;

  @media (max-width: 900px) {
    align-items: stretch;
  }
`;

const NoteArea = styled.div`
  grid-area: note;
  min-width: 0;
  min-height: 0;
`;

const PracticeArea = styled.div`
  grid-area: practice;
  min-width: 0;
  min-height: 0;
`;

const IdlePractice = styled.div`
  height: 100%;
  width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};

  @media (max-width: 900px) {
    padding: 12px;
    font-size: 11px;
  }
`;

interface PracticeState extends PracticeConfig {
  currentNote: Note;
  noteQueue: Note[];
}

const NEXT_NOTE_DELAY_MS = 1200;
const isMicSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

export function FretboardPage() {
  const [selectedString, setSelectedString] = useState<number | null>(null);
  // These are configured on the settings page and persisted to localStorage; reloading
  // them here on mount is enough to stay in sync, since navigating to another route
  // fully unmounts this page anyway (no need for a live cross-page subscription).
  const [showSharps] = useState(loadShowSharps);
  const [handedness] = useState(loadHandedness);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [practice, setPractice] = useState<PracticeState | null>(null);
  const [fireworkSettings] = useState(loadFireworkSettings);

  // The exact real frequencies for the practiced note on the practiced string (usually
  // one, occasionally two — the open string's note reappears an octave up at fret 12).
  // Feeds both the detector's EQ boost and the stricter frequency-based match check
  // below, instead of accepting any pitch that merely shares the same note letter.
  const targetFrequencies = useMemo(
    () => (practice ? getNoteFrequencies(practice.stringIndex, practice.currentNote) : undefined),
    [practice?.stringIndex, practice?.currentNote],
  );

  const pitch = usePitchDetection(targetFrequencies);
  const advanceTimeoutRef = useRef<number | null>(null);

  const isCorrect =
    !!practice &&
    !!pitch.detected &&
    matchesAnyFrequency(pitch.detected.frequency, targetFrequencies ?? []);

  const handleSelectString = (index: number) => {
    if (practice) return;
    setSelectedString((current) => (current === index ? null : index));
  };

  const handleStartPractice = (config: PracticeConfig) => {
    const openNote = STANDARD_TUNING[config.stringIndex];
    const [currentNote, ...noteQueue] = createNoteBag(openNote, config.includeSharps);
    setPractice({ ...config, currentNote, noteQueue });
    setSelectedString(config.stringIndex);
    setIsModalOpen(false);
  };

  const handleNextNote = () => {
    if (!practice) return;
    // Step through the shuffled bag until it's exhausted, then deal a fresh one —
    // this guarantees every note appears once before any note repeats.
    if (practice.noteQueue.length > 0) {
      const [currentNote, ...noteQueue] = practice.noteQueue;
      setPractice({ ...practice, currentNote, noteQueue });
      return;
    }

    const openNote = STANDARD_TUNING[practice.stringIndex];
    const [currentNote, ...noteQueue] = createNoteBag(
      openNote,
      practice.includeSharps,
      practice.currentNote,
    );
    setPractice({ ...practice, currentNote, noteQueue });
  };

  const handleFinishPractice = () => {
    setPractice(null);
    setSelectedString(null);
  };

  useEffect(() => {
    if (!isCorrect) return;
    advanceTimeoutRef.current = window.setTimeout(handleNextNote, NEXT_NOTE_DELAY_MS);
    return () => {
      if (advanceTimeoutRef.current !== null) {
        window.clearTimeout(advanceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorrect]);

  const stringLabel = practice
    ? `${getStringNumber(practice.stringIndex)} (${STANDARD_TUNING[practice.stringIndex]})`
    : '';

  return (
    <Page>
      <TopBar>
        <StartButton type="button" onClick={() => setIsModalOpen(true)} disabled={!!practice}>
          Start note practice
        </StartButton>
      </TopBar>

      <Content>
        <FretArea>
          <Fretboard
            selectedString={selectedString}
            showSharps={showSharps}
            handedness={handedness}
            practice={
              practice
                ? { stringIndex: practice.stringIndex, showNotesOnString: practice.showNotesOnString }
                : undefined
            }
            onSelectString={handleSelectString}
          />
        </FretArea>

        <NoteArea>
          <LiveNoteIndicator
            isMicSupported={isMicSupported}
            isListening={pitch.isListening}
            detected={pitch.detected}
            volume={pitch.volume}
            error={pitch.error}
            onToggleMic={() => (pitch.isListening ? pitch.stop() : pitch.start())}
          />
        </NoteArea>

        <PracticeArea>
          {practice ? (
            <PracticeCard
              stringLabel={stringLabel}
              note={practice.currentNote}
              isListeningForMatch={pitch.isListening}
              isCorrect={isCorrect}
              detectedNote={pitch.detected?.note ?? null}
              onNext={handleNextNote}
              onFinish={handleFinishPractice}
            />
          ) : (
            <IdlePractice>
              Click "Start note practice" to train finding notes on a string
            </IdlePractice>
          )}
        </PracticeArea>
      </Content>

      {isModalOpen && (
        <PracticeModal onStart={handleStartPractice} onCancel={() => setIsModalOpen(false)} />
      )}

      {isCorrect && fireworkSettings.enabled && (
        <Firework key={practice?.currentNote} {...DENSITY_CONFIG[fireworkSettings.density]} />
      )}
    </Page>
  );
}
