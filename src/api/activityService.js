import { supabase } from './supabaseClient';

export async function logAction({ action, targetType, targetLabel }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('admin_actions').insert({
    admin_id: user.id,
    admin_email: user.email,
    action,
    target_type: targetType,
    target_label: targetLabel ?? null,
  });

  if (error) {
    // Never let a logging failure block the actual action.
    console.warn('logAction failed:', error.message);
  }
}

export async function getRecentActions(limit = 30) {
  const { data, error } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}