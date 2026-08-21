import { supabase } from './supabaseClient'; // adjust path to your actual client export

/**
 * Logs a completed quiz attempt. Call this once, right when a quiz session ends
 * (pass in the final tally from useGamification's `summary`).
 */
export async function logAttempt({ userId, level, moduleType, title, correct, total, xpEarned }) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      level,
      module_type: moduleType,
      title: title ?? null,
      score_correct: correct,
      score_total: total,
      xp_earned: xpEarned ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Recent attempts for a user, optionally filtered by level, for RecentActivityList.
 */
export async function getRecentAttempts({ userId, level, limit = 6 }) {
  let query = supabase
    .from('quiz_attempts')
    .select('id, level, module_type, title, score_correct, score_total, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (level) {
    query = query.eq('level', level);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}