// src/routes/index.tsx
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import ProtectedRoute from '@/components/ProtectedRoute';
import ChatPage from '@/pages/chat';
import DebugJwt from '@/pages/DebugJwt';
import FacilitatorPage from '@/pages/facilitator';
import GetTokenDebug from '@/pages/GetTokenDebug';

const Dashboard    = lazy(() => import('@/pages/dashboard'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const publicRoutes = [
  { path: '/login',      element: <div>Login Page</div> },
  { path: '/about',      element: <div>About Page</div> },
  { path: '/chat',       element: <ChatPage /> },
  { path: '/debug-jwt',  element: <DebugJwt /> },
  { path: '/get-token',  element: <GetTokenDebug /> },
  { path: '/facilitator', element: <FacilitatorPage /> },
];

const protectedRoutes = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
];

const fallbackRoute = {
  path: '*',
  element: <Navigate to="/login" replace />,
};

export { fallbackRoute, protectedRoutes, publicRoutes };

