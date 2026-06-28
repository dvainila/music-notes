import { createContext, useContext, type ReactNode } from 'react';
import { useMetronome } from '../audio/useMetronome';

type MetronomeContextValue = ReturnType<typeof useMetronome>;

const MetronomeContext = createContext<MetronomeContextValue | null>(null);

interface MetronomeProviderProps {
  children: ReactNode;
}

// Lives above the router so the metronome keeps ticking when navigating between
// pages — the control UI lives on the settings page, but stopping playback just
// because the user went back to the fretboard page would defeat the point.
export function MetronomeProvider({ children }: MetronomeProviderProps) {
  const metronome = useMetronome();
  return <MetronomeContext.Provider value={metronome}>{children}</MetronomeContext.Provider>;
}

export function useMetronomeContext(): MetronomeContextValue {
  const context = useContext(MetronomeContext);
  if (!context) {
    throw new Error('useMetronomeContext must be used within a MetronomeProvider');
  }
  return context;
}
