import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { QuestionType, QuizStatus } from '../hooks/useQuizQuestions';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { COLORS } from '../../dashboard/theme';

import HeartsDisplay from './components/HeartsDisplay';
import TimerBar from './components/TimerBar';
import ProgressBar from './components/ProgressBar';
import XpBadge from './components/XpBadge';
import FeedbackBanner from './components/FeedbackBanner';
import DragDropQuiz from './components/DragDropQuiz';
import MultipleChoiceQuiz from './components/MultipleChoiceQuiz';
import QuizCompletionScreen from './components/QuizCompletionScreen';
import QuizExitConfirmModal from './components/QuizExitConfirmModal';
import CanvasWritingQuiz from './components/CanvasWritingQuiz';
import SpeakingQuiz from './components/SpeakingQuiz';
import SpeakingModeChooser from './components/SpeakingModeChooser';
import { quizLayoutStyles as styles } from './constants/quizLayoutStyles';

const fujiImage = require('../../../../assets/fuji.jpg');
const AnswerState = { UNANSWERED: 'unanswered', CORRECT: 'correct', INCORRECT: 'incorrect' };

export default function QuizLayout({
  title,
  phase,
  status,
  mode = 'standard', // 'standard' | 'practice' — practice hides scoring/pressure chrome
  hearts,
  heartsStart,
  xp,
  lastXpGain,
  currentQuestion,
  isRetryQuestion,
  workingAnswer,
  currentResult,
  awaitingContinue,
  progress,
  summary,
  secondsLeft,
  timePerQuestion,
  canSubmit,
  onAnswerChange,
  onSubmit,
  onContinue,
  onExit,
  onRequestExit,
  showExitConfirm,
  onConfirmExit,
  onCancelExit,
  navigation,
}) {
  const { isCompact } = useResponsiveLayout();

  // Which speaking sub-mode the learner has picked for the current question.
  // null = show the chooser, 'quiz' = go straight into QuizMode.
  const [speakingMode, setSpeakingMode] = useState(null);

  // Tracks whether the learner has already picked a speaking mode THIS
  // session. Once they pick Quiz mode, every subsequent speaking question
  // should stay in Quiz mode — the chooser only shows once, not on every
  // question. Without this ref, the effect below would fire on every
  // `currentQuestion.id` change (i.e. every "Continue" click) and reset
  // speakingMode back to null, kicking the learner back to the chooser
  // screen after every single question.
  const hasPickedModeRef = useRef(false);

  useEffect(() => {
    // Only show the chooser the FIRST time a speaking question is hit.
    if (currentQuestion?.type === QuestionType.SPEAKING && !hasPickedModeRef.current) {
      setSpeakingMode(null);
    }
  }, [currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'loading') {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={COLORS.pink} />
        <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading questions…</Text>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Something went wrong loading this quiz. Please try again.</Text>
        <Pressable style={styles.backButton} onPress={onExit}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === 'empty') {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No questions available for this quiz yet.</Text>
        <Pressable style={styles.backButton} onPress={onExit}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const isSpeakingChooser = currentQuestion?.type === QuestionType.SPEAKING && speakingMode === null;
  if (isSpeakingChooser) {
    return (
      <SpeakingModeChooser
        title={title}
        moduleType={currentQuestion.moduleType}
        level={currentQuestion.level}
        navigation={navigation}
        onSelectQuiz={() => {
          hasPickedModeRef.current = true;
          setSpeakingMode('quiz');
        }}
        onExit={onExit}
      />
    );
  }

  if (status === QuizStatus.COMPLETED) {
    return (
      <QuizCompletionScreen summary={summary} xp={xp} isCompact={isCompact} onExit={onExit} />
    );
  }

  return (
    <ImageBackground source={fujiImage} style={styles.background} resizeMode="cover">
      <View style={styles.scrim} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, isCompact && styles.cardCompact]}>
          <View style={styles.topRow}>
            <Pressable style={styles.exitBtn} onPress={onRequestExit}>
              <Text style={styles.exitBtnText}>✕ Exit</Text>
            </Pressable>
            {mode !== 'practice' && (
              <>
                <HeartsDisplay hearts={hearts} heartsStart={heartsStart} />
                <XpBadge xp={xp} />
                <ProgressBar {...progress} />
              </>
            )}
          </View>

          {mode !== 'practice' && !awaitingContinue && currentQuestion.type !== QuestionType.SPEAKING && (
            <TimerBar secondsLeft={secondsLeft} timePerQuestion={timePerQuestion} />
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

          <View style={styles.questionBody}>
            {currentQuestion.type === QuestionType.DRAG_DROP && (
              <DragDropQuiz
                question={currentQuestion}
                workingAnswer={workingAnswer}
                onChange={onAnswerChange}
                disabled={awaitingContinue}
                revealCorrect={awaitingContinue && currentResult === AnswerState.INCORRECT}
              />
            )}
            {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
              <MultipleChoiceQuiz
                question={currentQuestion}
                workingAnswer={workingAnswer}
                onChange={onAnswerChange}
                disabled={awaitingContinue}
                revealCorrect={awaitingContinue && currentResult === AnswerState.INCORRECT}
                isCompact={isCompact}
              />
            )}
            {(currentQuestion.type === QuestionType.KANJI_WRITE || currentQuestion.type === QuestionType.KANA_WRITE) && (
              <CanvasWritingQuiz
                question={currentQuestion}
                workingAnswer={workingAnswer}
                onChange={onAnswerChange}
                disabled={awaitingContinue}
              />
            )}
            {currentQuestion.type === QuestionType.SPEAKING && (
              <SpeakingQuiz
                question={currentQuestion}
                workingAnswer={workingAnswer}
                onChange={onAnswerChange}
                disabled={awaitingContinue}
                mode={speakingMode}
              />
            )}
          </View>

          {awaitingContinue && <FeedbackBanner result={currentResult} lastXpGain={lastXpGain} />}

          <View style={styles.actionsRow}>
            {!awaitingContinue ? (
              <Pressable
                style={[styles.primaryButton, !canSubmit && styles.disabledButton]}
                onPress={onSubmit}
                disabled={!canSubmit}
              >
                <Text style={styles.primaryButtonText}>Check Answer</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.primaryButton} onPress={onContinue}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <QuizExitConfirmModal
        visible={!!showExitConfirm}
        onConfirm={onConfirmExit}
        onCancel={onCancelExit}
      />
    </ImageBackground>
  );
}
