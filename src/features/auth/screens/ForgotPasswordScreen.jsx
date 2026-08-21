import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.background}>
      <Text style={styles.petal1}>🌸</Text>
      <Text style={styles.petal2}>🌸</Text>
      <Text style={styles.petal3}>🌸</Text>
      <Text style={styles.petal4}>🌸</Text>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>⛩️</Text>
            <Text style={styles.logoText}>SakuraMastery</Text>
          </View>

          <View style={styles.card}>
            <ForgotPasswordForm onNavigateToLogin={() => navigation.navigate('Login')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#FDEEF3' },
  overlay: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoEmoji: { fontSize: 20, marginRight: 8 },
  logoText: { fontSize: 20, fontWeight: '700', color: '#3a2a2f', fontFamily: 'serif' },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    shadowColor: '#D9748F',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  petal1: { position: 'absolute', top: 40, left: 24, fontSize: 28, opacity: 0.5 },
  petal2: { position: 'absolute', top: 100, right: 40, fontSize: 20, opacity: 0.4 },
  petal3: { position: 'absolute', bottom: 60, left: 50, fontSize: 24, opacity: 0.35 },
});