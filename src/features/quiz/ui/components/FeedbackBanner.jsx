import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnswerState } from '../../hooks/useQuizQuestions';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function FeedbackBanner({ result, lastXpGain }) {
  const isCorrect = result === AnswerState.CORRECT;
  return (
    <View style={[styles.banner, isCorrect ? styles.correct : styles.incorrect]}>
      <Text style={styles.text}>
        {isCorrect
          ? `✅ Correct! よくできました！ +${lastXpGain} XP`
          : "❌ Not quite — here's the right answer."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 12, padding: 12, marginTop: 8, marginBottom: 4 },
  correct: { backgroundColor: 'rgba(127,169,138,0.15)' },
  incorrect: { backgroundColor: 'rgba(192,57,43,0.1)' },
  text: { fontFamily: FONTS.body, fontSize: 14, textAlign: 'center', color: COLORS.inkBold },
});