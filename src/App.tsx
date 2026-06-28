import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';
import { router } from './router';
import { useShouldPromptRotate } from './hooks/useOrientation';
import { RotateDeviceOverlay } from './components/Layout/RotateDeviceOverlay';
import { MetronomeProvider } from './contexts/MetronomeContext';

function App() {
  const shouldPromptRotate = useShouldPromptRotate();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <MetronomeProvider>
        {shouldPromptRotate ? <RotateDeviceOverlay /> : <RouterProvider router={router} />}
      </MetronomeProvider>
    </ThemeProvider>
  );
}

export default App;
