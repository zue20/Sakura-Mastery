import { QuestionType } from '../hooks/useQuizQuestions';

const n5VocabularyQuestions = [
  {
    id: 'n5-vocab-1',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'vocabulary',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'What does this word mean?',
    displayText: '猫 (ねこ)',
    audio: { text: '猫', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'Dog' },
      { id: 'b', label: 'Cat' },
      { id: 'c', label: 'Bird' },
      { id: 'd', label: 'Fish' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'n5-vocab-2',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'vocabulary',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'What does this word mean?',
    displayText: '水 (みず)',
    audio: { text: '水', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'Fire' },
      { id: 'b', label: 'Tree' },
      { id: 'c', label: 'Water' },
      { id: 'd', label: 'Earth' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'n5-vocab-3',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'vocabulary',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'What does this word mean?',
    displayText: '学生 (がくせい)',
    audio: { text: '学生', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'Teacher' },
      { id: 'b', label: 'Student' },
      { id: 'c', label: 'School' },
      { id: 'd', label: 'Book' },
    ],
    correctOptionId: 'b',
  },
];

export default n5VocabularyQuestions;
