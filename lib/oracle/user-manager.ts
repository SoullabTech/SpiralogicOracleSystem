export interface UserInfo {
  userId: string;
  authenticatedUser?: any;
  displayName?: string;
  preferences?: any;
}

export async function getUserInfo(): Promise<UserInfo> {
  let userId = 'anonymous';
  let authenticatedUser: any = null;
  
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      authenticatedUser = user;
    }
  } catch (error) {
    console.warn('Failed to get user for context:', error);
  }

  return { userId, authenticatedUser };
}

export async function getUserPreferences(userId: string): Promise<any> {
  try {
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs');
    const { cookies } = await import('next/headers');
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    return preferences || {};
  } catch (error) {
    console.warn('Failed to get user preferences:', error);
    return {};
  }
}