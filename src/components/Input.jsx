import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

// Lightweight eye icon using text glyphs so no icon library dependency is required.
// Swap for @expo/vector-icons <Ionicons name="eye" /> / "eye-off" if you already use it.
function EyeIcon({ visible }) {
  return <Text style={styles.eyeGlyph}>{visible ? '🙈' : '👁️'}</Text>;
}

export default function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  editable = true,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showError = touched && !!error;
  const isPasswordField = secureTextEntry;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          showError && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.inkSoft}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((v) => !v)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon visible={isPasswordVisible} />
          </TouchableOpacity>
        )}
      </View>

      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.body,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkBold,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: SPACING.md,
  },
  inputContainerFocused: {
    borderColor: COLORS.pink,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.ink,
    paddingVertical: SPACING.sm + 4,
  },
  eyeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  eyeGlyph: { fontSize: 18 },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});