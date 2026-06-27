import type { Handedness } from '../music/notes';

const STORAGE_KEY = 'guitar-fretboard:handedness';

export function loadHandedness(): Handedness {
  if (typeof localStorage === 'undefined') return 'right';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'left' || stored === 'right' ? stored : 'right';
}

export function saveHandedness(value: Handedness): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, value);
}
