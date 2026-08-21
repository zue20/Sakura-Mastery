import { supabase } from './supabaseClient';

function rowToQuestion(row) {
  const question = {
    id: row.id,
    type: row.type,
    moduleType: row.module_type,
    level: row.level,
    difficultyLevel: row.difficulty_level,
    prompt: row.prompt,
    createdAt: row.created_at,
  };

  if (row.words) question.words = row.words;
  if (row.correct_order) question.correctOrder = row.correct_order;
  if (row.options) question.options = row.options;
  if (row.correct_option_id) question.correctOptionId = row.correct_option_id;
  if (row.audio_text) question.audio = { text: row.audio_text, lang: row.audio_lang ?? 'ja-JP' };
  if (row.display_text) question.displayText = row.display_text;
  if (row.image_url) question.imageUrl = row.image_url;
  if (row.data) question.data = row.data;
  if (row.translation) question.translation = row.translation;
  if (row.explanation) question.explanation = row.explanation;

  return question;
}

function questionToRow(question) {
  return {
    id: question.id,
    type: question.type,
    module_type: question.moduleType,
    level: question.level,
    difficulty_level: question.difficultyLevel ?? 1,
    prompt: question.prompt,
    words: question.words ?? null,
    correct_order: question.correctOrder ?? null,
    options: question.options ?? null,
    correct_option_id: question.correctOptionId ?? null,
    audio_text: question.audio?.text ?? null,
    audio_lang: question.audio?.lang ?? 'ja-JP',
    display_text: question.displayText ?? null,
    image_url: question.imageUrl ?? null,
    data: question.data ?? null,
    translation: question.translation ?? null,
    explanation: question.explanation ?? null,
    updated_at: new Date().toISOString(),
  };
}

export const questionsService = {
  async getAll({ moduleType, level } = {}) {
    let query = supabase.from('questions').select('*');

    if (moduleType) query = query.eq('module_type', moduleType);
    if (level) query = query.eq('level', level);

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(rowToQuestion);
  },

  async getById(id) {
    const { data, error } = await supabase.from('questions').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return rowToQuestion(data);
  },

  async create(questionData) {
    const id = questionData.id || `${questionData.moduleType}-${Date.now()}`;
    const row = questionToRow({ ...questionData, id });

    const { data, error } = await supabase.from('questions').insert(row).select().single();
    if (error) throw error;
    return rowToQuestion(data);
  },

  async update(id, updates) {
    const row = questionToRow({ ...updates, id });
    delete row.id;

    const { data, error } = await supabase.from('questions').update(row).eq('id', id).select().single();
    if (error) throw error;
    return rowToQuestion(data);
  },

  async delete(id) {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};