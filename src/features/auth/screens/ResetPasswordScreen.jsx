import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../../../api/supabaseClient';

const COLORS = {
  bg: '#FBF6F4',
  card: '#FFFFFF',
  pink: '#C65D7B',
  pinkSoft: 'rgba(198,93,123,0.08)',
  border: '#E8C4CE',
  deep: '#3A2C33',
  inkSoft: '#8A6B72',
  error: '#B3261E',
  success: '#4F7A5B',
};

function PasswordField({ label, value, onChangeText, visible, onToggleVisible, placeholder }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="rgba(138,107,114,0.5)"
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleVisible} style={styles.eyeBtn} hitSlop={8}>
          <Text style={styles.eyeIcon}>{visible ? '🐵' : '🙈'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ResetPasswordScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const parseAndSetSession = async (url) => {
      if (!url) return;

      const hashPart = url.includes('#') ? url.split('#')[1] : '';
      const params = new URLSearchParams(hashPart);

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

  const cardWidth = isWide ? 440 : '100%';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoBar}>
        <Text style={styles.logoText}>⛩️ SakuraMastery</Text>
      </View>

      <View style={[styles.card, { width: cardWidth }]}>
        {success ? (
          <View style={styles.centerBlock}>
            <Text style={styles.title}>Password updated 🌸</Text>
            <Text style={styles.subtitle}>パスワードが更新されました</Text>
            <Text style={styles.helperText}>Taking you back to login...</Text>
          </View>
        ) : !sessionReady ? (
          <View style={styles.centerBlock}>
            <Text style={styles.title}>{error ? 'Link problem' : 'Verifying your link...'}</Text>
            <Text style={styles.subtitle}>
              {error ? 'リンクに問題があります' : '確認しています...'}
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {error ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.primaryBtnText}>Request a new link</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <>
            <Text style={styles.title}>Set a New Password</Text>
            <Text style={styles.subtitle}>新しいパスワードを設定</Text>

            <PasswordField
              label="New password"
              value={password}
              onChangeText={setPassword}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((v) => !v)}
              placeholder="Enter new password"
            />

            <PasswordField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisible={() => setShowConfirmPassword((v) => !v)}
              placeholder="Re-enter new password"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 48,
  },

  logoBar: {
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 28,
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deep,
  },

  card: {
    maxWidth: 440,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#3A2C33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },

  centerBlock: {
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.deep,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.pink,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: COLORS.inkSoft,
    textAlign: 'center',
    marginTop: 8,
  },

  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.deep,
    marginBottom: 6,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pinkSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.deep,
  },
  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  primaryBtn: {
    backgroundColor: COLORS.pink,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});