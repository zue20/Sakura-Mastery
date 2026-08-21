import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import useAdminSettings from '../hooks/useAdminSettings';
import AdminCard from './components/AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

export default function SettingsPanel() {
  const { settings, isLoading, error, isSaving, save } = useAdminSettings();

  const [announcementText, setAnnouncementText] = useState('');
  const [xpValue, setXpValue] = useState('10');
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    if (!settings) return;
    setAnnouncementText(settings.announcement?.text ?? '');
    setXpValue(String(settings.xp_per_correct ?? 10));
  }, [settings]);

  function flashSaved(key) {
    setSavedFlash(key);
    setTimeout(() => setSavedFlash(null), 1500);
  }

  async function handleToggleMaintenance(value) {
    await save('maintenance_mode', value);
    flashSaved('maintenance_mode');
  }

  async function handleToggleAnnouncement(value) {
    await save('announcement', { enabled: value, text: announcementText });
    flashSaved('announcement');
  }

  async function handleSaveAnnouncementText() {
    await save('announcement', { enabled: settings.announcement?.enabled ?? false, text: announcementText });
    flashSaved('announcement');
  }

  async function handleSaveXp() {
    const num = Number(xpValue);
    if (!Number.isFinite(num) || num < 0) return;
    await save('xp_per_correct', num);
    flashSaved('xp_per_correct');
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={ADMIN_COLORS.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load settings: {error.message}. Make sure the `app_settings` table exists.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.heading}>🪭🧧 Settings</Text>

      <AdminCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Maintenance Mode</Text>
            <Text style={styles.rowDesc}>When on, learners see a maintenance screen instead of the dashboard.</Text>
          </View>
          <Switch
            value={!!settings.maintenance_mode}
            onValueChange={handleToggleMaintenance}
            trackColor={{ true: ADMIN_COLORS.accent }}
          />
        </View>
        {savedFlash === 'maintenance_mode' && <Text style={styles.savedText}>Saved</Text>}
      </AdminCard>

      <AdminCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Announcement Banner</Text>
            <Text style={styles.rowDesc}>Shows a dismissible banner on the learner dashboard.</Text>
          </View>
          <Switch
            value={!!settings.announcement?.enabled}
            onValueChange={handleToggleAnnouncement}
            trackColor={{ true: ADMIN_COLORS.accent }}
          />
        </View>
        <TextInput
          style={styles.textInput}
          value={announcementText}
          onChangeText={setAnnouncementText}
          placeholder="e.g. New N4 kanji questions added this week!"
          multiline
        />
        <Pressable style={styles.saveBtn} onPress={handleSaveAnnouncementText} disabled={isSaving}>
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Text'}</Text>
        </Pressable>
        {savedFlash === 'announcement' && <Text style={styles.savedText}>Saved</Text>}
      </AdminCard>

      <AdminCard style={styles.card}>
        <Text style={styles.rowTitle}>XP per Correct Answer</Text>
        <Text style={styles.rowDesc}>Applies to future quiz attempts — doesn't retroactively change past scores.</Text>
        <View style={styles.xpRow}>
          <TextInput
            style={[styles.textInput, styles.xpInput]}
            value={xpValue}
            onChangeText={setXpValue}
            keyboardType="numeric"
          />
          <Pressable style={styles.saveBtn} onPress={handleSaveXp} disabled={isSaving}>
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
        {savedFlash === 'xp_per_correct' && <Text style={styles.savedText}>Saved</Text>}
      </AdminCard>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, color: ADMIN_COLORS.text, marginBottom: 16 },
  card: { marginBottom: 16, gap: 10 },
  centered: { padding: 40, alignItems: 'center' },
  errorText: { fontFamily: ADMIN_FONTS.body, color: ADMIN_COLORS.danger },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: ADMIN_FONTS.body, fontSize: 14, fontWeight: '700', color: ADMIN_COLORS.text },
  rowDesc: { fontFamily: ADMIN_FONTS.body, fontSize: 12, color: ADMIN_COLORS.textMuted, marginTop: 2 },
  textInput: {
    fontFamily: ADMIN_FONTS.body,
    fontSize: 13,
    color: ADMIN_COLORS.text,
    backgroundColor: ADMIN_COLORS.bg,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
  },
  xpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  xpInput: { width: 80 },
  saveBtn: { backgroundColor: ADMIN_COLORS.accent, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
  saveBtnText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  savedText: { fontFamily: ADMIN_FONTS.body, fontSize: 11, color: ADMIN_COLORS.accent, fontWeight: '700' },
});