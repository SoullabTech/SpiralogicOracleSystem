import { supabase } from './supabase';

export async function getUserRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch user role:', error);
      return null;
    }

    return data.role;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}

export async function isPractitioner() {
  const role = await getUserRole();
  return role === 'practitioner';
}

export async function isClient() {
  const role = await getUserRole();
  return role === 'client' || !role; // Default to client if no role is set
}

export async function hasPermission(permission: string): Promise<boolean> {
  const role = await getUserRole();
  
  // Define role permissions
  const permissions = {
    admin: ['manage_users', 'manage_roles', 'manage_content', 'view_all'],
    practitioner: ['view_clients', 'manage_sessions', 'create_notes'],
    client: ['view_own_data', 'create_journal']
  };

  if (!role || !permissions[role as keyof typeof permissions]) {
    return false;
  }

  return permissions[role as keyof typeof permissions].includes(permission);
}