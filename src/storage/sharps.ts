const STORAGE_KEY = 'guitar-fretboard:show-sharps';

export function loadShowSharps(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function saveShowSharps(value: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(value));
}
