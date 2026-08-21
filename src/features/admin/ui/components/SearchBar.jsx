import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../dashboard/theme';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} style={styles.clearBtn}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.2)',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  icon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontFamily: FONTS.body, fontSize: 13, color: COLORS.inkBold, outlineStyle: 'none' },
  clearBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  clearText: { fontSize: 13, color: COLORS.inkSoft },
});