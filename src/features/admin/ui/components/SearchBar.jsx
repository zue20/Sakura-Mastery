import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../../dashboard/theme';

const ROSE = '#C65D7B';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <View style={styles.row}>
      <Ionicons name="search-outline" size={17} color={ROSE} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.inkSoft}
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          style={({ hovered, pressed }) => [styles.clearBtn, (hovered || pressed) && styles.clearBtnHover]}
        >
          <Ionicons name="close" size={15} color={COLORS.inkSoft} />
        </Pressable>
      )}
    </View>
  );
}

// Note: QuestionsPanel and UsersPanel already wrap SearchBar in a frosted
// container, so the bar itself has no outer margin and a lighter fill.
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.22)',
    paddingHorizontal: 12,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.inkBold,
    outlineStyle: 'none',
  },
  clearBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  clearBtnHover: { backgroundColor: 'rgba(198,93,123,0.12)' },
});