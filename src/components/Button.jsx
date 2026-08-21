import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'outline'
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.outline,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.inkBold : COLORS.deep} />
      ) : (
        <Text style={variant === 'primary' ? styles.primaryText : styles.outlineText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm + 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: {
    backgroundColor: COLORS.actionPink, // #F5B7B1, on-brand per spec
    shadowColor: COLORS.deep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.pink,
  },
  disabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.inkBold,
  },
  outlineText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deep,
  },
});