import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function SpeakingModeChooser({ title, moduleType, level, navigation, onSelectQuiz, onExit }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Choose how you'd like to practice</Text>

      <Pressable
        style={styles.optionBtn}
        onPress={() => navigation.navigate('SpeakingPractice', { title, moduleType, level })}
      >
        <Text style={styles.optionIcon}>🗣️</Text>
        <Text style={styles.optionLabel}>Practice Speaking</Text>
        <Text style={styles.optionDesc}>Listen, repeat, and record freely — no timer, no pressure.</Text>
      </Pressable>

      <Pressable style={styles.optionBtn} onPress={onSelectQuiz}>
        <Text style={styles.optionIcon}>🎯</Text>
        <Text style={styles.optionLabel}>Take the Quiz</Text>
        <Text style={styles.optionDesc}>Timed, graded, and worth hearts + XP.</Text>
      </Pressable>

      <Pressable style={styles.backLink} onPress={onExit}>
        <Text style={styles.backLinkText}>← Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20, backgroundColor: '#f9a3c788' },
  title: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.deep, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginBottom: 10, textAlign: 'center' },
  optionBtn: {
    width: '100%', maxWidth: 320, alignItems: 'center', gap: 4,
    backgroundColor: COLORS.paperStrong, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(198,93,123,0.3)',
    paddingVertical: 20, paddingHorizontal: 16,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  optionIcon: { fontSize: 28 },
  optionLabel: { fontFamily: FONTS.display, fontSize: 17, color: COLORS.deep, fontWeight: '700' },
  optionDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, textAlign: 'center' },
  backLink: { marginTop: 14, paddingVertical: 6, paddingHorizontal: 10, ...Platform.select({ web: { cursor: 'pointer' } }) },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});