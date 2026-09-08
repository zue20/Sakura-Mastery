import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';

export default function WritingOrQuizChooserScreen({ route, navigation }) {
  const { title, moduleType, level } = route?.params ?? {};

  const goToWriting = () => {
    const target = moduleType === 'basic' ? 'KanaPractice' : 'WritingPractice';
    navigation.navigate(target, { title, moduleType, level });
  };

  const goToQuiz = () =>
    navigation.navigate('Quiz', { title, moduleType, level });

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Choose how you'd like to practice</Text>

      {moduleType === 'basic' && (
        <Pressable
          style={styles.optionBtn}
          onPress={() => navigation.navigate('Phonetics', { title, moduleType, level })}
        >
          <Text style={styles.optionIcon}>あ</Text>
          <Text style={styles.optionLabel}>Phonetics Guide</Text>
          <Text style={styles.optionDesc}>Learn the core pronunciation rules first</Text>
        </Pressable>
      )}

      <Pressable style={styles.optionBtn} onPress={goToWriting}>
        <Text style={styles.optionIcon}>🖌️</Text>
        <Text style={styles.optionLabel}>Practice Writing</Text>
        <Text style={styles.optionDesc}>Trace characters — no hearts, no pressure</Text>
      </Pressable>

      <Pressable style={styles.optionBtn} onPress={goToQuiz}>
        <Text style={styles.optionIcon}>📜</Text>
        <Text style={styles.optionLabel}>Take Quiz</Text>
        <Text style={styles.optionDesc}>Multiple choice — hearts, timer, XP</Text>
      </Pressable>

      <Pressable style={styles.backLink} onPress={() => navigation?.goBack()}>
        <Text style={styles.backLinkText}>← Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20, backgroundColor: '#eebbd0' },
  title: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.deep },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginBottom: 10 },
  optionBtn: {
    width: '100%', maxWidth: 320, alignItems: 'center', gap: 4,
    backgroundColor: COLORS.paperStrong, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(198,93,123,0.3)',
    paddingVertical: 20, paddingHorizontal: 16,
  },
  optionIcon: { fontSize: 28 },
  optionLabel: { fontFamily: FONTS.display, fontSize: 17, color: COLORS.deep, fontWeight: '700' },
  optionDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft },
  backLink: { marginTop: 14, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});