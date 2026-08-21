// One-time seed script — run with: node scripts/seedQuestions.js
// This does NOT use react-native-url-polyfill (that's only needed inside
// the Expo app), so it's a plain Node script, kept outside src/.

const { createClient } = require('@supabase/supabase-js');

// Paste the same values you used in src/api/supabaseClient.js
const SUPABASE_URL = 'https://unxiqyjpgecctedgrtzd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_A3BCvZxOP8Ho4zlPhRMHZw_jT7Hv2Lx';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Your 3 existing mock data sets, inlined here as plain objects ---
// (copy-pasted from your data files so this script has no dependency
// on your app's import paths)

const n5GrammarQuestions = [
  {
    id: 'n5-grammar-1',
    type: 'dragdrop',
    moduleType: 'grammar',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'Arrange the words to form a correct Japanese sentence.',
    words: ['私は', '学生', 'です'],
    correctOrder: ['私は', '学生', 'です'],
  },
  {
    id: 'n5-grammar-2',
    type: 'multipleChoice',
    moduleType: 'grammar',
    level: 'N5',
    difficultyLevel: 1,
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
    type: 'dragdrop',
    moduleType: 'grammar',
    level: 'N5',
    difficultyLevel: 1,
    prompt: 'Arrange the words to form a correct Japanese sentence.',
    words: ['を', '食べます', 'ご飯', '私は'],
    correctOrder: ['私は', 'ご飯', 'を', '食べます'],
  },
];

const n5VocabularyQuestions = [
  {
    id: 'n5-vocab-1',
    type: 'multipleChoice',
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
    type: 'multipleChoice',
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
    type: 'multipleChoice',
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

const n5ListeningQuestions = [
  {
    id: 'n5-listening-1',
    type: 'multipleChoice',
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
    type: 'multipleChoice',
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
    type: 'multipleChoice',
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

// Converts camelCase app-shape questions into snake_case DB rows
// (same mapping as questionToRow() in src/api/questionsService.js)
function questionToRow(q) {
  return {
    id: q.id,
    type: q.type,
    module_type: q.moduleType,
    level: q.level,
    difficulty_level: q.difficultyLevel ?? 1,
    prompt: q.prompt,
    words: q.words ?? null,
    correct_order: q.correctOrder ?? null,
    options: q.options ?? null,
    correct_option_id: q.correctOptionId ?? null,
    audio_text: q.audio?.text ?? null,
    audio_lang: q.audio?.lang ?? 'ja-JP',
    display_text: q.displayText ?? null,
  };
}

async function seed() {
  const allQuestions = [
    ...n5GrammarQuestions,
    ...n5VocabularyQuestions,
    ...n5ListeningQuestions,
  ];

  const rows = allQuestions.map(questionToRow);

  console.log(`Seeding ${rows.length} questions...`);

  const { data, error } = await supabase
    .from('questions')
    .upsert(rows, { onConflict: 'id' }) // safe to re-run — won't duplicate
    .select();

  if (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully seeded ${data.length} questions.`);
  process.exit(0);
}

seed();