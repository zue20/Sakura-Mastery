import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme';
import LogoutButton from '../components/LogoutButton';

export default function MaintenanceScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.icon}>👺👹</Text>
      <Text style={styles.title}>Under Maintenance</Text>
      <Text style={styles.body}>
        SakuraMastery is temporarily down for updates. Please check back shortly.
      </Text>
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: COLORS.bg, padding: 24 },
  icon: { fontSize: 48 },
  title: { fontFamily: FONTS.display, fontSize: 22, fontWeight: '700', color: COLORS.deep },
  body: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.inkSoft, textAlign: 'center', maxWidth: 320 },
});