import { CHROMATIC_SCALE, type Note } from './notes';

const A4_FREQUENCY = 440;
const A4_MIDI = 69;

export interface DetectedNote {
  note: Note;
  octave: number;
  cents: number;
  frequency: number;
}

export function frequencyToNote(frequency: number): DetectedNote {
  const midi = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI;
  const roundedMidi = Math.round(midi);
  const cents = Math.round((midi - roundedMidi) * 100);
  const note = CHROMATIC_SCALE[((roundedMidi % 12) + 12) % 12];
  const octave = Math.floor(roundedMidi / 12) - 1;
  return { note, octave, cents, frequency };
}

export function centsBetween(frequencyA: number, frequencyB: number): number {
  return 1200 * Math.log2(frequencyA / frequencyB);
}

/**
 * Whether a detected frequency is close enough (within toleranceCents) to any of the
 * given target frequencies — used to confirm a detected pitch actually corresponds to
 * a specific real fret position, not just a note name that happens to match globally.
 */
export function matchesAnyFrequency(
  frequency: number,
  targets: number[],
  toleranceCents = 50,
): boolean {
  return targets.some((target) => Math.abs(centsBetween(frequency, target)) <= toleranceCents);
}
