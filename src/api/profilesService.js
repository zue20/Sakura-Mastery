import { supabase } from './supabaseClient';

export async function getMyRole() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.warn('getMyRole failed:', error.message);
    return null;
  }
  return data?.role ?? 'user';
}

export async function updateUserRole(userId, role) {
  if (!['user', 'admin'].includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}