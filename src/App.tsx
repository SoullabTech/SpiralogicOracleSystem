import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useRole } from './hooks/useRole';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientPortal } from './components/ClientPortal';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';
import ElementalMentor from './components/ElementalMentor';
import JournalingSpace from './components/JournalingSpace';
import SpiralogicProgress from './components/SpiralogicProgress';
import SessionHistory from './components/SessionHistory';

export default function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useRole();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              role?.name === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" state={{ from: '/admin' }} />
              )
            }
          />

          {/* Practitioner Routes */}
          <Route
            path="/practitioner/*"
            element={
              role?.name === 'practitioner' ? (
                <Routes>
                  <Route path="clients/:clientId" element={<ElementalMentor clientId={user?.id || ''} />} />
                  <Route path="sessions/:clientId" element={<SessionHistory clientId={user?.id || ''} />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              ) : (
                <Navigate to="/login" state={{ from: '/practitioner' }} />
              )
            }
          />

          {/* Client Routes */}
          <Route
            path="/client/*"
            element={
              role?.name === 'client' ? (
                <Routes>
                  <Route path="/" element={<ClientPortal />} />
                  <Route path="journal" element={<JournalingSpace clientId={user?.id || ''} />} />
                  <Route path="progress" element={<SpiralogicProgress clientId={user?.id || ''} />} />
                  <Route path="sessions" element={<SessionHistory clientId={user?.id || ''} />} />
                </Routes>
              ) : (
                <Navigate to="/login" state={{ from: '/client' }} />
              )
            }
          />

          {/* Dashboard Route - Redirects based on role */}
          <Route
            path="/dashboard"
            element={
              user ? (
                role?.name === 'admin' ? (
                  <Navigate to="/admin" />
                ) : role?.name === 'practitioner' ? (
                  <Navigate to="/practitioner" />
                ) : (
                  <Navigate to="/client" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Route>

        {/* Default Routes */}
        <Route 
          path="/" 
          element={<Navigate to={user ? '/dashboard' : '/login'} />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={user ? '/dashboard' : '/login'} />} 
        />
      </Routes>
    </Router>
  );
}