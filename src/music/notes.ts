export const CHROMATIC_SCALE = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type Note = (typeof CHROMATIC_SCALE)[number];

export const STANDARD_TUNING: Note[] = ['E', 'A', 'D', 'G', 'B', 'E'];

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

export function pickRandomPracticeNote(
  openNote: Note,
  includeSharps: boolean,
  excludeNote?: Note,
): PracticeNote {
  const candidates = getPracticeNotes(openNote, includeSharps);
  const pool = candidates.length > 1 ? candidates.filter((c) => c.note !== excludeNote) : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}
