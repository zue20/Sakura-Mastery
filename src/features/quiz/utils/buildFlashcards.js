export function buildFlashcardsFromQuestions(questions = []) {
  return questions
    .map((q) => questionToFlashcard(q))
    .filter(Boolean);
}

/**
 * Strips instructional meta-text like "Which particle correctly completes
 * this sentence:" and keeps just the sentence with its blank, cloze-style.
 * Falls back to the raw prompt if no colon-separated sentence is found.
 */
function extractClozeSentence(prompt) {
  const colonIndex = prompt.lastIndexOf(':');
  const sentence = colonIndex !== -1 ? prompt.slice(colonIndex + 1).trim() : prompt;
  return sentence.replace(/_+/g, '[ ... ]');
}

function questionToFlashcard(q) {
  // Vocabulary as multiple choice — word/sentence -> meaning
  if (q.type === 'multipleChoice' && q.moduleType === 'vocabulary' && Array.isArray(q.options) && q.correctOptionId) {
    const correctOption = q.options.find((o) => o.id === q.correctOptionId);
    return {
      id: q.id,
      sourceType: 'multipleChoice',
      front: q.displayText ?? q.prompt,
      back: correctOption?.label ?? '?',
      imageUrl: q.imageUrl ?? null,
      audio: q.audio ?? null,
    };
  }

  // Grammar as multiple choice (particle/structure questions) — Anki-style
  // cloze card. Front: sentence with a blank shown as [...]. Back: the
  // completed sentence with the correct answer highlighted, plus an
  // explanation/translation if that data exists.
  if (q.type === 'multipleChoice' && q.moduleType === 'grammar' && Array.isArray(q.options) && q.correctOptionId) {
    const correctOption = q.options.find((o) => o.id === q.correctOptionId);
    const clozeSentence = extractClozeSentence(q.prompt);
    const completedSentence = clozeSentence.replace(/_+/g, correctOption?.label ?? '___');
    return {
      id: q.id,
      sourceType: 'grammarPoint',
      front: clozeSentence,
      back: completedSentence,
      answer: correctOption?.label ?? '?',
      explanation: q.explanation ?? null,
      translation: q.translation ?? null,
    };
  }

  // Any other multiple choice (Listening, Kanji identification, etc.)
  if (q.type === 'multipleChoice' && Array.isArray(q.options) && q.correctOptionId) {
    const correctOption = q.options.find((o) => o.id === q.correctOptionId);
    return {
      id: q.id,
      sourceType: 'multipleChoice',
      front: q.displayText ?? q.prompt,
      back: correctOption?.label ?? '?',
      imageUrl: q.imageUrl ?? null,
      audio: q.audio ?? null,
    };
  }

  // Grammar as drag & drop — carries words/correctOrder for the Structure Builder
  if (q.type === 'dragdrop' && Array.isArray(q.correctOrder)) {
    return {
      id: q.id,
      sourceType: 'dragdrop',
      front: q.prompt,
      back: q.correctOrder.join(''),
      words: q.words,
      correctOrder: q.correctOrder,
    };
  }

  // Kanji / Kana writing — carries canvasData for the Tracing component
  if ((q.type === 'kanjiWrite' || q.type === 'kanaWrite') && q.data?.character) {
    const { character, reading, romaji, meaning } = q.data;
    const backParts = [reading, romaji, meaning].filter(Boolean).join(' · ');
    return {
      id: q.id,
      sourceType: 'writing',
      front: character,
      back: backParts || '?',
      canvasData: q.data,
    };
  }

  return null;
}