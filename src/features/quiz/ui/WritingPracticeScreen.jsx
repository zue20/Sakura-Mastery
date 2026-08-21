import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFetchQuestions } from '../hooks/useFetchQuestions';
import { filterForWritingPractice } from '../utils/filterQuestionsByMode';
import CanvasWritingQuiz from './components/CanvasWritingQuiz';
import PracticeCompleteScreen from './components/PracticeCompleteScreen';
import { COLORS, FONTS } from '../../dashboard/theme';

export default function WritingPracticeScreen({ route, navigation }) {
  const [sessionKey, setSessionKey] = useState(0);
  const handleRestart = useCallback(() => setSessionKey((k) => k + 1), []);
  return (
    <WritingPracticeScreenInner
      key={sessionKey}
      route={route}
      navigation={navigation}
      onRestart={handleRestart}
    />
  );
}

function WritingPracticeScreenInner({ route, navigation, onRestart }) {
  const { title, moduleType, level } = route?.params ?? {};
  const { questions } = useFetchQuestions({ moduleType, level });

  const writingQuestions = useMemo(
    () => filterForWritingPractice(Array.isArray(questions) ? questions : []),
    [questions]
  );

  const [index, setIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const current = writingQuestions[index] ?? null;
  const isFirst = index === 0;
  const isLast = index === writingQuestions.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      setShowComplete(true);
      return;
    }
    setIndex((i) => Math.min(i + 1, writingQuestions.length - 1));
  }, [isLast, writingQuestions.length]);
  const previous = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const handleExit = useCallback(() => navigation?.goBack(), [navigation]);

  if (questions === undefined) {
    return (
      <View style={styles.centerRoot}>
        <ActivityIndicator size="large" color={COLORS.pink} />
        <Text style={styles.subtitle}>Loading characters…</Text>
      </View>
    );
  }

  if (writingQuestions.length === 0) {
    return (
      <View style={styles.centerRoot}>
        <Text style={styles.title}>{title} — Writing Practice</Text>
        <Text style={styles.subtitle}>No writing characters available yet.</Text>
        <Pressable style={styles.backLink} onPress={handleExit}>
          <Text style={styles.backLinkText}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  if (showComplete) {
    return (
      <PracticeCompleteScreen
        total={writingQuestions.length}
        description={`You've gone through all ${writingQuestions.length} ${title ?? ''} characters.`}
        onRestart={onRestart}
        onExit={handleExit}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>{title} — Writing Practice</Text>
      <Text style={styles.subtitle}>{index + 1} / {writingQuestions.length}</Text>

      {current && (
        <CanvasWritingQuiz
          question={current}
          workingAnswer={undefined}
          onChange={() => {}}
          disabled={false}
        />
      )}

      <View style={styles.navRow}>
        <Pressable style={styles.navBtn} onPress={previous} disabled={isFirst}>
          <Text style={styles.navBtnText}>← Previous</Text>
        </Pressable>
        <Pressable style={styles.navBtn} onPress={next}>
          <Text style={styles.navBtnText}>{isLast ? 'Finish' : 'Next →'}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backLink} onPress={handleExit}>
        <Text style={styles.backLinkText}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, paddingBottom: 40, backgroundColor: COLORS.bg },
  centerRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20, backgroundColor: COLORS.bg },
  title: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.deep, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkSoft },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  navBtn: { borderWidth: 1.5, borderColor: 'rgba(198,93,123,0.3)', borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  navBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '600', color: COLORS.plum },
  backLink: { marginTop: 4, paddingVertical: 6, paddingHorizontal: 10 },
  backLinkText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.plum, fontWeight: '600' },
});