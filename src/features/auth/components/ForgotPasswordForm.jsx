import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useAuth from '../hooks/useAuth';

export default function ForgotPasswordForm({ onNavigateToLogin }) {
  const { forgotPassword, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit() {
    clearError();
    setFieldError('');

    if (!email.trim()) {
      setFieldError('Email is required.');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword({ email: email.trim() });
    setIsSubmitting(false);

    if (result.success) {
      setIsSent(true);
    }
  }

  if (isSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          If an account exists for {email.trim()}, a password reset link has been sent.
        </Text>
        <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 20 }}>
          <Text style={styles.switchText}>
            Back to <Text style={styles.linkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>パスワードを忘れた場合</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, fieldError && styles.inputError]}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {(!!fieldError || !!authError) && <Text style={styles.errorText}>{fieldError || authError}</Text>}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color="#7a3b4e" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNavigateToLogin} style={{ marginTop: 12 }}>
        <Text style={styles.switchText}>
          Back to <Text style={styles.linkBold}>Log in</Text>
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