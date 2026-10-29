import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { questionsService } from '../../../api/questionsService';
import { logAction } from '../../../api/activityService';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';

const ROSE = '#C65D7B';

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

  const importDisabled = !importText.trim() || isImporting;

  return (
    <View style={styles.container}>
      <View style={styles.headingPill}>
        <View style={styles.badgeSmall}>
          <Ionicons name="layers" size={14} color="#fff" />
        </View>
        <Text style={styles.heading}>Bulk Tools</Text>
      </View>

      {/* Export */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.badge}>
            <Ionicons name="download-outline" size={18} color={ROSE} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Export</Text>
            <Text style={styles.sectionDesc}>Download all questions as a JSON file — useful as a backup.</Text>
          </View>
        </View>
        <Pressable
          style={({ hovered, pressed }) => [
            styles.button,
            (hovered || pressed) && !isExporting && styles.buttonHover,
            isExporting && styles.buttonDisabled,
          ]}
          onPress={handleExport}
          disabled={isExporting}
        >
          <Ionicons name="cloud-download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>{isExporting ? 'Exporting…' : 'Download JSON'}</Text>
        </Pressable>
      </View>

      {/* Import */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.badge}>
            <Ionicons name="cloud-upload-outline" size={18} color={ROSE} />
          </View>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Import</Text>
            <Text style={styles.sectionDesc}>
              Paste a JSON array of question objects to bulk-add them — faster than the form for adding lots of N4 content at once.
            </Text>
          </View>
        </View>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={10}
          placeholder='[{"type": "multipleChoice", "moduleType": "grammar", "level": "N4", "prompt": "...", ...}]'
          placeholderTextColor={COLORS.textMuted}
          value={importText}
          onChangeText={setImportText}
        />
        <Pressable
          style={({ hovered, pressed }) => [
            styles.button,
            (hovered || pressed) && !importDisabled && styles.buttonHover,
            importDisabled && styles.buttonDisabled,
          ]}
          onPress={handleImport}
          disabled={importDisabled}
        >
          <Ionicons name="arrow-up-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>{isImporting ? 'Importing…' : 'Import Questions'}</Text>
        </Pressable>

        {!!importStatus && (
          <View style={[styles.statusBox, importStatus.type === 'error' ? styles.statusError : styles.statusSuccess]}>
            <Ionicons
              name={importStatus.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
              size={18}
              color={importStatus.type === 'error' ? COLORS.danger : '#3E8E5A'}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{importStatus.message}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  container: { gap: 18 },

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

  section: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    ...glass,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  sectionHeaderText: { flex: 1 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(198,93,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontFamily: FONTS.body, fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  sectionDesc: { fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, color: COLORS.textMuted },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: ROSE,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonHover: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },

  textarea: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
    padding: 14,
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.text,
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: 14,
  },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
  },
  statusSuccess: { backgroundColor: 'rgba(127,169,138,0.16)', borderColor: 'rgba(62,142,90,0.3)' },
  statusError: { backgroundColor: '#fdecea', borderColor: 'rgba(192,57,43,0.25)' },
  statusIcon: { marginTop: 1 },
  statusText: { flex: 1, fontFamily: FONTS.body, fontSize: 12, lineHeight: 18, color: COLORS.text },
});