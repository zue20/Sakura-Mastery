import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';
import QuestionTypeSelector from './QuestionTypeSelector';

const QUESTION_TYPES = {
  DRAG_DROP: 'dragdrop',
  MULTIPLE_CHOICE: 'multipleChoice',
  KANJI_WRITE: 'kanjiWrite',
  KANA_WRITE: 'kanaWrite',
  SPEAKING: 'speaking',
};

function emptyDragDropFields() {
  return { words: '', correctOrder: '' };
}

function emptyMultipleChoiceFields() {
  return { options: [{ id: 'a', label: '' }, { id: 'b', label: '' }], correctOptionId: 'a', displayText: '', audioText: '', imageUrl: '' };
}

function emptyWritingFields() {
  return { character: '', reading: '', romaji: '', meaning: '', strokeCount: '' };
}

function emptySpeakingFields() {
  return { targetText: '', romaji: '', translation: '', audioText: '', imageUrl: '' };
}

function questionToFormState(question) {
  if (!question) {
    return {
      id: null,
      type: QUESTION_TYPES.DRAG_DROP,
      prompt: '',
      moduleType: 'grammar',
      level: 'N5',
      difficultyLevel: 1,
      translation: '',
      explanation: '',
      ...emptyDragDropFields(),
    };
  }

  const base = {
    id: question.id,
    type: question.type,
    prompt: question.prompt ?? '',
    moduleType: question.moduleType ?? 'grammar',
    level: question.level ?? 'N5',
    difficultyLevel: question.difficultyLevel ?? 1,
    translation: question.translation ?? '',
    explanation: question.explanation ?? '',
  };

  if (question.type === QUESTION_TYPES.DRAG_DROP) {
    return {
      ...base,
      words: (question.words ?? []).join(', '),
      correctOrder: (question.correctOrder ?? []).join(', '),
    };
  }

  if (question.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return {
      ...base,
      options: question.options ?? emptyMultipleChoiceFields().options,
      correctOptionId: question.correctOptionId ?? 'a',
      displayText: question.displayText ?? '',
      audioText: question.audio?.text ?? '',
      imageUrl: question.imageUrl ?? '',
    };
  }

  if (question.type === QUESTION_TYPES.KANJI_WRITE || question.type === QUESTION_TYPES.KANA_WRITE) {
    return {
      ...base,
      character: question.data?.character ?? '',
      reading: question.data?.reading ?? '',
      romaji: question.data?.romaji ?? '',
      meaning: question.data?.meaning ?? '',
      strokeCount: question.data?.strokeCount ? String(question.data.strokeCount) : '',
    };
  }

  if (question.type === QUESTION_TYPES.SPEAKING) {
    return {
      ...base,
      targetText: question.data?.targetText ?? '',
      romaji: question.data?.romaji ?? '',
      translation2: question.data?.translation ?? '', // speaking's own translation field, distinct from base.translation
      audioText: question.data?.audio?.text ?? '',
      // PracticeMode/QuizMode read `data.imageUrl` (image lives inside the
      // jsonb `data` column for speaking, unlike multipleChoice's top-level
      // `imageUrl`) — fall back to legacy top-level in case any old rows
      // were saved there before this fix.
      imageUrl: question.data?.imageUrl ?? question.imageUrl ?? '',
    };
  }

  return base;
}

function formStateToQuestion(form) {
  const base = {
    id: form.id ?? undefined,
    type: form.type,
    prompt: form.prompt.trim(),
    moduleType: form.moduleType,
    level: form.level,
    difficultyLevel: Number(form.difficultyLevel) || 1,
    translation: form.translation?.trim() || null,
    explanation: form.explanation?.trim() || null,
  };

  if (form.type === QUESTION_TYPES.DRAG_DROP) {
    return {
      ...base,
      words: form.words.split(',').map((w) => w.trim()).filter(Boolean),
      correctOrder: form.correctOrder.split(',').map((w) => w.trim()).filter(Boolean),
    };
  }

  if (form.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return {
      ...base,
      options: form.options.filter((o) => o.label.trim()),
      correctOptionId: form.correctOptionId,
      displayText: form.displayText?.trim() || null,
      audio: form.audioText?.trim() ? { text: form.audioText.trim(), lang: 'ja-JP' } : null,
      imageUrl: form.imageUrl?.trim() || null,
    };
  }

  if (form.type === QUESTION_TYPES.KANJI_WRITE || form.type === QUESTION_TYPES.KANA_WRITE) {
    return {
      ...base,
      data: {
        character: form.character.trim(),
        reading: form.reading?.trim() || undefined,
        romaji: form.romaji?.trim() || undefined,
        meaning: form.meaning?.trim() || undefined,
        strokeCount: form.strokeCount ? Number(form.strokeCount) : undefined,
      },
    };
  }

  if (form.type === QUESTION_TYPES.SPEAKING) {
    return {
      ...base,
      // Image goes inside `data`, not top-level — PracticeMode.jsx and
      // QuizMode.jsx both read `data.imageUrl`, where `data = question.data`.
      data: {
        targetText: form.targetText.trim(),
        romaji: form.romaji?.trim() || undefined,
        translation: form.translation2?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        audio: form.audioText?.trim() ? { text: form.audioText.trim(), lang: 'ja-JP' } : { text: form.targetText.trim(), lang: 'ja-JP' },
      },
    };
  }

  return base;
}

function validate(form) {
  const errors = [];
  if (!form.prompt.trim()) errors.push('Prompt is required.');

  if (form.type === QUESTION_TYPES.DRAG_DROP) {
    const words = form.words.split(',').map((w) => w.trim()).filter(Boolean);
    const correctOrder = form.correctOrder.split(',').map((w) => w.trim()).filter(Boolean);
    if (words.length < 2) errors.push('Add at least 2 words.');
    if (correctOrder.length !== words.length) {
      errors.push('Correct order must use the same words as the word bank (same count).');
    }
  }

  if (form.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    const filled = form.options.filter((o) => o.label.trim());
    if (filled.length < 2) errors.push('Add at least 2 options.');
    if (!filled.some((o) => o.id === form.correctOptionId)) {
      errors.push('Select which option is correct.');
    }
  }

  if (form.type === QUESTION_TYPES.KANJI_WRITE || form.type === QUESTION_TYPES.KANA_WRITE) {
    if (!form.character?.trim()) errors.push('Character is required.');
  }

  if (form.type === QUESTION_TYPES.SPEAKING) {
    if (!form.targetText?.trim()) errors.push('Target phrase is required.');
  }

  return errors;
}

export default function QuestionEditorForm({ question, onSave, onCancel }) {
  const [form, setForm] = useState(() => questionToFormState(question));
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setForm(questionToFormState(question));
    setErrors([]);
  }, [question]);

  const handleTypeChange = useCallback((newType) => {
    setForm((prev) => {
      const shared = {
        id: prev.id,
        type: newType,
        prompt: prev.prompt,
        moduleType: prev.moduleType,
        level: prev.level,
        difficultyLevel: prev.difficultyLevel,
        translation: prev.translation,
        explanation: prev.explanation,
      };
      if (newType === QUESTION_TYPES.DRAG_DROP) return { ...shared, ...emptyDragDropFields() };
      if (newType === QUESTION_TYPES.MULTIPLE_CHOICE) return { ...shared, ...emptyMultipleChoiceFields() };
      if (newType === QUESTION_TYPES.KANJI_WRITE || newType === QUESTION_TYPES.KANA_WRITE) return { ...shared, ...emptyWritingFields() };
      if (newType === QUESTION_TYPES.SPEAKING) return { ...shared, ...emptySpeakingFields() };
      return shared;
    });
  }, []);

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateOption = useCallback((index, label) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], label };
      return { ...prev, options };
    });
  }, []);

  const addOption = useCallback(() => {
    setForm((prev) => {
      const nextId = String.fromCharCode(97 + prev.options.length);
      return { ...prev, options: [...prev.options, { id: nextId, label: '' }] };
    });
  }, []);

  const removeOption = useCallback((index) => {
    setForm((prev) => {
      const options = prev.options.filter((_, i) => i !== index);
      const correctOptionId = options.some((o) => o.id === prev.correctOptionId)
        ? prev.correctOptionId
        : (options[0]?.id ?? 'a');
      return { ...prev, options, correctOptionId };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const validationErrors = validate(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formStateToQuestion(form));
  }, [form, onSave]);

  return (
    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
      <Text style={styles.label}>Question Type</Text>
      <QuestionTypeSelector value={form.type} onChange={handleTypeChange} />

      <Text style={styles.label}>Prompt</Text>
      <TextInput
        style={styles.input}
        value={form.prompt}
        onChangeText={(v) => updateField('prompt', v)}
        placeholder="e.g. Arrange the words to form a correct sentence."
        multiline
      />

      <View style={styles.metaRow}>
        <View style={styles.metaField}>
          <Text style={styles.label}>Module</Text>
          <TextInput style={styles.input} value={form.moduleType} onChangeText={(v) => updateField('moduleType', v)} placeholder="grammar" />
        </View>
        <View style={styles.metaField}>
          <Text style={styles.label}>Level</Text>
          <TextInput style={styles.input} value={form.level} onChangeText={(v) => updateField('level', v)} placeholder="N5" />
        </View>
        <View style={styles.metaField}>
          <Text style={styles.label}>Difficulty</Text>
          <TextInput style={styles.input} value={String(form.difficultyLevel)} onChangeText={(v) => updateField('difficultyLevel', v)} keyboardType="numeric" placeholder="1" />
        </View>
      </View>

      {form.type === QUESTION_TYPES.DRAG_DROP && (
        <>
          <Text style={styles.label}>Word Bank (comma-separated)</Text>
          <TextInput style={styles.input} value={form.words} onChangeText={(v) => updateField('words', v)} placeholder="私は, 学生, です" />
          <Text style={styles.hint}>These are shown to the learner in any order.</Text>

          <Text style={styles.label}>Correct Order (comma-separated)</Text>
          <TextInput style={styles.input} value={form.correctOrder} onChangeText={(v) => updateField('correctOrder', v)} placeholder="私は, 学生, です" />
          <Text style={styles.hint}>Must contain the exact same words as the bank, in the right order.</Text>
        </>
      )}

      {form.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
        <>
          <Text style={styles.label}>Display Text (optional — big word/kanji shown above options)</Text>
          <TextInput style={styles.input} value={form.displayText} onChangeText={(v) => updateField('displayText', v)} placeholder="猫 (ねこ)" />

          <Text style={styles.label}>Audio Text (optional — plays via text-to-speech)</Text>
          <TextInput style={styles.input} value={form.audioText} onChangeText={(v) => updateField('audioText', v)} placeholder="猫" />

          <Text style={styles.label}>Image URL (optional — paste from Assets tab's "Copy URL")</Text>
          <TextInput style={styles.input} value={form.imageUrl} onChangeText={(v) => updateField('imageUrl', v)} placeholder="https://...supabase.co/storage/v1/object/public/vocab-images/market.png" />
          {!!form.imageUrl?.trim() && (
            <Image source={{ uri: form.imageUrl.trim() }} style={styles.imagePreview} resizeMode="cover" />
          )}

          <Text style={styles.label}>Options</Text>
          {form.options.map((opt, index) => (
            <View key={opt.id} style={styles.optionRow}>
              <Pressable
                style={[styles.correctToggle, form.correctOptionId === opt.id && styles.correctToggleActive]}
                onPress={() => updateField('correctOptionId', opt.id)}
              >
                <Text style={styles.correctToggleText}>{form.correctOptionId === opt.id ? '✓' : ''}</Text>
              </Pressable>
              <TextInput
                style={[styles.input, styles.optionInput]}
                value={opt.label}
                onChangeText={(v) => updateOption(index, v)}
                placeholder={`Option ${opt.id.toUpperCase()}`}
              />
              {form.options.length > 2 && (
                <Pressable style={styles.removeOptionBtn} onPress={() => removeOption(index)}>
                  <Text style={styles.removeOptionText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
          <Pressable style={styles.addOptionBtn} onPress={addOption}>
            <Text style={styles.addOptionText}>+ Add Option</Text>
          </Pressable>
          <Text style={styles.hint}>Tap the circle to mark the correct answer.</Text>
        </>
      )}

      {(form.type === QUESTION_TYPES.KANJI_WRITE || form.type === QUESTION_TYPES.KANA_WRITE) && (
        <>
          <Text style={styles.label}>Character</Text>
          <TextInput style={styles.input} value={form.character} onChangeText={(v) => updateField('character', v)} placeholder="川" />

          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.label}>Reading (optional)</Text>
              <TextInput style={styles.input} value={form.reading} onChangeText={(v) => updateField('reading', v)} placeholder="かわ" />
            </View>
            <View style={styles.metaField}>
              <Text style={styles.label}>Romaji</Text>
              <TextInput style={styles.input} value={form.romaji} onChangeText={(v) => updateField('romaji', v)} placeholder="kawa" />
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.label}>Meaning (optional — Kanji only)</Text>
              <TextInput style={styles.input} value={form.meaning} onChangeText={(v) => updateField('meaning', v)} placeholder="river" />
            </View>
            <View style={styles.metaField}>
              <Text style={styles.label}>Stroke Count</Text>
              <TextInput style={styles.input} value={form.strokeCount} onChangeText={(v) => updateField('strokeCount', v)} keyboardType="numeric" placeholder="3" />
            </View>
          </View>
          <Text style={styles.hint}>Used for the tracing canvas and stroke-count check.</Text>
        </>
      )}

      {form.type === QUESTION_TYPES.SPEAKING && (
        <>
          <Text style={styles.label}>Target Phrase</Text>
          <TextInput style={styles.input} value={form.targetText} onChangeText={(v) => updateField('targetText', v)} placeholder="おはようございます" />

          <View style={styles.metaRow}>
            <View style={styles.metaField}>
              <Text style={styles.label}>Romaji</Text>
              <TextInput style={styles.input} value={form.romaji} onChangeText={(v) => updateField('romaji', v)} placeholder="ohayou gozaimasu" />
            </View>
            <View style={styles.metaField}>
              <Text style={styles.label}>Translation</Text>
              <TextInput style={styles.input} value={form.translation2} onChangeText={(v) => updateField('translation2', v)} placeholder="Good morning" />
            </View>
          </View>
          <Text style={styles.hint}>Audio plays the target phrase automatically — no separate audio field needed.</Text>

          <Text style={styles.label}>Image URL (optional — paste from Assets tab's "Copy URL")</Text>
          <TextInput style={styles.input} value={form.imageUrl} onChangeText={(v) => updateField('imageUrl', v)} placeholder="https://...supabase.co/storage/v1/object/public/speaking-images/scene.png" />
          {!!form.imageUrl?.trim() && (
            <Image source={{ uri: form.imageUrl.trim() }} style={styles.imagePreview} resizeMode="cover" />
          )}
        </>
      )}

      <Text style={styles.label}>Translation (optional — for flashcard back)</Text>
      <TextInput
        style={styles.input}
        value={form.translation}
        onChangeText={(v) => updateField('translation', v)}
        placeholder="I am a student."
      />
      <Text style={styles.hint}>Shown on Grammar flashcards, below the answer.</Text>

      <Text style={styles.label}>Explanation (optional — grammar point notes)</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={form.explanation}
        onChangeText={(v) => updateField('explanation', v)}
        placeholder="は (wa) marks the topic of the sentence."
        multiline
      />
      <Text style={styles.hint}>Shown in italics on Grammar flashcards.</Text>

      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {errors.map((err, i) => (
            <Text key={i} style={styles.errorText}>• {err}</Text>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveText}>{form.id ? 'Save Changes' : 'Add Question'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1 },
  formContent: { gap: 6, paddingBottom: 30 },

  label: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum, marginTop: 12, marginBottom: 4 },
  hint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.ink,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },

  imagePreview: { width: 140, height: 140, borderRadius: 10, marginTop: 8, marginBottom: 4, backgroundColor: 'rgba(0,0,0,0.05)' },

  metaRow: { flexDirection: 'row', gap: 10 },
  metaField: { flex: 1 },

  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  optionInput: { flex: 1 },
  correctToggle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  correctToggleActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  correctToggleText: { color: '#fff', fontWeight: '700' },
  removeOptionBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeOptionText: { color: COLORS.error, fontWeight: '700' },

  addOptionBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.blush, marginTop: 4 },
  addOptionText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '700', color: COLORS.plum },

  errorBox: { backgroundColor: 'rgba(192,57,43,0.1)', borderRadius: 10, padding: 12, marginTop: 14 },
  errorText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.error },

  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(198,93,123,0.3)' },
  cancelText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.inkSoft },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: COLORS.pink },
  saveText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: COLORS.inkBold },
});