import { supabaseAdmin } from './supabase-admin';

export async function assignUserRole(userId: string, role: string) {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role
    });

  if (error) throw error;
  return data;
}

export async function updateUserPermissions(userId: string, permissions: string[]) {
  const { data, error } = await supabaseAdmin
    .from('user_permissions')
    .upsert({
      user_id: userId,
      permissions: permissions
    });

  if (error) throw error;
  return data;
}

export async function deleteUser(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) throw error;
  return data;
}