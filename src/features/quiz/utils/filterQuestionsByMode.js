export const WRITING_TYPES = ['kanjiWrite', 'kanaWrite'];

/** Keep only writing-practice questions (Kanji/Kana tracing). */
export function filterForWritingPractice(questions = []) {
  return questions.filter((q) => WRITING_TYPES.includes(q.type));
}

/** Keep only quiz-assessable questions — excludes writing types entirely,
 * so the canvas never appears inside a scored quiz session. */
export function filterForQuiz(questions = []) {
  return questions.filter((q) => !WRITING_TYPES.includes(q.type));
}