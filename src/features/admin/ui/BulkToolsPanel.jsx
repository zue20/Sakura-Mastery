import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Platform } from 'react-native';
import { questionsService } from '../../../api/questionsService';
import { logAction } from '../../../api/activityService';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';

export default function BulkToolsPanel({ onImportComplete }) {
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const allQuestions = await questionsService.getAll({});
      const json = JSON.stringify(allQuestions, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sakuramastery-questions-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setImportStatus({ type: 'error', message: 'Export currently only works on web.' });
      }
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport() {
    setImportStatus(null);

    let parsed;
    try {
      parsed = JSON.parse(importText);
    } catch (err) {
      setImportStatus({ type: 'error', message: 'Invalid JSON. Check for missing commas/brackets.' });
      return;
    }

    if (!Array.isArray(parsed)) {
      setImportStatus({ type: 'error', message: 'JSON must be an array of question objects.' });
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    const errors = [];

    for (const item of parsed) {
      try {
        await questionsService.create(item);
        successCount++;
      } catch (err) {
        errors.push(`"${item.prompt || item.id || 'unknown'}": ${err.message}`);
      }
    }

    setIsImporting(false);
    setImportStatus({
      type: errors.length === 0 ? 'success' : 'error',
      message: errors.length === 0
        ? `Successfully imported ${successCount} question${successCount !== 1 ? 's' : ''}.`
        : `Imported ${successCount}, failed ${errors.length}:\n${errors.join('\n')}`,
    });

    if (successCount > 0) {
      logAction({
        action: 'question_created',
        targetType: 'question',
        targetLabel: `bulk import: ${successCount} question${successCount !== 1 ? 's' : ''}`,
      });
      setImportText('');
      onImportComplete?.();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎋 Export</Text>
        <Text style={styles.sectionDesc}>Download all questions as a JSON file — useful as a backup.</Text>
        <Pressable style={styles.button} onPress={handleExport} disabled={isExporting}>
          <Text style={styles.buttonText}>{isExporting ? 'Exporting…' : 'Download JSON'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎋 Import</Text>
        <Text style={styles.sectionDesc}>
          Paste a JSON array of question objects to bulk-add them — faster than the form for adding lots of N4 content at once.
        </Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={10}
          placeholder='[{"type": "multipleChoice", "moduleType": "grammar", "level": "N4", "prompt": "...", ...}]'
          value={importText}
          onChangeText={setImportText}
        />
        <Pressable
          style={[styles.button, (!importText.trim() || isImporting) && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={!importText.trim() || isImporting}
        >
          <Text style={styles.buttonText}>{isImporting ? 'Importing…' : 'Import Questions'}</Text>
        </Pressable>

        {!!importStatus && (
          <View style={[styles.statusBox, importStatus.type === 'error' ? styles.statusError : styles.statusSuccess]}>
            <Text style={styles.statusText}>{importStatus.message}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  sectionTitle: { fontFamily: FONTS.body, fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  button: { backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, alignSelf: 'flex-start' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  textarea: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  statusBox: { borderRadius: 8, padding: 10, marginTop: 10 },
  statusSuccess: { backgroundColor: COLORS.accentSoft },
  statusError: { backgroundColor: '#fdecea' },
  statusText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.text },
});