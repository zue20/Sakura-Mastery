import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useFetchQuestions } from '../hooks/useFetchQuestions';
import { useFlashcardDeck } from '../hooks/useFlashcardDeck';
import { buildFlashcardsFromQuestions } from '../utils/buildFlashcards';
import { pickRandomSubset } from '../utils/pickRandomSubset';
import VocabFlashcard from './components/VocabFlashcard';
import CanvasWritingQuiz from './components/CanvasWritingQuiz';
import GrammarPointCard from './components/GrammarPointCard';
import PracticeCompleteScreen from './components/PracticeCompleteScreen';
import { COLORS, FONTS } from '../../dashboard/theme';

const TRANSITION_DELAY_MS = 400;

export default function FlashcardScreen({ route, navigation }) {
  const [sessionKey, setSessionKey] = useState(0);
  const handleRestart = useCallback(() => setSessionKey((k) => k + 1), []);
  return (
    <FlashcardScreenInner
      key={sessionKey}
      route={route}
      navigation={navigation}
      onRestart={handleRestart}
    />
  );
}

function FlashcardScreenInner({ route, navigation, onRestart }) {
  const { title, moduleType, level } = route?.params ?? {};
  const { questions } = useFetchQuestions({ moduleType, level });

  const flashcards = useMemo(() => {
    const allCards = buildFlashcardsFromQuestions(Array.isArray(questions) ? questions : []);

    // Drag-drop word-order cards are a graded interaction (right/wrong
    // order), not a browsing one — they belong only in Quiz Mode via
    // DragDropQuiz, never in ungraded Flashcard/Practice Mode.
    const nonDragdropCards = allCards.filter((card) => card.sourceType !== 'dragdrop');

    if (moduleType === 'basic') {
      return pickRandomSubset(nonDragdropCards, 10, 15);
    }
    return nonDragdropCards;
  }, [questions, moduleType]);

  const deck = useFlashcardDeck(flashcards);
  const [showComplete, setShowComplete] = useState(false);

  const isLockedRef = useRef(false);
  const [, forceRerender] = useState(0);

  const guarded = useCallback((action) => {
    if (isLockedRef.current) return;
    isLockedRef.current = true;
    action();
    setTimeout(() => {
      isLockedRef.current = false;
      forceRerender((n) => n + 1);
    }, TRANSITION_DELAY_MS);
  }, []);

  const handleFlip = useCallback(() => guarded(() => deck.flip(!deck.isFlipped)), [guarded, deck]);
  const handlePrevious = useCallback(() => guarded(() => deck.previous()), [guarded, deck]);
  const handleExit = useCallback(() => navigation?.goBack(), [navigation]);

  const handleNext = useCallback(() => {
    if (deck.isLast) {
      setShowComplete(true);
      return;
    }
    guarded(() => deck.next());
  }, [guarded, deck]);

  if (questions === undefined) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color={COLORS.pink} />
        <Text style={styles.progress}>Loading flashcards…</Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>{title} — Flashcards</Text>
        <Text style={styles.progress}>No flashcards available yet.</Text>
        <Pressable style={styles.backLink} onPress={handleExit}>
          <Text style={styles.backLinkText}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  if (showComplete) {
    return (
      <PracticeCompleteScreen
        total={flashcards.length}
        description={`You've gone through all ${flashcards.length} ${title ?? ''} flashcards.`}
        onRestart={onRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title} — Flashcards</Text>
      <Text style={styles.progress}>{deck.progress.current} / {deck.progress.total}</Text>

      <View style={styles.cardArea}>
        {deck.currentCard && (
          <FlashcardRenderer
            moduleType={moduleType}
            card={deck.currentCard}
            isFlipped={deck.isFlipped}
            onFlip={handleFlip}
          />
        )}
      </View>

      <View style={styles.navRow}>
        <Pressable
          style={[styles.navBtn, deck.isFirst && styles.navBtnDisabled]}
          onPress={handlePrevious}
          disabled={deck.isFirst || isLockedRef.current}
        >
          <Text style={styles.navBtnText}>← Previous</Text>
        </Pressable>
        <Pressable
          style={styles.navBtn}
          onPress={handleNext}
          disabled={isLockedRef.current}
        >
          <Text style={styles.navBtnText}>{deck.isLast ? 'Finish' : 'Next →'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backLink} onPress={handleExit}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>
    </View>
  );
}

function FlashcardRenderer({ moduleType, card, isFlipped, onFlip }) {
  if (moduleType === 'grammar' && card.sourceType === 'grammarPoint') {
    return (
      <GrammarPointCard
        front={card.front}
        back={card.back}
        answer={card.answer}
        explanation={card.explanation}
        translation={card.translation}
        isFlipped={isFlipped}
        onFlip={onFlip}
      />
    );
  }

  if (moduleType === 'basic' && card.sourceType === 'writing') {
    return (
      <CanvasWritingQuiz question={{ data: card.canvasData }} workingAnswer={undefined} onChange={() => {}} disabled={false} />
    );
  }

  return (
    <VocabFlashcard
      front={card.front}
      back={card.back}
      imageUrl={card.imageUrl}
      audio={card.audio}
      isFlipped={isFlipped}
      onFlip={onFlip}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.deep },
  progress: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft },
  cardArea: { width: '100%', maxWidth: 420, alignItems: 'center', gap: 10 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  navBtn: { borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.3)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  backLink: { marginTop: 4, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});