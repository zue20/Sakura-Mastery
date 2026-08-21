import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQuizQuestions, QuizStatus, QuizPhase, QuestionType } from '../hooks/useQuizQuestions';
import { useGamification } from '../hooks/useGamification';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { useQuizSessionQuestions } from '../hooks/useQuizSessionQuestions';
import useAppSettings from '../../admin/hooks/useAppSettings';
import QuizLayout from './QuizLayout';
import OutOfHeartsModal from '../../../components/OutOfHeartsModal';
import HeartsRefillCelebration from '../../../components/HeartsRefillCelebration';
import useAuth from '../../auth/hooks/useAuth';
import { logAttempt } from '../../../api/quizAttemptsService';
import { recordDailyProgress, spendXp, getTotalXp } from '../../../api/dailyProgressService';
import { recordMiss } from '../../../api/missedQuestionsService';

const HEARTS_REFILL_XP_COST = 50;
const DEFAULT_XP_PER_CORRECT_ANSWER = 10; // fallback while settings load or if unset in Supabase

export default function QuizScreen({ route, navigation }) {
  const { title = 'Quiz', moduleType, level, heartsStart = 3, timePerQuestion = 20 } =
    route?.params ?? {};

  const { user } = useAuth();

  const { settings } = useAppSettings();
  const XP_PER_CORRECT_ANSWER = Number(settings?.xp_per_correct) || DEFAULT_XP_PER_CORRECT_ANSWER;

  const { questions } = useQuizSessionQuestions({ moduleType, level });
  const quizQuestions = questions;

  const quiz = useQuizQuestions(quizQuestions);

  const game = useGamification({ heartsStart });
  const hasLoggedRef = React.useRef(false);

  // Live LIFETIME XP (matches the dashboard total), replacing the
  // session-only game.xp for display purposes. Seeded from the real
  // total on load, then bumped optimistically on each correct answer /
  // XP spend so the in-quiz badge always agrees with the dashboard.
  const [liveXp, setLiveXp] = useState(0);

  React.useEffect(() => {
    if (!user?.id) return;
    getTotalXp(user.id)
      .then(setLiveXp)
      .catch((err) => console.warn('Failed to load starting XP:', err.message));
  }, [user?.id]);

  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const [isSpendingXp, setIsSpendingXp] = useState(false);
  const [showRefillCelebration, setShowRefillCelebration] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleTimeout = useCallback(() => {
    if (quiz.awaitingContinue) return; // guard: don't double-submit while feedback is showing
    const wasCorrect = quiz.submit(true);
    if (wasCorrect) {
      setLiveXp((prev) => prev + XP_PER_CORRECT_ANSWER);
    } else {
      game.registerIncorrect();
      if (user?.id && quiz.currentQuestion) {
        recordMiss({
          userId: user.id,
          questionId: quiz.currentQuestion.id,
          moduleType,
          level,
        }).catch(() => {});
      }
    }
  }, [quiz, game, user?.id, moduleType, level, XP_PER_CORRECT_ANSWER]);

  const isSpeakingQuestion = quiz.currentQuestion?.type === QuestionType.SPEAKING;

  const timer = useQuizTimer({
    duration: timePerQuestion,
    isPaused: quiz.awaitingContinue || quiz.status !== QuizStatus.IN_PROGRESS || isSpeakingQuestion,
    resetKey: quiz.currentQuestion?.id,
    onTimeout: handleTimeout,
  });

  React.useEffect(() => {
    if (game.isOutOfHearts && quiz.status === QuizStatus.IN_PROGRESS) {
      quiz.fail();
      setShowOutOfHearts(true);
    }
  }, [game.isOutOfHearts, quiz.status, quiz]);

  // Shared "write this attempt to the DB, once" logic. Pulled out of the
  // effect below so it can ALSO be called from the explicit "give up"
  // path (handleBackToDashboard) — running out of hearts is just a PAUSE
  // (resumable via unfail()), so it must never trigger this on its own.
  const logFinalAttempt = useCallback(() => {
    if (hasLoggedRef.current || !user?.id) return;

    const total = quiz.summary?.total ?? quizQuestions?.length ?? 0;
    if (total === 0) return;

    hasLoggedRef.current = true;

    const mistakes = quiz.summary?.mistakes ?? 0;
    const correct = Math.max(total - mistakes, 0);
    const xpEarned = correct * XP_PER_CORRECT_ANSWER;

    logAttempt({ userId: user.id, level, moduleType, title, correct, total, xpEarned })
      .catch((err) => console.warn('Failed to log quiz attempt:', err.message));

    recordDailyProgress({ userId: user.id, xpEarned, correct, total })
      .catch((err) => console.warn('Failed to record daily progress:', err.message));
  }, [quiz.summary, quizQuestions, user?.id, level, moduleType, title, XP_PER_CORRECT_ANSWER]);

  // Only a GENUINE finish (status === COMPLETED) logs automatically.
  // FAILED (hearts hit 0) is intentionally excluded — that's a resumable
  // pause, not the end of the attempt. See logFinalAttempt / handleBackToDashboard.
  React.useEffect(() => {
    const isTerminal = quiz.status === QuizStatus.COMPLETED;
    const questionsGenuinelyLoaded = quiz.phase === QuizPhase.READY;
    if (!isTerminal || !questionsGenuinelyLoaded) return;
    logFinalAttempt();
  }, [quiz.status, quiz.phase, logFinalAttempt]);

  const handleSubmit = useCallback(() => {
    const wasCorrect = quiz.submit(false);
    if (wasCorrect) {
      game.registerCorrect();
      setLiveXp((prev) => prev + XP_PER_CORRECT_ANSWER);
    } else {
      game.registerIncorrect();
      if (user?.id && quiz.currentQuestion) {
        recordMiss({
          userId: user.id,
          questionId: quiz.currentQuestion.id,
          moduleType,
          level,
        }).catch(() => {});
      }
    }
  }, [quiz, game, user?.id, moduleType, level, XP_PER_CORRECT_ANSWER]);

  const handleRequestExit = useCallback(() => setShowExitConfirm(true), []);
  const handleCancelExit = useCallback(() => setShowExitConfirm(false), []);
  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  }, [navigation]);

  const handleSpendXpToRefill = useCallback(async () => {
    if (!user?.id || isSpendingXp) return;
    setIsSpendingXp(true);
    try {
      const result = await spendXp({ userId: user.id, amount: HEARTS_REFILL_XP_COST });
      if (!result.success) {
        Alert.alert(
          'Not enough XP',
          `You need ${HEARTS_REFILL_XP_COST} XP to refill hearts. You currently have ${result.currentXp} XP.`
        );
        return;
      }
      setLiveXp(result.remainingXp);
      game.refillHearts();
      quiz.unfail(); // resume the SAME quiz session — no navigation, no practice mode
      setShowOutOfHearts(false);
      setShowRefillCelebration(true);
    } catch (err) {
      Alert.alert("Couldn't refill hearts", err.message ?? 'Please try again.');
    } finally {
      setIsSpendingXp(false);
    }
  }, [user?.id, isSpendingXp, game, quiz]);

  const handleFreeRefill = useCallback(() => {
    game.refillHearts();
    quiz.unfail(); // resume the SAME quiz session — no navigation, no reset
    setShowOutOfHearts(false);
    setShowRefillCelebration(true);
  }, [game, quiz]);

  const handleCelebrationContinue = useCallback(() => {
    setShowRefillCelebration(false);
  }, []);

  // Genuine abandonment: player ran out of hearts and chose NOT to
  // refill. This is the only place a FAILED attempt gets logged.
  const handleBackToDashboard = useCallback(() => {
    logFinalAttempt();
    setShowOutOfHearts(false);
    navigation?.navigate('Dashboard');
  }, [logFinalAttempt, navigation]);

  return (
    <>
      <QuizLayout
        title={title}
        navigation={navigation}
        phase={quiz.phase}
        status={quiz.status}
        hearts={game.hearts}
        heartsStart={game.heartsStart}
        xp={liveXp}
        lastXpGain={game.lastXpGain}
        currentQuestion={quiz.currentQuestion}
        workingAnswer={quiz.workingAnswer}
        currentResult={quiz.currentResult}
        awaitingContinue={quiz.awaitingContinue}
        progress={quiz.progress}
        summary={quiz.summary}
        secondsLeft={timer.secondsLeft}
        timePerQuestion={timePerQuestion}
        canSubmit={quiz.canSubmit}
        onAnswerChange={quiz.setAnswer}
        onSubmit={handleSubmit}
        onContinue={quiz.continueNext}
        onExit={handleConfirmExit}
        onRequestExit={handleRequestExit}
        showExitConfirm={showExitConfirm}
        onConfirmExit={handleConfirmExit}
        onCancelExit={handleCancelExit}
      />
      <OutOfHeartsModal
        visible={showOutOfHearts}
        xpCost={HEARTS_REFILL_XP_COST}
        isSpending={isSpendingXp}
        onSpendXp={handleSpendXpToRefill}
        onFreeRefill={handleFreeRefill}
        onExit={handleBackToDashboard}
      />
      <HeartsRefillCelebration
        visible={showRefillCelebration}
        onContinue={handleCelebrationContinue}
      />
    </>
  );
}