import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../dashboard/theme';

export default function StudyModeChooserScreen({ route, navigation }) {
  const {
    title,
    moduleType,
    level,
    practiceRoute = 'Flashcards',
    practiceIcon = '🏯',
    practiceLabel = 'Practice',
    practiceDesc = "Flashcards — no hearts, no pressure",
  } = route?.params ?? {};

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Choose how you'd like to practice</Text>

      <Pressable
        style={styles.optionCard}
        onPress={() => navigation.navigate(practiceRoute, { title, moduleType, level })}
      >
        <Text style={styles.optionIcon}>{practiceIcon}</Text>
        <Text style={styles.optionTitle}>{practiceLabel}</Text>
        <Text style={styles.optionDesc}>{practiceDesc}</Text>
      </Pressable>

      <Pressable
        style={styles.optionCard}
        onPress={() => navigation.navigate('Quiz', { title, moduleType, level })}
      >
        <Text style={styles.optionIcon}>⛩️</Text>
        <Text style={styles.optionTitle}>Take Quiz</Text>
        <Text style={styles.optionDesc}>Multiple choice — hearts, timer, XP</Text>
      </Pressable>

      <Pressable style={styles.backLink} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.backLinkText}>← Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, backgroundColor: '#f9a3c788', },
  title: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.deep },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft, marginBottom: 8 },
  optionCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.paperStrong,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.3)',
    padding: 24,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  optionIcon: { fontSize: 30 },
  optionTitle: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.deep, fontWeight: '700' },
  optionDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.inkSoft, textAlign: 'center' },
  backLink: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});