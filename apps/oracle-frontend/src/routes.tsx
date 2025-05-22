// src/routes.tsx

import { RouteObject } from 'react-router-dom';

import AstroFormPage from '@/pages/astro';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import DreamOraclePage from '@/pages/DreamOraclePage';
import NotFoundPage from '@/pages/NotFoundPage';

export const publicRoutes: RouteObject[] = [
  { path: '/login', element: <AuthPage /> },
  { path: '/astro', element: <AstroFormPage /> },
];

export const protectedRoutes: RouteObject[] = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/dream-oracle', element: <DreamOraclePage /> },
];

export const fallbackRoute: RouteObject = {
  path: '*',
  element: <NotFoundPage />,
};
