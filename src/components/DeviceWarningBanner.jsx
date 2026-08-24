import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../features/dashboard/theme'; // adjust path to match your project

export default function DeviceWarningBanner({ message, onPress, actionLabel = 'Tap to retry' }) {
  if (!message) return null;

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper onPress={onPress} style={styles.banner}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.textWrap}>
        <Text style={styles.message}>{message}</Text>
        {!!onPress && <Text style={styles.action}>{actionLabel}</Text>}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(216,162,90,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(216,162,90,0.4)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  icon: { fontSize: 16 },
  textWrap: { flex: 1 },
  message: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.deep, lineHeight: 16 },
  action: { fontFamily: FONTS.body, fontSize: 11, fontWeight: '700', color: COLORS.plum, marginTop: 2 },
});