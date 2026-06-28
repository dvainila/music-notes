import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';
import { useShouldPromptRotate } from './hooks/useOrientation';
import { RotateDeviceOverlay } from './components/Layout/RotateDeviceOverlay';
import { MetronomeProvider } from './contexts/MetronomeContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { FretboardPage } from './pages/FretboardPage';
import { SettingsPage } from './pages/SettingsPage';

function CurrentPage() {
  const { view } = useNavigation();
  return view === 'settings' ? <SettingsPage /> : <FretboardPage />;
}

function App() {
  const shouldPromptRotate = useShouldPromptRotate();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <NavigationProvider>
        <MetronomeProvider>
          {shouldPromptRotate ? <RotateDeviceOverlay /> : <CurrentPage />}
        </MetronomeProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
