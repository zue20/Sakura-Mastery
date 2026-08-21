import { supabase } from './supabaseClient';

export async function recordMiss({ userId, questionId, moduleType, level }) {
  const { error } = await supabase
    .from('missed_questions')
    .insert({ user_id: userId, question_id: questionId, module_type: moduleType, level });
  if (error) throw error;
}

/** Up to 5 most recent distinct mistakes for this module/level. */
export async function getRecentMistakeIds({ userId, moduleType, level, limit = 5 }) {
  const { data, error } = await supabase
    .from('missed_questions')
    .select('question_id, missed_at')
    .eq('user_id', userId)
    .eq('module_type', moduleType)
    .eq('level', level)
    .order('missed_at', { ascending: false })
    .limit(30); // over-fetch since we dedupe below

  if (error) throw error;

  const seen = new Set();
  const ids = [];
  for (const row of data ?? []) {
    if (!seen.has(row.question_id)) {
      seen.add(row.question_id);
      ids.push(row.question_id);
    }
    if (ids.length >= limit) break;
  }
  return ids;
}

export async function clearMistakes({ userId, questionIds }) {
  if (!questionIds?.length) return;
  const { error } = await supabase
    .from('missed_questions')
    .delete()
    .eq('user_id', userId)
    .in('question_id', questionIds);
  if (error) throw error;
}

/**
 * All of a user's active (not-yet-mastered) mistakes, across every module
 * and level, deduped to the most recent miss per question. Powers the
 * Review Hub — unlike getRecentMistakeIds, this is not scoped or capped.
 */
export async function getAllMistakes(userId) {
  const { data, error } = await supabase
    .from('missed_questions')
    .select('question_id, module_type, level, missed_at')
    .eq('user_id', userId)
    .order('missed_at', { ascending: false });

  if (error) throw error;

  const seen = new Set();
  const deduped = [];
  for (const row of data ?? []) {
    if (seen.has(row.question_id)) continue;
    seen.add(row.question_id);
    deduped.push(row);
  }
  return deduped; // [{ question_id, module_type, level, missed_at }]
}