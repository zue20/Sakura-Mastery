import React from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';
import ConfettiBurst from './ConfettiBurst';
import { quizLayoutStyles as shared } from '../constants/quizLayoutStyles';

const fujiImage = require('../../../../../assets/fuji.jpg');

export default function QuizCompletionScreen({ summary, xp, isCompact, onExit }) {
  const isPerfect = summary.mistakes === 0;
  const celebrationEmoji = isPerfect ? '🌟🎌🌸' : '🌸🎉';

  return (
    <ImageBackground source={fujiImage} style={shared.background} resizeMode="cover">
      <View style={shared.scrim} />
      <ConfettiBurst trigger={true} />
      <View style={shared.centerWrap}>
        <View style={[shared.card, styles.completionCard, isCompact && shared.cardCompact]}>
          <Text style={styles.emojiRow}>{celebrationEmoji}</Text>
          <Text style={styles.title}>{isPerfect ? 'Perfect Lesson!' : 'Lesson Complete!'}</Text>
          <Text style={styles.subtitle}>
            {isPerfect ? '完璧です！ Flawless run 🎉' : 'よくできました！ Well done'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{summary.total}</Text>
              <Text style={styles.statLabel}>questions</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{summary.mistakes}</Text>
              <Text style={styles.statLabel}>mistake{summary.mistakes === 1 ? '' : 's'}</Text>
            </View>
            <View style={[styles.statChip, styles.statChipXp]}>
              <Text style={[styles.statValue, styles.statValueXp]}>+{xp}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </View>

          <Pressable style={shared.primaryButton} onPress={onExit}>
            <Text style={shared.primaryButtonText}>🏠 Back to Dashboard</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  completionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.paperCream ?? COLORS.paperStrong,
    borderColor: 'rgba(188,41,52,0.15)',
  },
  emojiRow: { fontSize: 48, marginBottom: 8, letterSpacing: 4 },
  title: { fontFamily: FONTS.display, fontSize: 26, fontWeight: '700', color: COLORS.deep, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', marginBottom: 22 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  statChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,183,197,0.28)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 84,
  },
  statChipXp: { backgroundColor: 'rgba(106,154,106,0.18)' },
  statValue: { fontFamily: FONTS.display, fontSize: 20, fontWeight: '800', color: COLORS.deep },
  statValueXp: { color: COLORS.bambooGreen ?? COLORS.success },
  statLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.inkSoft, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
});