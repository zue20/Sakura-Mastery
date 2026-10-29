import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { updateUserRole } from '../../../api/profilesService';
import { logAction } from '../../../api/activityService';
import SearchBar from './components/SearchBar';
import { ADMIN_COLORS as COLORS, ADMIN_FONTS as FONTS } from '../theme';

const ROSE = '#C65D7B';

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
    return (
      <View style={styles.stateCard}>
        <Ionicons name="hourglass-outline" size={20} color={COLORS.textMuted} />
        <Text style={styles.loadingText}>Loading users…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.stateCard, styles.stateCardError]}>
        <Ionicons name="alert-circle-outline" size={20} color="#c0392b" />
        <View style={styles.errorTextWrap}>
          <Text style={styles.errorText}>
            Couldn't load users. Make sure the `profiles` table exists in Supabase (see setup SQL).
          </Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headingPill}>
          <View style={styles.badgeSmall}>
            <Ionicons name="people" size={14} color="#fff" />
          </View>
          <Text style={styles.heading}>Users</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search by name or email…" />
      </View>

      {visibleUsers.length === 0 ? (
        <View style={styles.stateCard}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No users match your search.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {visibleUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const isPending = pendingUserId === user.id;
            return (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{(user.name || user.email || '?')[0].toUpperCase()}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name || '(no name set)'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.userDate}>
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.roleZone}>
                  <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
                    <Ionicons
                      name={isAdmin ? 'shield-checkmark' : 'person'}
                      size={11}
                      color={isAdmin ? ROSE : COLORS.textMuted}
                    />
                    <Text style={[styles.roleBadgeText, isAdmin && styles.roleBadgeTextAdmin]}>
                      {isAdmin ? 'Admin' : 'User'}
                    </Text>
                  </View>
                  <Pressable
                    style={({ hovered, pressed }) => [
                      styles.roleToggleBtn,
                      (hovered || pressed) && !isPending && styles.roleToggleBtnHover,
                    ]}
                    disabled={isPending}
                    onPress={() => handleToggleRole(user)}
                  >
                    <Text style={styles.roleToggleText}>
                      {isPending ? '…' : isAdmin ? 'Remove admin' : 'Make admin'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
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
  countPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...glass,
  },
  countText: { fontFamily: FONTS.body, fontSize: 12, fontWeight: '600', color: COLORS.textMuted },

  searchWrap: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    marginBottom: 14,
    ...glass,
  },

  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  stateCardError: { backgroundColor: '#fdecea', borderColor: 'rgba(192,57,43,0.25)' },
  loadingText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  emptyText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  errorTextWrap: { flex: 1 },
  errorText: { fontFamily: FONTS.body, fontSize: 13, color: '#c0392b', marginBottom: 4 },
  errorDetail: { fontFamily: FONTS.body, fontSize: 11, color: '#c0392b', opacity: 0.7 },

  list: { maxHeight: 500 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    ...glass,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ROSE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: { fontWeight: '700', color: '#FFFFFF', fontSize: 17 },
  userInfo: { flex: 1 },
  userName: { fontFamily: FONTS.body, fontSize: 15, fontWeight: '700', color: COLORS.text },
  userEmail: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  userDate: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted },

  roleZone: { alignItems: 'flex-end', gap: 6 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  roleBadgeAdmin: { backgroundColor: 'rgba(198,93,123,0.14)' },
  roleBadgeText: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  roleBadgeTextAdmin: { color: ROSE },
  roleToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
  },
  roleToggleBtnHover: { backgroundColor: 'rgba(198,93,123,0.1)' },
  roleToggleText: { fontFamily: FONTS.body, fontSize: 11, color: ROSE, fontWeight: '700' },
});