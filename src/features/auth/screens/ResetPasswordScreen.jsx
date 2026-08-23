import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../../../api/supabaseClient';

export default function ResetPasswordScreen({ navigation }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const parseAndSetSession = async (url) => {
      if (!url) return;

      const hashPart = url.includes('#') ? url.split('#')[1] : '';
      const params = new URLSearchParams(hashPart);

      // Expired/invalid links arrive with error params instead of tokens —
      // show the real reason (e.g. "Email link is invalid or has expired")
      // rather than a generic message.
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');
      if (errorCode || errorDescription) {
        setError(
          errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'This reset link is invalid or has expired.'
        );
        return;
      }

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');

      if (type !== 'recovery' || !access_token || !refresh_token) {
        setError('This reset link is invalid or has expired.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        setError('This reset link is invalid or has expired.');
      } else {
        setSessionReady(true);
      }
    };

    Linking.getInitialURL().then(parseAndSetSession);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      parseAndSetSession(url);
    });

    return () => subscription.remove();
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setError('Password must be at least 8 characters and include 1 uppercase letter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 1800);
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Password updated 🌸</Text>
        <Text style={styles.subtitle}>Taking you back to login...</Text>
      </View>
    );
  }

  if (!sessionReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {error ? 'Link problem' : 'Verifying your reset link...'}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {error ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.buttonText}>Request a new link</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>

      <TextInput
        style={styles.input}
        placeholder="New password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6F4',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#C65D7B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8A6B72',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8C4CE',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  error: {
    color: '#B3261E',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C65D7B',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});