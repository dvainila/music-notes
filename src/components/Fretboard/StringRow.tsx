import {
  getFretOrder,
  getNoteAt,
  getStringNumber,
  isSharp,
  type Note,
  type Handedness,
} from '../../music/notes';
import { Row, StringLine, StringLabel, StringNumber, StringNoteName, FretCell, NoteBubble } from './StringRow.styles';

interface StringRowProps {
  openNote: Note;
  stringIndex: number;
  isSelected: boolean;
  isDimmed: boolean;
  showSharps: boolean;
  handedness: Handedness;
  hideNotes?: boolean;
  onSelect: (index: number) => void;
}

export function StringRow({
  openNote,
  stringIndex,
  isSelected,
  isDimmed,
  showSharps,
  handedness,
  hideNotes = false,
  onSelect,
}: StringRowProps) {
  const frets = getFretOrder(handedness);
  const nutSide = handedness === 'left' ? 'right' : 'left';

  const label = (
    <StringLabel $active={isSelected}>
      <StringNumber>{getStringNumber(stringIndex)}</StringNumber>
      <StringNoteName>{openNote}</StringNoteName>
    </StringLabel>
  );

  const fretCells = frets.map((fret) => {
    const note = getNoteAt(openNote, fret);
    const sharp = isSharp(note);
    const shouldShowLabel = !hideNotes && (!sharp || showSharps);
    return (
      <FretCell key={fret} $isNut={fret === 1} $nutSide={nutSide} $handedness={handedness}>
        {shouldShowLabel && <NoteBubble $active={isSelected}>{note}</NoteBubble>}
      </FretCell>
    );
  });

  return (
    <Row
      $active={isSelected}
      $dimmed={isDimmed}
      $handedness={handedness}
      onClick={() => onSelect(stringIndex)}
    >
      {handedness === 'left' ? (
        <>
          {fretCells}
          {label}
        </>
      ) : (
        <>
          {label}
          {fretCells}
        </>
      )}
      <StringLine
        $active={isSelected}
        $thickness={getStringNumber(stringIndex) + 1}
        $handedness={handedness}
      />
    </Row>
  );
}
