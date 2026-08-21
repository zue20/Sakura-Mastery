import { QuestionType } from '../hooks/useQuizQuestions';

const n5ListeningQuestions = [
  {
    id: 'n5-listening-1',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'listening',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'Listen to the audio and select the correct translation.',
    audio: { text: 'おはようございます', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'Good morning' },
      { id: 'b', label: 'Good night' },
      { id: 'c', label: 'Thank you' },
      { id: 'd', label: 'Excuse me' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'n5-listening-2',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'listening',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'Listen to the audio and select the correct translation.',
    audio: { text: 'すみません', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'Hello' },
      { id: 'b', label: 'Excuse me / Sorry' },
      { id: 'c', label: 'Goodbye' },
      { id: 'd', label: 'Yes' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'n5-listening-3',
    type: QuestionType.MULTIPLE_CHOICE,
    moduleType: 'listening',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'Listen to the audio and select the correct translation.',
    audio: { text: '私は学生です', lang: 'ja-JP' },
    options: [
      { id: 'a', label: 'I am a teacher' },
      { id: 'b', label: 'This is a school' },
      { id: 'c', label: 'I am a student' },
      { id: 'd', label: 'I like studying' },
    ],
    correctOptionId: 'c',
  },
];

export default n5ListeningQuestions;