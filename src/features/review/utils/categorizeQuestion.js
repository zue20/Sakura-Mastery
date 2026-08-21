export const ReviewCategory = {
  VOCAB_GRAMMAR: 'vocab_grammar',
  LISTENING: 'listening',
  KANJI_KANA: 'kanji_kana',
  SPEAKING: 'speaking',
};

export const REVIEW_CATEGORY_LABELS = {
  [ReviewCategory.VOCAB_GRAMMAR]: 'Vocab / Grammar',
  [ReviewCategory.LISTENING]: 'Listening',
  [ReviewCategory.KANJI_KANA]: 'Kanji / Kana',
  [ReviewCategory.SPEAKING]: 'Speaking',
};

const MODULE_TYPE_TO_CATEGORY = {
  grammar: ReviewCategory.VOCAB_GRAMMAR,
  vocabulary: ReviewCategory.VOCAB_GRAMMAR,
  listening: ReviewCategory.LISTENING,
  kanji: ReviewCategory.KANJI_KANA,
  basic: ReviewCategory.KANJI_KANA,
  speaking: ReviewCategory.SPEAKING,
};

export function categorizeMistake(moduleType) {
  return MODULE_TYPE_TO_CATEGORY[moduleType] ?? ReviewCategory.VOCAB_GRAMMAR;
}