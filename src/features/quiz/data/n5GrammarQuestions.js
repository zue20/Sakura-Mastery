import { QuestionType } from '../hooks/useQuizQuestions';

const n5GrammarQuestions = [
  {
    id: 'n5-grammar-1',
    type: QuestionType.DRAG_DROP,
    prompt: 'Arrange the words to form a correct Japanese sentence.',
    words: ['私は', '学生', 'です'],
    correctOrder: ['私は', '学生', 'です'],
  },
  {
    id: 'n5-grammar-2',
    type: QuestionType.MULTIPLE_CHOICE,
    prompt: 'Which particle correctly completes this sentence: 私___ 学生です。',
    options: [
      { id: 'a', label: 'は' },
      { id: 'b', label: 'を' },
      { id: 'c', label: 'に' },
      { id: 'd', label: 'で' },
    ],
    correctOptionId: 'a',
  },
  {
    id: 'n5-grammar-3',
    type: QuestionType.DRAG_DROP,
    prompt: 'Arrange the words to form a correct Japanese sentence.',
    words: ['を', '食べます', 'ご飯', '私は'],
    correctOrder: ['私は', 'ご飯', 'を', '食べます'],
  },
];

export default n5GrammarQuestions;