import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function PracticeCompleteScreen({ total, description, onRestart, onExit }) {
  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>🌸</Text>
      <Text style={styles.title}>Practice Complete!</Text>
      <Text style={styles.subtitle}>
        {description ?? `You've gone through all ${total} questions.`}
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={onRestart}>
          <Text style={styles.primaryBtnText}>↺ Practice Again</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onExit}>
          <Text style={styles.secondaryBtnText}>← Back to Dashboard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: COLORS.bg },
  emoji: { fontSize: 48 },
  title: { fontFamily: FONTS.display, fontSize: 24, fontWeight: '700', color: COLORS.deep, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', maxWidth: 320 },
  actions: { marginTop: 16, alignItems: 'center', gap: 10 },
  primaryBtn: { backgroundColor: COLORS.actionPink ?? COLORS.pink, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 32 },
  primaryBtnText: { fontFamily: FONTS.display, fontSize: 15, fontWeight: '700', color: COLORS.inkBold },
  secondaryBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  secondaryBtnText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});