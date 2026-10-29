import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminQuestions } from '../hooks/useAdminQuestions';
import QuestionListPanel from './QuestionListPanel';
import QuestionEditorForm from './QuestionEditorForm';
import ProgressTracker from './components/ProgressTracker';
import FilterGroup from './components/FilterGroup';
import SearchBar from './components/SearchBar';
import EmptyState from './components/EmptyState';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';
import { LEVEL_FILTERS, MODULE_FILTERS, SORT_OPTIONS } from '../constants';

const ROSE = '#C65D7B';

export default function QuestionsPanel() {
  const [levelFilter, setLevelFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mode, setMode] = useState('list');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showTracker, setShowTracker] = useState(true);

  const { questions: allQuestions, isLoading, addQuestion, updateQuestion, deleteQuestion } =
    useAdminQuestions({});

  const progressByLevel = useMemo(() => {
    const result = { N5: { total: 0, byModule: {} }, N4: { total: 0, byModule: {} } };
    allQuestions.forEach((q) => {
      const lvl = q.level;
      if (!result[lvl]) return;
      result[lvl].total += 1;
      result[lvl].byModule[q.moduleType] = (result[lvl].byModule[q.moduleType] || 0) + 1;
    });
    return result;
  }, [allQuestions]);

  const stats = useMemo(() => ({
    total: allQuestions.length,
    byModuleType: allQuestions.reduce((acc, q) => {
      acc[q.moduleType] = (acc[q.moduleType] || 0) + 1;
      return acc;
    }, {}),
  }), [allQuestions]);

  const visibleQuestions = useMemo(() => {
    let result = allQuestions;
    if (levelFilter !== 'All') result = result.filter((q) => q.level === levelFilter);
    if (moduleFilter !== 'All') result = result.filter((q) => q.moduleType === moduleFilter);

    const query = searchText.trim().toLowerCase();
    if (query) {
      result = result.filter((q) =>
        (q.prompt || '').toLowerCase().includes(query) ||
        (q.id || '').toLowerCase().includes(query)
      );
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'module':
        sorted.sort((a, b) => (a.moduleType || '').localeCompare(b.moduleType || ''));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    return sorted;
  }, [allQuestions, levelFilter, moduleFilter, searchText, sortBy]);

  const hasActiveFilters = levelFilter !== 'All' || moduleFilter !== 'All' || searchText.trim().length > 0;

  const clearAllFilters = useCallback(() => {
    setLevelFilter('All');
    setModuleFilter('All');
    setSearchText('');
  }, []);

  const handleAddNew = useCallback(() => {
    setActiveQuestion(null);
    setMode('creating');
  }, []);

  const handleEdit = useCallback((question) => {
    setActiveQuestion(question);
    setMode('editing');
  }, []);

  const handleCancel = useCallback(() => {
    setActiveQuestion(null);
    setMode('list');
  }, []);

  const handleSave = useCallback(async (questionData) => {
    if (mode === 'editing' && activeQuestion) {
      await updateQuestion(activeQuestion.id, questionData);
    } else {
      await addQuestion(questionData);
    }
    setActiveQuestion(null);
    setMode('list');
  }, [mode, activeQuestion, addQuestion, updateQuestion]);

  const confirmDelete = useCallback((question) => {
    const doDelete = () => deleteQuestion(question.id);
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${question.prompt}"? This cannot be undone.`)) doDelete();
      return;
    }
    Alert.alert('Delete question?', `"${question.prompt}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  }, [deleteQuestion]);

  const sortLabel = SORT_OPTIONS.find((s) => s.key === sortBy)?.label;
  const handleSortChange = (label) => {
    setSortBy(SORT_OPTIONS.find((s) => s.label === label)?.key || 'newest');
  };

  if (mode !== 'list') {
    return <QuestionEditorForm question={activeQuestion} onSave={handleSave} onCancel={handleCancel} />;
  }

  return (
    <>
      <View style={styles.headingPill}>
        <View style={styles.badgeSmall}>
          <Ionicons name="help-circle" size={15} color="#fff" />
        </View>
        <Text style={styles.heading}>Questions</Text>
      </View>

      <ProgressTracker progressByLevel={progressByLevel} expanded={showTracker} onToggle={() => setShowTracker((v) => !v)} />

      <View style={styles.statsRow}>
        <View style={styles.totalPill}>
          <Ionicons name="albums-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.statsText}>{stats.total} total questions</Text>
        </View>
        {Object.entries(stats.byModuleType).map(([type, count]) => (
          <Text key={type} style={styles.statsPill}>{type}: {count}</Text>
        ))}
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={searchText} onChange={setSearchText} />
      </View>

      <View style={styles.filterRow}>
        <FilterGroup label="Level" options={LEVEL_FILTERS} value={levelFilter} onChange={setLevelFilter} />
        <FilterGroup label="Module" options={MODULE_FILTERS} value={moduleFilter} onChange={setModuleFilter} />
        <FilterGroup label="Sort" options={SORT_OPTIONS.map((s) => s.label)} value={sortLabel} onChange={handleSortChange} />
      </View>

      <View style={styles.toolbar}>
        <Pressable
          style={({ hovered, pressed }) => [styles.addBtn, (hovered || pressed) && styles.addBtnHover]}
          onPress={handleAddNew}
        >
          <Ionicons name="add-circle-outline" size={17} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Question</Text>
        </Pressable>
        {hasActiveFilters && (
          <Pressable
            style={({ hovered, pressed }) => [styles.clearFiltersBtn, (hovered || pressed) && styles.clearFiltersBtnHover]}
            onPress={clearAllFilters}
          >
            <Ionicons name="close-circle-outline" size={15} color={ROSE} />
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <Ionicons name="hourglass-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : visibleQuestions.length === 0 ? (
        <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAllFilters} onAddNew={handleAddNew} />
      ) : (
        <QuestionListPanel questions={visibleQuestions} onEdit={handleEdit} onDelete={confirmDelete} />
      )}
    </>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  headingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    ...glass,
  },
  badgeSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ROSE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: FONTS.display, fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: 0.2 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' },
  totalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  statsText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  statsPill: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '600',
    color: ROSE,
    backgroundColor: 'rgba(198,93,123,0.14)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 11,
    overflow: 'hidden',
  },

  searchWrap: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    marginBottom: 12,
    ...glass,
  },
  filterRow: {
    gap: 10,
    marginBottom: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...glass,
  },

  toolbar: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ROSE,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  addBtnHover: { opacity: 0.9 },
  addBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  clearFiltersBtnHover: { backgroundColor: 'rgba(198,93,123,0.1)' },
  clearFiltersText: { fontFamily: FONTS.body, fontSize: 12, color: ROSE, fontWeight: '700' },

  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  loadingText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
});