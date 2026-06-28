export const CHROMATIC_SCALE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type Note = (typeof CHROMATIC_SCALE)[number];

export const STANDARD_TUNING: Note[] = ['E', 'A', 'D', 'G', 'B', 'E'];

// Open-string frequencies (Hz) in standard tuning, same index order as STANDARD_TUNING.
export const STANDARD_TUNING_FREQUENCIES: number[] = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

export const FRET_COUNT = 12;

export const MARKER_FRETS = new Set([3, 5, 7, 9]);
export const DOUBLE_MARKER_FRET = 12;

export type Handedness = 'right' | 'left';

export function getNoteAt(openNote: Note, fret: number): Note {
  const openIndex = CHROMATIC_SCALE.indexOf(openNote);
  const noteIndex = (openIndex + fret) % CHROMATIC_SCALE.length;
  return CHROMATIC_SCALE[noteIndex];
}

export function isSharp(note: Note): boolean {
  return note.includes('#');
}

export function getStringNumber(stringIndex: number): number {
  return STANDARD_TUNING.length - stringIndex;
}

export function getFretOrder(handedness: Handedness): number[] {
  const frets = Array.from({ length: FRET_COUNT }, (_, index) => index + 1);
  return handedness === 'left' ? frets.reverse() : frets;
}

export interface PracticeNote {
  fret: number;
  note: Note;
}

export function getPracticeNotes(openNote: Note, includeSharps: boolean): PracticeNote[] {
  const notes: PracticeNote[] = [];
  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    const note = getNoteAt(openNote, fret);
    if (includeSharps || !isSharp(note)) {
      notes.push({ fret, note });
    }
  }
  return notes;
}

export function getFrequencyAt(stringIndex: number, fret: number): number {
  return STANDARD_TUNING_FREQUENCIES[stringIndex] * 2 ** (fret / 12);
}

/**
 * Every real fret position on a given string that produces this note (usually one,
 * but the open string's note also reappears an octave up at fret 12). Used to check
 * a detected pitch against the actual frequencies the player could be producing on
 * the string being practiced, rather than just comparing note-name letters globally.
 */
export function getNoteFrequencies(stringIndex: number, note: Note): number[] {
  const openNote = STANDARD_TUNING[stringIndex];
  const frequencies: number[] = [];
  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    if (getNoteAt(openNote, fret) === note) {
      frequencies.push(getFrequencyAt(stringIndex, fret));
    }
  }
  return frequencies;
}

export function getUniqueNotes(openNote: Note, includeSharps: boolean): Note[] {
  const seen = new Set<Note>();
  for (const { note } of getPracticeNotes(openNote, includeSharps)) {
    seen.add(note);
  }
  return [...seen];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds a freshly shuffled "bag" containing every available note exactly once,
 * so a full practice round covers all notes before any repeat. If the previous
 * round's last note would land first again (the only seam where a repeat can
 * happen across bags), it's swapped further back in the new bag.
 */
export function createNoteBag(openNote: Note, includeSharps: boolean, avoidFirst?: Note): Note[] {
  const bag = shuffle(getUniqueNotes(openNote, includeSharps));
  if (bag.length > 1 && bag[0] === avoidFirst) {
    const swapWith = 1 + Math.floor(Math.random() * (bag.length - 1));
    [bag[0], bag[swapWith]] = [bag[swapWith], bag[0]];
  }
  return bag;
}
