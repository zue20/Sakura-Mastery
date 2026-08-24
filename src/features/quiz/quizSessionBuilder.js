// quizSessionBuilder.js

export const QUIZ_ELIGIBLE_TYPES = ['multipleChoice', 'dragdrop'];

export const QUIZ_SESSION_CONFIG = {
  total: 12,
};

export function filterForQuizEligible(questions = []) {
  return questions.filter((q) => QUIZ_ELIGIBLE_TYPES.includes(q.type));
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
 * Builds a Quiz session from multiple-choice AND drag-drop questions,
 * mixed together and randomly ordered. Writing types (kanjiWrite,
 * kanaWrite) still never enter this pool — those stay exclusive to
 * WritingPracticeScreen.
 */
export function buildQuizSession(allQuestions = [], config = QUIZ_SESSION_CONFIG) {
  const { total } = config;

  const eligiblePool = filterForQuizEligible(allQuestions);
  const selected = takeRandom(eligiblePool, total);

  if (selected.length < total) {
    console.warn(
      `[quizSession] Only ${selected.length}/${total} quiz-eligible questions available. Check Supabase content for this level/module.`
    );
  }

  return shuffle(selected);
}