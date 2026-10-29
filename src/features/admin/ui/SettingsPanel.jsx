import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAdminSettings from '../hooks/useAdminSettings';
import AdminCard from './components/AdminCard';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

const ROSE = '#C65D7B';

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
      <View style={[styles.stateCard, styles.stateCardError]}>
        <Ionicons name="alert-circle-outline" size={20} color={ADMIN_COLORS.danger} />
        <Text style={styles.errorText}>
          Couldn't load settings: {error.message}. Make sure the `app_settings` table exists.
        </Text>
      </View>
    );
  }

  const Saved = () => (
    <View style={styles.savedRow}>
      <Ionicons name="checkmark-circle" size={14} color="#3E8E5A" />
      <Text style={styles.savedText}>Saved</Text>
    </View>
  );

  return (
    <View>
      <View style={styles.headingPill}>
        <View style={styles.badgeSmall}>
          <Ionicons name="settings" size={14} color="#fff" />
        </View>
        <Text style={styles.heading}>Settings</Text>
      </View>

      <AdminCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.iconBadge}>
            <Ionicons name="construct-outline" size={20} color={ROSE} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Maintenance Mode</Text>
            <Text style={styles.rowDesc}>When on, learners see a maintenance screen instead of the dashboard.</Text>
          </View>
          <Switch
            value={!!settings.maintenance_mode}
            onValueChange={handleToggleMaintenance}
            trackColor={{ false: 'rgba(198,93,123,0.2)', true: ROSE }}
          />
        </View>
        {savedFlash === 'maintenance_mode' && <Saved />}
      </AdminCard>

      <AdminCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.iconBadge}>
            <Ionicons name="megaphone-outline" size={20} color={ROSE} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Announcement Banner</Text>
            <Text style={styles.rowDesc}>Shows a dismissible banner on the learner dashboard.</Text>
          </View>
          <Switch
            value={!!settings.announcement?.enabled}
            onValueChange={handleToggleAnnouncement}
            trackColor={{ false: 'rgba(198,93,123,0.2)', true: ROSE }}
          />
        </View>
        <TextInput
          style={styles.textInput}
          value={announcementText}
          onChangeText={setAnnouncementText}
          placeholder="e.g. New N4 kanji questions added this week!"
          placeholderTextColor={ADMIN_COLORS.textMuted}
          multiline
        />
        <Pressable
          style={({ hovered, pressed }) => [
            styles.saveBtn,
            (hovered || pressed) && !isSaving && styles.saveBtnHover,
            isSaving && styles.saveBtnDisabled,
          ]}
          onPress={handleSaveAnnouncementText}
          disabled={isSaving}
        >
          <Ionicons name="save-outline" size={15} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Text'}</Text>
        </Pressable>
        {savedFlash === 'announcement' && <Saved />}
      </AdminCard>

      <AdminCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.iconBadge}>
            <Ionicons name="flash-outline" size={20} color={ROSE} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>XP per Correct Answer</Text>
            <Text style={styles.rowDesc}>Applies to future quiz attempts — doesn't retroactively change past scores.</Text>
          </View>
        </View>
        <View style={styles.xpRow}>
          <TextInput
            style={[styles.textInput, styles.xpInput]}
            value={xpValue}
            onChangeText={setXpValue}
            keyboardType="numeric"
          />
          <Pressable
            style={({ hovered, pressed }) => [
              styles.saveBtn,
              (hovered || pressed) && !isSaving && styles.saveBtnHover,
              isSaving && styles.saveBtnDisabled,
            ]}
            onPress={handleSaveXp}
            disabled={isSaving}
          >
            <Ionicons name="save-outline" size={15} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
        {savedFlash === 'xp_per_correct' && <Saved />}
      </AdminCard>
    </View>
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
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, fontWeight: '700', color: ADMIN_COLORS.text, letterSpacing: 0.2 },

  card: {
    marginBottom: 16,
    gap: 14,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    ...glass,
  },
  centered: { padding: 40, alignItems: 'center' },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  stateCardError: { backgroundColor: '#fdecea', borderColor: 'rgba(192,57,43,0.25)' },
  errorText: { flex: 1, fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.danger },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(198,93,123,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: ADMIN_FONTS.body, fontSize: 15, fontWeight: '700', color: ADMIN_COLORS.text },
  rowDesc: { fontFamily: ADMIN_FONTS.body, fontSize: 12, lineHeight: 18, color: ADMIN_COLORS.textMuted, marginTop: 2 },

  textInput: {
    fontFamily: ADMIN_FONTS.body,
    fontSize: 13,
    color: ADMIN_COLORS.text,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.25)',
    borderRadius: 12,
    padding: 12,
    minHeight: 44,
  },
  xpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  xpInput: { width: 90 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: ROSE,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnHover: { opacity: 0.9 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },

  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  savedText: { fontFamily: ADMIN_FONTS.body, fontSize: 11, color: '#3E8E5A', fontWeight: '700' },
});