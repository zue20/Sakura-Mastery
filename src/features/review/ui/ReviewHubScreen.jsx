import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, FONTS } from '../../dashboard/theme';
import useAuth from '../../auth/hooks/useAuth';
import { getAllMistakes, clearMistakes } from '../../../api/missedQuestionsService';
import { questionsService } from '../../../api/questionsService';
import { categorizeMistake, ReviewCategory } from '../utils/categorizeQuestion';
import ReviewCategoryTabs from './components/ReviewCategoryTabs';
import ReviewFlashcard from './components/ReviewFlashcard';

export default function ReviewHubScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(ReviewCategory.VOCAB_GRAMMAR);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const loadMistakes = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getAllMistakes(user.id);
      const questions = await Promise.all(
        rows.map((row) => questionsService.getById(row.question_id).catch(() => null))
      );

      const joined = rows
        .map((row, i) => {
          const question = questions[i];
          if (!question) return null; // question was deleted since being missed
          // Category comes from the row's own module_type, not the
          // question's internal type — see categorizeQuestion.js.
          return { question, missedAt: row.missed_at, category: categorizeMistake(row.module_type) };
        })
        .filter(Boolean);

      setItems(joined);
    } catch (err) {
      setError(err.message ?? 'Failed to load mistakes.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMistakes();
  }, [loadMistakes]);

  const counts = useMemo(() => {
    const c = {
      [ReviewCategory.VOCAB_GRAMMAR]: 0,
      [ReviewCategory.LISTENING]: 0,
      [ReviewCategory.KANJI_KANA]: 0,
      [ReviewCategory.SPEAKING]: 0,
    };
    items.forEach((item) => { c[item.category] += 1; });
    return c;
  }, [items]);

  const activeItems = useMemo(
    () => items.filter((item) => item.category === activeCategory),
    [items, activeCategory]
  );

  const handleChangeCategory = useCallback((cat) => {
    Speech.stop();
    setActiveCategory(cat);
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleMastered = useCallback(async () => {
    const current = activeItems[cardIndex];
    if (!current || !user?.id) return;

    Speech.stop();
    setItems((prev) => prev.filter((item) => item.question.id !== current.question.id));
    setFlipped(false);

    clearMistakes({ userId: user.id, questionIds: [current.question.id] }).catch((err) => {
      console.warn('Failed to clear mistake:', err.message);
    });
  }, [activeItems, cardIndex, user?.id]);

  const goPrev = useCallback(() => {
    Speech.stop();
    setFlipped(false);
    setCardIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    Speech.stop();
    setFlipped(false);
    setCardIndex((i) => Math.min(activeItems.length - 1, i + 1));
  }, [activeItems.length]);

  useEffect(() => {
    if (cardIndex >= activeItems.length && activeItems.length > 0) {
      setCardIndex(activeItems.length - 1);
    }
  }, [activeItems.length, cardIndex]);

  useEffect(() => () => Speech.stop(), []);

  const currentItem = activeItems[cardIndex] ?? null;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={10}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Hub</Text>
        <View style={{ width: 44 }} />
      </View>

      <ReviewCategoryTabs activeCategory={activeCategory} onChange={handleChangeCategory} counts={counts} />

      <View style={styles.body}>
        {loading && <ActivityIndicator color="#A13B4A" style={{ marginTop: 40 }} />}

        {!loading && error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadMistakes}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && activeItems.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyText}>No mistakes here — nice work!</Text>
          </View>
        )}

        {!loading && !error && currentItem && (
          <>
            <Text style={styles.progressText}>
              {cardIndex + 1} / {activeItems.length}
            </Text>

            <ReviewFlashcard
              question={currentItem.question}
              flipped={flipped}
              onFlip={handleFlip}
              onMastered={handleMastered}
            />

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navBtn, cardIndex === 0 && styles.navBtnDisabled]}
                onPress={goPrev}
                disabled={cardIndex === 0}
              >
                <Text style={styles.navText}>‹ Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navBtn, cardIndex >= activeItems.length - 1 && styles.navBtnDisabled]}
                onPress={goNext}
                disabled={cardIndex >= activeItems.length - 1}
              >
                <Text style={styles.navText}>Next ›</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7d0c8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backText: { fontSize: 15, color: COLORS.plum, fontWeight: '600', width: 44 },
  headerTitle: { fontFamily: FONTS.display, fontSize: 18, color: COLORS.plum },
  body: { flex: 1, padding: 16 },
  centerBox: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: COLORS.inkSoft },
  errorText: { fontSize: 13, color: '#A13B4A', textAlign: 'center' },
  retryBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#A13B4A' },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  progressText: { textAlign: 'center', fontSize: 12, color: COLORS.inkSoft, marginBottom: 10 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, backgroundColor: '#f6e9ee' },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: 13, fontWeight: '600', color: COLORS.plum },
});