import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';
import { router } from './router';
import { useShouldPromptRotate } from './hooks/useOrientation';
import { RotateDeviceOverlay } from './components/Layout/RotateDeviceOverlay';

function App() {
  const shouldPromptRotate = useShouldPromptRotate();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {shouldPromptRotate ? <RotateDeviceOverlay /> : <RouterProvider router={router} />}
    </ThemeProvider>
  );
}

export default App;
