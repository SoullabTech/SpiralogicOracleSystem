import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // required for invite validation
  { 
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// Helper to safely check if user has admin privileges
export async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const adminEmails = process.env.ADMIN_ALLOWED_EMAILS?.split(',') || [];
    if (adminEmails.length === 0) return false;

    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    return adminEmails.includes(user.user?.email || '');
  } catch {
    return false;
  }
}

// Helper to validate beta invite codes
export async function validateBetaInvite(code: string) {
  const { data: invite } = await supabaseAdmin
    .from('beta_invites')
    .select('*')
    .eq('code', String(code).trim())
    .single();

  if (!invite) {
    return { valid: false, error: 'Invalid invite code' };
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { valid: false, error: 'Invite code has expired' };
  }

  if (invite.uses >= invite.max_uses) {
    return { valid: false, error: 'Invite code has reached maximum uses' };
  }

  return { valid: true, invite };
}

// Helper to increment invite usage
export async function incrementInviteUsage(code: string) {
  const { data } = await supabaseAdmin
    .from('beta_invites')
    .select('uses')
    .eq('code', code)
    .single();

  if (data) {
    await supabaseAdmin
      .from('beta_invites')
      .update({ uses: data.uses + 1 })
      .eq('code', code);
  }
}

// Helper to award badges via service role
export async function awardBadgeAdmin(userId: string, badgeId: string, source: string = 'system') {
  return await supabaseAdmin
    .from('beta_user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      source
    })
    .select()
    .maybeSingle();
}