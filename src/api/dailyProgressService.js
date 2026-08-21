import { supabase } from './supabaseClient';

export async function recordDailyProgress({ userId, xpEarned, correct, total }) {
  const { error } = await supabase.rpc('increment_daily_progress', {
    p_user_id: userId,
    p_xp: xpEarned ?? 0,
    p_correct: correct,
    p_total: total,
  });
  if (error) throw error;
}

export async function getTodayProgress(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('daily_progress')
    .select('xp_earned, questions_answered, correct_answers')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .maybeSingle();

  if (error) throw error;
  return data ?? { xp_earned: 0, questions_answered: 0, correct_answers: 0 };
}

export async function getWeekProgress(userId) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const { data, error } = await supabase
    .from('daily_progress')
    .select('activity_date, xp_earned, questions_answered, correct_answers')
    .eq('user_id', userId)
    .gte('activity_date', days[0])
    .lte('activity_date', days[6]);

  if (error) throw error;

  const byDate = Object.fromEntries((data ?? []).map((row) => [row.activity_date, row]));
  return days.map((date) => byDate[date] ?? { activity_date: date, xp_earned: 0, questions_answered: 0, correct_answers: 0 });
}

export async function getCurrentStreak(userId) {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('activity_date')
    .eq('user_id', userId)
    .order('activity_date', { ascending: false })
    .limit(60);

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const dateSet = new Set(data.map((r) => r.activity_date));
  const cursor = new Date();
  let streak = 0;

  for (let i = 0; i < 60; i++) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dateSet.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Lifetime XP total across ALL levels — used by the wheel's center stat.
 */
export async function getTotalXp(userId) {
  const { data, error } = await supabase
    .from('daily_progress')
    .select('xp_earned')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
}

/**
 * Lifetime XP scoped to quiz_attempts for a specific level, since
 * daily_progress itself isn't level-segmented. Used for the crown badge
 * on the N5/N4 level pills.
 */
export async function getTotalXpByLevel(userId, level) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('xp_earned')
    .eq('user_id', userId)
    .eq('level', level);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row.xp_earned ?? 0), 0);
}

/**
 * Attempts to spend `amount` XP. Re-checks the live total right before
 * deducting (not a cached value) to avoid a stale-balance race. Returns
 * { success: true, remainingXp } or { success: false, currentXp } —
 * never throws for "not enough XP", only for genuine Supabase errors.
 */
export async function spendXp({ userId, amount }) {
  const currentXp = await getTotalXp(userId);
  if (currentXp < amount) {
    return { success: false, currentXp };
  }
  await recordDailyProgress({ userId, xpEarned: -amount, correct: 0, total: 0 });
  return { success: true, remainingXp: currentXp - amount };
}