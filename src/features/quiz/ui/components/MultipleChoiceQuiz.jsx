import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';
import AudioPlayerButton from './AudioPlayerButton';

export default function MultipleChoiceQuiz({ question, workingAnswer, onChange, disabled, revealCorrect, isCompact }) {
  const hasAudio = !!question.audio;
  const hasDisplayText = !!question.displayText;
  const hasImage = !!question.imageUrl;

  return (
    <View>
      {(hasAudio || hasDisplayText || hasImage) && (
        <View style={[styles.audioPromptCard, isCompact && styles.audioPromptCardCompact]}>
          {hasImage && (
            <Image
              source={{ uri: question.imageUrl }}
              style={[styles.quizImage, isCompact && styles.quizImageCompact]}
              resizeMode="contain"
            />
          )}
          {hasDisplayText && (
            <Text style={[styles.displayText, isCompact && styles.displayTextCompact]}>
              {question.displayText}
            </Text>
          )}
          {hasAudio && (
            <AudioPlayerButton
              text={question.audio.text}
              lang={question.audio.lang}
              size={isCompact ? 'compact' : 'default'}
            />
          )}
        </View>
      )}

      <View style={styles.optionsWrap}>
        {question.options.map((option) => {
          const isSelected = workingAnswer === option.id;
          const isCorrectOption = option.id === question.correctOptionId;
          const showAsCorrect = revealCorrect && isCorrectOption;
          const showAsWrong = revealCorrect && isSelected && !isCorrectOption;

          return (
            <Pressable
              key={option.id}
              onPress={() => !disabled && onChange(option.id)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.optionCard,
                isSelected && !revealCorrect && styles.optionCardSelected,
                showAsCorrect && styles.optionCardCorrect,
                showAsWrong && styles.optionCardWrong,
                disabled && !revealCorrect && styles.optionDisabled,
                pressed && !disabled && styles.optionPressed,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && !revealCorrect && styles.optionTextSelected,
                  (showAsCorrect || showAsWrong) && styles.optionTextRevealed,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioPromptCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(198,93,123,0.25)',
    borderStyle: 'dashed',
    paddingVertical: 16,
    marginBottom: 14,
  },
  audioPromptCardCompact: { paddingVertical: 12, gap: 8, marginBottom: 10 },
  displayText: { fontFamily: FONTS.display, fontSize: 36, color: COLORS.deep, textAlign: 'center' },
  displayTextCompact: { fontSize: 28 },
  quizImage: { width: 130, height: 130, borderRadius: 14 },
  quizImageCompact: { width: 100, height: 100 },

  optionsWrap: { gap: 12 },
  optionCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.25)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, ...Platform.select({ web: { cursor: 'pointer', userSelect: 'none' } }) },
  optionCardSelected: { borderColor: COLORS.pink, backgroundColor: COLORS.blush },
  optionCardCorrect: { borderColor: COLORS.success, backgroundColor: 'rgba(127,169,138,0.18)' },
  optionCardWrong: { borderColor: COLORS.error, backgroundColor: 'rgba(192,57,43,0.1)' },
  optionDisabled: { opacity: 0.55, ...Platform.select({ web: { cursor: 'not-allowed' } }) },
  optionPressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  optionText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.ink },
  optionTextSelected: { fontWeight: '700', color: COLORS.plum },
  optionTextRevealed: { fontWeight: '700' },
});