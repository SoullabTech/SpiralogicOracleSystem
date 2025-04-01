import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  capabilities: Record<string, boolean>;
}

export function useRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If no session, set default role and return early
        if (!session) {
          if (isMounted) {
            setRole({
              id: 1,
              name: 'client',
              description: 'Default client role',
              capabilities: getDefaultCapabilities('client')
            });
            setIsLoading(false);
          }
          return;
        }

        // Get user's role from user_roles table
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            role_types (
              id,
              name,
              description,
              capabilities
            )
          `)
          .eq('user_id', session.user.id)
          .single();

        if (roleError) {
          // If no explicit role is found, default to 'client' role
          const { data: defaultRole, error: defaultRoleError } = await supabase
            .from('role_types')
            .select('*')
            .eq('name', 'client')
            .single();

          if (defaultRoleError) throw defaultRoleError;
          
          if (isMounted) {
            setRole(defaultRole);
          }
        } else if (userRole && userRole.role_types) {
          if (isMounted) {
            setRole(userRole.role_types);
          }
        }
      } catch (err) {
        console.error('Error loading role:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load role');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRole();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadRole();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const hasCapability = (capability: string): boolean => {
    return !!role?.capabilities?.[capability];
  };

  const isAdmin = (): boolean => {
    return role?.name === 'admin';
  };

  const isPractitioner = (): boolean => {
    return role?.name === 'practitioner';
  };

  const isClient = (): boolean => {
    return role?.name === 'client';
  };

  return {
    role,
    isLoading,
    error,
    hasCapability,
    isAdmin,
    isPractitioner,
    isClient
  };
}

function getDefaultCapabilities(roleName: string): Record<string, boolean> {
  switch (roleName) {
    case 'admin':
      return {
        manage_users: true,
        manage_roles: true,
        manage_content: true,
        view_all: true
      };
    case 'practitioner':
      return {
        view_clients: true,
        manage_sessions: true,
        create_notes: true
      };
    case 'client':
      return {
        view_own_data: true,
        create_journal: true
      };
    default:
      return {
        view_own_data: true
      };
  }
}