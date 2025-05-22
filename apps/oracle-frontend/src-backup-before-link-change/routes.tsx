import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import DreamOraclePage from '@/pages/DreamOraclePage';
import AstroFormPage from '@/pages/astro'; // ✅ Import AstroFormPage
import NotFoundPage from '@/pages/NotFoundPage';

export const publicRoutes = [
  { path: '/login', element: <AuthPage /> },
  { path: '/astro', element: <AstroFormPage /> }, // ✅ Add /astro route
];

export const protectedRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/dream-oracle', element: <DreamOraclePage /> },
];

export const fallbackRoute = {
  path: '*',
  element: <NotFoundPage />,
};
