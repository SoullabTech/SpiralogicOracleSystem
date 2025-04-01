import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Star, Book, Brain, Settings, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PractitionerPanelUI } from './PractitionerPanelUI';
import { OracleSessionHub } from './OracleSessionHub';
import { ApprenticeSessionForm } from './ApprenticeSessionForm';
import { AssignmentPanelUI } from './AssignmentPanelUI';
import { ToastProvider } from './ToastProvider';

export default function OracleDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeClient, setActiveClient] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select(`
          role_types (
            name,
            capabilities
          )
        `)
        .eq('user_id', user.id)
        .single();

      setUserRole(roleData?.role_types);
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sidebarItems = [
    {
      name: 'Clients',
      icon: Users,
      path: '/clients',
      role: ['admin', 'practitioner']
    },
    {
      name: 'Oracle Sessions',
      icon: Star,
      path: '/sessions',
      role: ['admin', 'practitioner', 'apprentice']
    },
    {
      name: 'Apprentice Notes',
      icon: Book,
      path: '/apprentice',
      role: ['apprentice']
    },
    {
      name: 'Assignments',
      icon: Brain,
      path: '/assignments',
      role: ['admin']
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings',
      role: ['admin', 'practitioner', 'apprentice']
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="text-purple-600" size={24} />
                </div>
                <h1 className="text-xl font-bold">Oracle System</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarItems
                .filter(item => !item.role || item.role.includes(userRole?.name))
                .map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-40 lg:hidden bg-white border-b px-4 py-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="p-6">
            {location.pathname === '/clients' && (
              <PractitionerPanelUI onClientSelect={setActiveClient} />
            )}
            
            {location.pathname === '/sessions' && activeClient && (
              <OracleSessionHub clientId={activeClient.id} />
            )}
            
            {location.pathname === '/apprentice' && (
              <ApprenticeSessionForm />
            )}
            
            {location.pathname === '/assignments' && (
              <AssignmentPanelUI />
            )}
            
            {location.pathname === '/settings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                {/* Add settings content */}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}