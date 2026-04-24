import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { CalendarPage } from './pages/CalendarPage';
import { AdminPage } from './pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: CalendarPage,
      },
      {
        path: 'admin',
        Component: AdminPage,
      },
    ],
  },
]);
