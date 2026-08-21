import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useAuth from '../hooks/useAuth';

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  return null;
}

export default function SignupForm({ onNavigateToLogin }) {
  const { signup, error: authError, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    clearError();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await signup({ name: name.trim(), email: email.trim(), password });
    setIsSubmitting(false);

    if (!result.success) {
      setFieldErrors({ form: result.error });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>新規登録</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
  style={[styles.input, fieldErrors.name && styles.inputError]}
  placeholder="Your name"
  autoComplete="nope-name-field"
  textContentType="none"
  value={name}
  onChangeText={setName}
/>
      {!!fieldErrors.name && <Text style={styles.errorText}>{fieldErrors.name}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, fieldErrors.email && styles.inputError]}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {!!fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, styles.passwordInput, fieldErrors.password && styles.inputError]}
          placeholder="At least 8 characters, 1 uppercase"
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
          <Text style={styles.eyeIcon}>{showPassword ? '🐵' : '🙈'}</Text>
        </TouchableOpacity>
      </View>
      {!!fieldErrors.password && <Text style={styles.errorText}>{fieldErrors.password}</Text>}

      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, styles.passwordInput, fieldErrors.confirmPassword && styles.inputError]}
          placeholder="Re-enter your password"
          secureTextEntry={!showConfirmPassword}
          autoComplete="password-new"
          textContentType="newPassword"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
          <Text style={styles.eyeIcon}>{showPassword ? '🐵' : '🙈'}</Text>
        </TouchableOpacity>
      </View>
      {!!fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}

      {(!!fieldErrors.form || !!authError) && (
        <Text style={styles.errorText}>{fieldErrors.form || authError}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color="#7a3b4e" /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 12 }}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.linkBold}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400, alignSelf: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: '#3a2a2f' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#c97b93', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: '#3a2a2f' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 44 },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4,
  },
  eyeIcon: { fontSize: 17 },
  inputError: { borderColor: '#c0392b' },
  errorText: { color: '#c0392b', fontSize: 12, marginBottom: 10 },
  button: {
    backgroundColor: '#F2A6B0',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontWeight: '700', color: '#3a2a2f', fontSize: 16 },
  switchText: { textAlign: 'center', fontSize: 13, color: '#555' },
  linkBold: { color: '#c97b93', fontWeight: '700' },
});