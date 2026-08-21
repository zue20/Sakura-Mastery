import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import useAuth from '../features/auth/hooks/useAuth';

export default function LogoutButton({ style }) {
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    // No manual navigation needed — RootNavigator automatically swaps
    // to AuthStack once isAuthenticated becomes false.
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handleLogout}>
      <Text style={styles.text}>🚪 Log Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F2A6B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  text: {
    color: '#3a2a2f',
    fontWeight: '600',
    fontSize: 13,
  },
});