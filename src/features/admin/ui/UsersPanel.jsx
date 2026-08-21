import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { updateUserRole } from '../../../api/profilesService';
import { logAction } from '../../../api/activityService';
import SearchBar from './components/SearchBar';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';

export default function UsersPanel() {
  const { users, isLoading, error, refresh } = useAdminUsers();
  const [searchText, setSearchText] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);

  const visibleUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(query) ||
      (u.name || '').toLowerCase().includes(query)
    );
  }, [users, searchText]);

  async function handleToggleRole(user) {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const message = nextRole === 'admin'
      ? `Make ${user.email} an admin? They will get full access to this panel.`
      : `Remove admin access from ${user.email}?`;

    const doUpdate = async () => {
      setPendingUserId(user.id);
      try {
        await updateUserRole(user.id, nextRole);
        logAction({
          action: 'role_changed',
          targetType: 'user',
          targetLabel: `made ${user.email} ${nextRole}`,
        });
        await refresh();
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert(`Failed to update role: ${err.message}`);
        } else {
          Alert.alert('Failed to update role', err.message);
        }
      } finally {
        setPendingUserId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) doUpdate();
      return;
    }
    Alert.alert('Change role?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: doUpdate },
    ]);
  }

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading users…</Text>;
  }

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          Couldn't load users. Make sure the `profiles` table exists in Supabase (see setup SQL).
        </Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.countText}>{users.length} registered user{users.length !== 1 ? 's' : ''}</Text>
      <SearchBar value={searchText} onChange={setSearchText} placeholder="Search by name or email…" />

      {visibleUsers.length === 0 ? (
        <Text style={styles.emptyText}>No users match your search.</Text>
      ) : (
        <ScrollView style={styles.list}>
          {visibleUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{(user.name || user.email || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || '(no name set)'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userDate}>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.roleZone}>
                <View style={[styles.roleBadge, user.role === 'admin' && styles.roleBadgeAdmin]}>
                  <Text style={[styles.roleBadgeText, user.role === 'admin' && styles.roleBadgeTextAdmin]}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Text>
                </View>
                <Pressable
                  style={styles.roleToggleBtn}
                  disabled={pendingUserId === user.id}
                  onPress={() => handleToggleRole(user)}
                >
                  <Text style={styles.roleToggleText}>
                    {pendingUserId === user.id
                      ? '…'
                      : user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  countText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  loadingText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
  emptyText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 30 },
  errorBox: { backgroundColor: '#fdecea', borderRadius: 10, padding: 16 },
  errorText: { fontFamily: FONTS.body, fontSize: 13, color: '#c0392b', marginBottom: 4 },
  errorDetail: { fontFamily: FONTS.body, fontSize: 11, color: '#c0392b', opacity: 0.7 },
  list: { maxHeight: 500 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', color: '#FFFFFF', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontFamily: FONTS.body, fontSize: 14, fontWeight: '700', color: COLORS.text },
  userEmail: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted },
  userDate: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  roleZone: { alignItems: 'flex-end', gap: 6 },
  roleBadge: { backgroundColor: COLORS.border, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  roleBadgeAdmin: { backgroundColor: COLORS.accentSoft },
  roleBadgeText: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  roleBadgeTextAdmin: { color: COLORS.text },
  roleToggleBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  roleToggleText: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.accent, fontWeight: '600', textDecorationLine: 'underline' },
});