import { createBrowserRouter } from 'react-router-dom';
import { FretboardPage } from './pages/FretboardPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter(
  [
    { path: '/', element: <FretboardPage /> },
    { path: '/settings', element: <SettingsPage /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
