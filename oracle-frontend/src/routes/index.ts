// src/routes/index.ts
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import ChatPage from '@/pages/chat';
import DebugJwt from '@/pages/DebugJwt';
import FacilitatorPage from '@/pages/facilitator';
import GetTokenDebug from '@/pages/GetTokenDebug';
import OraclePage from '@/pages/OraclePage';
import JournalTimeline from '@/pages/JournalTimeline';
import EphemerisDashboard from '@/pages/EphemerisDashboard';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const publicRoutes = [
  { path: '/login', element: <div>Login Page</div> },
  { path: '/about', element: <div>About Page</div> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/debug-jwt', element: <DebugJwt /> },
  { path: '/get-token', element: <GetTokenDebug /> },
  { path: '/facilitator', element: <FacilitatorPage /> },
  { path: '/oracle/:guideId', element: <OraclePage /> },
];

const protectedRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <EphemerisDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/journal-timeline',
    element: (
      <ProtectedRoute>
        <JournalTimeline />
      </ProtectedRoute>
    ),
  },
];

const fallbackRoute = {
  path: '*',
  element: <Navigate to="/login" replace />,
};

export { fallbackRoute, protectedRoutes, publicRoutes };
