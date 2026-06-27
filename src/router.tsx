import { createBrowserRouter } from 'react-router-dom';
import { FretboardPage } from './pages/FretboardPage';

export const router = createBrowserRouter([{ path: '/', element: <FretboardPage /> }]);
