export type FireworkDensity = 'low' | 'medium' | 'high';

export interface FireworkSettings {
  enabled: boolean;
  density: FireworkDensity;
  trails: boolean;
}

const STORAGE_KEY = 'guitar-fretboard:fireworks';

const DEFAULT_SETTINGS: FireworkSettings = { enabled: true, density: 'medium', trails: false };

export function loadFireworkSettings(): FireworkSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    const density: FireworkDensity =
      parsed.density === 'low' || parsed.density === 'medium' || parsed.density === 'high'
        ? parsed.density
        : DEFAULT_SETTINGS.density;
    return { enabled: !!parsed.enabled, density, trails: !!parsed.trails };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveFireworkSettings(settings: FireworkSettings): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
