export type FireworkDensity = 'low' | 'medium' | 'high';
export type FireworkSize = 'small' | 'medium' | 'large';
export type FireworkDuration = 'short' | 'normal' | 'long';

export interface FireworkSettings {
  enabled: boolean;
  density: FireworkDensity;
  trails: boolean;
  size: FireworkSize;
  duration: FireworkDuration;
}

const STORAGE_KEY = 'guitar-fretboard:fireworks';

const DEFAULT_SETTINGS: FireworkSettings = {
  enabled: true,
  density: 'medium',
  trails: false,
  size: 'medium',
  duration: 'normal',
};

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

export function loadFireworkSettings(): FireworkSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored);
    return {
      enabled: !!parsed.enabled,
      density: isOneOf(parsed.density, ['low', 'medium', 'high'] as const)
        ? parsed.density
        : DEFAULT_SETTINGS.density,
      trails: !!parsed.trails,
      size: isOneOf(parsed.size, ['small', 'medium', 'large'] as const)
        ? parsed.size
        : DEFAULT_SETTINGS.size,
      duration: isOneOf(parsed.duration, ['short', 'normal', 'long'] as const)
        ? parsed.duration
        : DEFAULT_SETTINGS.duration,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveFireworkSettings(settings: FireworkSettings): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
