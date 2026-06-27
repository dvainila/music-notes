import { Fragment, type ReactNode } from 'react';
import { STANDARD_TUNING, getFretOrder, MARKER_FRETS, DOUBLE_MARKER_FRET, type Handedness } from '../../music/notes';
import { StringRow } from './StringRow';
import { FretMarker } from './FretMarker';
import { Board, FretNumbers, FretNumber, Spacer, MarkerRow, MarkerCell } from './Fretboard.styles';

interface PracticeVisibility {
  stringIndex: number;
  showNotesOnString: boolean;
}

interface FretboardProps {
  selectedString: number | null;
  showSharps: boolean;
  handedness: Handedness;
  practice?: PracticeVisibility;
  onSelectString: (index: number) => void;
}

export function Fretboard({
  selectedString,
  showSharps,
  handedness,
  practice,
  onSelectString,
}: FretboardProps) {
  const frets = getFretOrder(handedness);
  const fretNumberCells = frets.map((fret) => <FretNumber key={fret}>{fret}</FretNumber>);
  const markerCells = frets.map((fret) => (
    <MarkerCell key={fret}>
      {MARKER_FRETS.has(fret) && <FretMarker fret={fret} />}
      {fret === DOUBLE_MARKER_FRET && <FretMarker fret={fret} double />}
    </MarkerCell>
  ));

  const renderRow = (content: ReactNode) =>
    handedness === 'left' ? (
      <>
        {content}
        <Spacer />
      </>
    ) : (
      <>
        <Spacer />
        {content}
      </>
    );

  const middleStringIndex = Math.floor(STANDARD_TUNING.length / 2);

  // Render thinnest (string 1) at the top down to thickest (string 6) at the bottom,
  // matching standard tab/chord-diagram convention — opposite of STANDARD_TUNING's array order.
  const displayOrder = STANDARD_TUNING.map((_, index) => index).reverse();

  return (
    <Board>
      <FretNumbers $handedness={handedness}>{renderRow(fretNumberCells)}</FretNumbers>
      {displayOrder.map((stringIndex, position) => (
        <Fragment key={stringIndex}>
          {position === middleStringIndex && (
            <MarkerRow $handedness={handedness}>{renderRow(markerCells)}</MarkerRow>
          )}
          <StringRow
            openNote={STANDARD_TUNING[stringIndex]}
            stringIndex={stringIndex}
            isSelected={selectedString === stringIndex}
            isDimmed={selectedString !== null && selectedString !== stringIndex}
            showSharps={showSharps}
            handedness={handedness}
            hideNotes={
              practice
                ? !(stringIndex === practice.stringIndex && practice.showNotesOnString)
                : false
            }
            onSelect={onSelectString}
          />
        </Fragment>
      ))}
    </Board>
  );
}
