import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useAdminQuestions } from '../hooks/useAdminQuestions';
import QuestionListPanel from './QuestionListPanel';
import QuestionEditorForm from './QuestionEditorForm';
import ProgressTracker from './components/ProgressTracker';
import FilterGroup from './components/FilterGroup';
import SearchBar from './components/SearchBar';
import EmptyState from './components/EmptyState';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';
import { LEVEL_FILTERS, MODULE_FILTERS, SORT_OPTIONS } from '../constants';

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
      <ProgressTracker progressByLevel={progressByLevel} expanded={showTracker} onToggle={() => setShowTracker((v) => !v)} />

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>{stats.total} total questions</Text>
        {Object.entries(stats.byModuleType).map(([type, count]) => (
          <Text key={type} style={styles.statsPill}>{type}: {count}</Text>
        ))}
      </View>

      <SearchBar value={searchText} onChange={setSearchText} />

      <View style={styles.filterRow}>
        <FilterGroup label="Level" options={LEVEL_FILTERS} value={levelFilter} onChange={setLevelFilter} />
        <FilterGroup label="Module" options={MODULE_FILTERS} value={moduleFilter} onChange={setModuleFilter} />
        <FilterGroup label="Sort" options={SORT_OPTIONS.map((s) => s.label)} value={sortLabel} onChange={handleSortChange} />
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.addBtn} onPress={handleAddNew}>
          <Text style={styles.addBtnText}>+ Add Question</Text>
        </Pressable>
        {hasActiveFilters && (
          <Pressable style={styles.clearFiltersBtn} onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading…</Text>
      ) : visibleQuestions.length === 0 ? (
        <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAllFilters} onAddNew={handleAddNew} />
      ) : (
        <QuestionListPanel questions={visibleQuestions} onEdit={handleEdit} onDelete={confirmDelete} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' },
  statsText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  statsPill: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.text, backgroundColor: COLORS.accentSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  filterRow: { gap: 10, marginBottom: 12 },
  toolbar: { flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  addBtn: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  addBtnText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  clearFiltersBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  clearFiltersText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.accent, fontWeight: '600', textDecorationLine: 'underline' },
  loadingText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
});