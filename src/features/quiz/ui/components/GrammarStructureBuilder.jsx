import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

/**
 * Practice-only sentence builder for Learn mode. No scoring, no hearts —
 * just tap-to-arrange, with a reveal button to check the correct order.
 */
export default function GrammarStructureBuilder({ prompt, words, correctOrder }) {
  const [placed, setPlaced] = useState([]);
  const [revealed, setRevealed] = useState(false);

  function isWordConsumed(word, idx, allWords, placedWords) {
    const before = allWords.slice(0, idx).filter((w) => w === word).length;
    const placedCount = placedWords.filter((w) => w === word).length;
    return placedCount > before;
  }

  const remaining = words.filter((word, idx) => !isWordConsumed(word, idx, words, placed));

  const handlePick = useCallback((word) => {
    if (revealed || placed.length >= correctOrder.length) return;
    setPlaced((prev) => [...prev, word]);
  }, [revealed, placed, correctOrder]);

  const handleRemove = useCallback((index) => {
    if (revealed) return;
    setPlaced((prev) => prev.filter((_, i) => i !== index));
  }, [revealed]);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleReset = useCallback(() => {
    setPlaced([]);
    setRevealed(false);
  }, []);

  const isCorrectSoFar = placed.every((w, i) => w === correctOrder[i]);
  const displaySlots = revealed ? correctOrder : placed;

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{prompt}</Text>

      {!revealed && (
        <View style={styles.wordBank}>
          {remaining.map((word, i) => (
            <Pressable key={`${word}-${i}`} style={styles.chip} onPress={() => handlePick(word)}>
              <Text style={styles.chipText}>{word}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.slotsRow}>
        {Array.from({ length: correctOrder.length }).map((_, i) => {
          const word = displaySlots[i];
          return (
            <Pressable
              key={i}
              style={[
                styles.slot,
                revealed && styles.slotRevealed,
                word && !revealed && !isCorrectSoFar && styles.slotWrong,
              ]}
              disabled={revealed || !word}
              onPress={() => handleRemove(i)}
            >
              {word ? <Text style={styles.slotText}>{word}</Text> : <View style={styles.slotDash} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryBtn} onPress={handleReset}>
          <Text style={styles.secondaryBtnText}>↺ Reset</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={handleReveal} disabled={revealed}>
          <Text style={styles.primaryBtnText}>{revealed ? '✓ Revealed' : 'Show Answer'}</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>Practice mode — arrange freely, no hearts lost here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
  prompt: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 16 },

  wordBank: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 18 },
  chip: { backgroundColor: COLORS.blush, borderWidth: 1, borderColor: 'rgba(198,93,123,0.3)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18 },
  chipText: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.plum },

  slotsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  slot: {
    minWidth: 64, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.35)',
    borderStyle: 'dashed', backgroundColor: 'rgba(246,201,208,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  slotRevealed: { borderStyle: 'solid', borderColor: COLORS.success, backgroundColor: 'rgba(127,169,138,0.18)' },
  slotWrong: { borderColor: 'rgba(198,93,123,0.5)' },
  slotText: { fontFamily: FONTS.body, fontSize: 15, fontWeight: '700', color: COLORS.plum },
  slotDash: { width: 18, height: 2, backgroundColor: 'rgba(198,93,123,0.3)', borderRadius: 1 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.3)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 },
  secondaryBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  primaryBtn: { backgroundColor: COLORS.pink, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 18 },
  primaryBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: COLORS.inkBold },

  hint: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, marginTop: 10 },
});