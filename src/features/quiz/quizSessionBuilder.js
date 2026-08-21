// quizSessionBuilder.js

export const MULTIPLE_CHOICE_TYPES = ['multipleChoice'];

export const QUIZ_SESSION_CONFIG = {
  total: 10,
};

export function filterForMultipleChoice(questions = []) {
  return questions.filter((q) => MULTIPLE_CHOICE_TYPES.includes(q.type));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function takeRandom(pool, count) {
  return shuffle(pool).slice(0, Math.max(0, count));
}

/**
 * Builds a Quiz session from multiple-choice questions only — writing
 * types (kanjiWrite, kanaWrite) never enter this pool. Still exactly
 * `total` questions, still fully shuffled.
 */
export function buildQuizSession(allQuestions = [], config = QUIZ_SESSION_CONFIG) {
  const { total } = config;

  const mcPool = filterForMultipleChoice(allQuestions);
  const selected = takeRandom(mcPool, total);

  if (selected.length < total) {
    console.warn(
      `[quizSession] Only ${selected.length}/${total} multiple-choice questions available. Check Supabase content for this level/module.`
    );
  }

  return shuffle(selected);
}