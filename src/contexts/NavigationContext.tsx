import { createContext, useContext, useState, type ReactNode } from 'react';

export type AppView = 'fretboard' | 'settings';

interface NavigationContextValue {
  view: AppView;
  setView: (view: AppView) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

// The app has just two screens and no need for shareable/bookmarkable URLs, so it
// switches between them with plain state instead of a router. That sidesteps GitHub
// Pages' static hosting not knowing how to serve a client-side route on a hard
// reload (e.g. reloading on "/settings" 404s, since there's no real file there).
export function NavigationProvider({ children }: NavigationProviderProps) {
  const [view, setView] = useState<AppView>('fretboard');
  return <NavigationContext.Provider value={{ view, setView }}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
