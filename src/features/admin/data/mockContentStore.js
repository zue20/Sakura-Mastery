import { QuestionType } from '../../quiz/hooks/useQuizQuestions';
import n5GrammarQuestions from '../../quiz/data/n5GrammarQuestions';

// In-memory "database". Swapping this file for real Firebase/Supabase calls
// later is the ONLY thing that needs to change — useAdminQuestions.js and
// every UI component built on top of it stay exactly the same, since they
// only depend on the function signatures below, not how data is stored.

let _questions = n5GrammarQuestions.map((q) => ({
  ...q,
  moduleType: 'grammar',
  level: 'N5',
  difficultyLevel: 1,
}));

let _nextIdCounter = _questions.length + 1;

function generateId(moduleType) {
  return `${moduleType}-mock-${_nextIdCounter++}`;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export const mockContentStore = {
  /** Return all questions, optionally filtered by moduleType and/or level. */
  getAll({ moduleType, level } = {}) {
    let results = _questions;
    if (moduleType) results = results.filter((q) => q.moduleType === moduleType);
    if (level) results = results.filter((q) => q.level === level);
    return clone(results);
  },

  getById(id) {
    const found = _questions.find((q) => q.id === id);
    return found ? clone(found) : null;
  },

  /** Create a new question. Returns the created record (with generated id). */
  create(questionData) {
    const moduleType = questionData.moduleType || 'grammar';
    const newQuestion = {
      ...questionData,
      id: questionData.id || generateId(moduleType),
    };
    _questions = [..._questions, newQuestion];
    return clone(newQuestion);
  },

  /** Update an existing question by id. Returns the updated record, or null if not found. */
  update(id, updates) {
    const index = _questions.findIndex((q) => q.id === id);
    if (index === -1) return null;
    const updated = { ..._questions[index], ...updates, id }; // id is immutable
    _questions = [
      ..._questions.slice(0, index),
      updated,
      ..._questions.slice(index + 1),
    ];
    return clone(updated);
  },

  /** Delete a question by id. Returns true if something was deleted. */
  delete(id) {
    const originalLength = _questions.length;
    _questions = _questions.filter((q) => q.id !== id);
    return _questions.length < originalLength;
  },

  /** Reset to initial mock data — useful for a "Reset Demo Data" admin button. */
  reset() {
    _questions = n5GrammarQuestions.map((q) => ({
      ...q,
      moduleType: 'grammar',
      level: 'N5',
      difficultyLevel: 1,
    }));
    _nextIdCounter = _questions.length + 1;
  },
};

export { QuestionType };