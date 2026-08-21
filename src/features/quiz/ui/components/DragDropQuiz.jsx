import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';
import WordChip from './WordChip';

function isWordConsumed(word, idx, allWords, placedWords) {
  const before = allWords.slice(0, idx).filter((w) => w === word).length;
  const placedCount = placedWords.filter((w) => w === word).length;
  return placedCount > before;
}

export default function DragDropQuiz({ question, workingAnswer, onChange, disabled, revealCorrect }) {
  const placed = workingAnswer ?? [];

  const remaining = question.words.filter(
    (word, idx) => !isWordConsumed(word, idx, question.words, placed)
  );

  function handlePickFromBank(word) {
    if (disabled) return;
    if (placed.length >= question.correctOrder.length) return;
    onChange([...placed, word]);
  }

  function handleRemoveFromSlot(index) {
    if (disabled) return;
    const next = [...placed];
    next.splice(index, 1);
    onChange(next);
  }

  const slotCount = question.correctOrder.length;
  const displaySlots = revealCorrect ? question.correctOrder : placed;

  return (
    <View>
      {!revealCorrect && (
        <View style={styles.wordBank}>
          {remaining.map((word, i) => (
            <WordChip key={`${word}-${i}`} label={word} disabled={disabled} onPress={() => handlePickFromBank(word)} />
          ))}
        </View>
      )}

      <View style={styles.slotsCard}>
        <View style={styles.slotsRow}>
          {Array.from({ length: slotCount }).map((_, i) => {
            const word = displaySlots[i];
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.slot,
                  revealCorrect && styles.slotRevealed,
                  pressed && !!word && !disabled && !revealCorrect && styles.slotPressed,
                ]}
                disabled={disabled || !word || revealCorrect}
                onPress={() => handleRemoveFromSlot(i)}
              >
                {word ? (
                  <Text style={[styles.slotText, revealCorrect && styles.slotTextRevealed]}>{word}</Text>
                ) : (
                  <View style={styles.slotEmptyDash} />
                )}
              </Pressable>
            );
          })}
        </View>
        {!revealCorrect && (
          <Text style={styles.slotsHint}>
            {placed.length === 0 ? 'Tap a word above to place it here.' : 'Tap a placed word to remove it.'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  slotsCard: { backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.25)', borderStyle: 'dashed', padding: 16, alignItems: 'center' },
  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 10 },
  slot: { minWidth: 72, height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.35)', borderStyle: 'dashed', backgroundColor: 'rgba(246,201,208,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, ...Platform.select({ web: { cursor: 'pointer', userSelect: 'none' } }) },
  slotRevealed: { borderStyle: 'solid', borderColor: COLORS.success, backgroundColor: 'rgba(127,169,138,0.18)' },
  slotPressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  slotText: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.plum },
  slotTextRevealed: { color: COLORS.success },
  slotEmptyDash: { width: 20, height: 2, backgroundColor: 'rgba(198,93,123,0.3)', borderRadius: 1 },
  slotsHint: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, marginTop: 4 },
});