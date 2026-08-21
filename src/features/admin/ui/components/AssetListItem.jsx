import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

export default function AssetListItem({ asset, onDelete, onCopyUrl }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: asset.publicUrl }} style={styles.thumb} resizeMode="cover" />
      <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => onCopyUrl(asset.publicUrl)}>
          <Text style={styles.actionText}>Copy URL</Text>
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(asset.name)}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: ADMIN_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ADMIN_COLORS.border,
    padding: 8,
    gap: 6,
  },
  thumb: { width: '100%', height: 100, borderRadius: 8, backgroundColor: ADMIN_COLORS.bg },
  name: { fontFamily: ADMIN_FONTS.body, fontSize: 11, color: ADMIN_COLORS.text },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, backgroundColor: ADMIN_COLORS.accentSoft, borderRadius: 6, paddingVertical: 5, alignItems: 'center' },
  actionText: { fontFamily: ADMIN_FONTS.body, fontSize: 10, fontWeight: '700', color: ADMIN_COLORS.text },
  deleteBtn: { backgroundColor: '#fdecea' },
  deleteText: { color: ADMIN_COLORS.danger },
});