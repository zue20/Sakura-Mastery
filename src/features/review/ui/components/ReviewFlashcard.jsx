import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, FONTS } from '../../../dashboard/theme';

function resolveCorrectOptionText(question) {
  if (!Array.isArray(question.options) || !question.correctOptionId) return null;
  const opt = question.options.find(
    (o) => o.id === question.correctOptionId || o.value === question.correctOptionId
  );
  if (!opt) return null;
  return opt.text ?? opt.label ?? opt.value ?? null;
}

function getCorrectAnswerText(question) {
  const mcText = resolveCorrectOptionText(question);
  if (mcText) return mcText;
  if (Array.isArray(question.correctOrder) && question.correctOrder.length) {
    return question.correctOrder.join(question.words ? ' ' : '');
  }
  if (question.translation) return question.translation;
  if (question.data?.character) {
    const reading = question.data.reading ? ` (${question.data.reading})` : '';
    const meaning = question.data.meaning ? ` — ${question.data.meaning}` : '';
    return `${question.data.character}${reading}${meaning}`;
  }
  // Speaking: audio_text column is NULL on many seeded rows — the actual
  // phrase is nested inside data.audio.text instead. Check both so this
  // works regardless of which shape a given row uses (pre- or post-backfill).
  if (question.type === 'speaking') {
    return question.audio?.text ?? question.data?.audio?.text ?? question.displayText ?? null;
  }
  return null; // caller shows an honest "no stored answer" message, not a cheerful placeholder
}

export default function ReviewFlashcard({ question, flipped, onFlip, onMastered }) {
  // Same NULL-column issue applies to audio playback, not just the answer
  // text — check both possible locations for the speakable phrase.
  const speakingAudioText = question.audio?.text ?? question.data?.audio?.text ?? null;
  const speakingAudioLang = question.audio?.lang ?? question.data?.audio?.lang ?? 'ja-JP';
  const hasSpeakableAudio = !!speakingAudioText;

  const correctAnswer = getCorrectAnswerText(question);

  const playAudio = useCallback(() => {
    if (!speakingAudioText) return;
    Speech.speak(speakingAudioText, {
      language: speakingAudioLang,
      rate: 0.85,
      volume: 1.0,
      pitch: 1.0,
    });
  }, [speakingAudioText, speakingAudioLang]);

  return (
    <TouchableOpacity style={styles.card} onPress={onFlip} activeOpacity={0.9}>
      {!flipped ? (
        <View style={styles.face}>
          <Text style={styles.hint}>Tap to see answer</Text>

          {hasSpeakableAudio && (
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={(e) => { e.stopPropagation?.(); playAudio(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.audioBtnText}>🔊 Play Audio</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.prompt}>{question.prompt}</Text>
          {question.displayText ? (
            <Text style={styles.displayText}>{question.displayText}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.face}>
          <Text style={styles.answerLabel}>Correct Answer</Text>
          <Text style={styles.answerText}>
            {correctAnswer ?? "This question doesn't have a stored answer yet."}
          </Text>

          {!!question.explanation && (
            <>
              <Text style={styles.explanationLabel}>Explanation</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </>
          )}

          {hasSpeakableAudio && (
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={(e) => { e.stopPropagation?.(); playAudio(); }}
              activeOpacity={0.85}
            >
              <Text style={styles.audioBtnText}>🔊 Listen Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.masteredBtn}
            onPress={(e) => { e.stopPropagation?.(); onMastered(); }}
            activeOpacity={0.85}
          >
            <Text style={styles.masteredText}>✅ Got it / Mastered</Text>
          </TouchableOpacity>
          <Text style={styles.flipBackHint}>Tap card to flip back</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 280,
    backgroundColor: '#fdf1f5',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(221,166,166,0.5)',
    justifyContent: 'center',
  },
  face: { alignItems: 'center' },
  hint: { fontSize: 11, color: COLORS.inkSoft, marginBottom: 12 },
  audioBtn: {
    backgroundColor: '#d099a2',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  audioBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  prompt: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.plum,
    textAlign: 'center',
    lineHeight: 30,
  },
  displayText: { fontSize: 15, color: COLORS.ink, marginTop: 10, textAlign: 'center' },
  answerLabel: { fontSize: 11, color: COLORS.inkSoft, marginBottom: 6, fontWeight: '600' },
  answerText: {
    fontSize: 18,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 14,
    fontWeight: '600',
  },
  explanationLabel: { fontSize: 10, color: COLORS.inkSoft, marginBottom: 4, fontWeight: '700', textTransform: 'uppercase' },
  explanationText: {
    fontSize: 13,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  masteredBtn: {
    backgroundColor: COLORS.bambooGreen ?? '#4C8C6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 4,
  },
  masteredText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  flipBackHint: { fontSize: 10, color: COLORS.inkSoft, marginTop: 12 },
});