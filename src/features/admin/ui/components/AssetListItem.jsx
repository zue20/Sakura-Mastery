import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

const ROSE = '#C65D7B';

export default function AssetListItem({ asset, onDelete, onCopyUrl }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: asset.publicUrl }} style={styles.thumb} resizeMode="cover" />
      <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
      <View style={styles.actions}>
        <Pressable
          style={({ hovered, pressed }) => [styles.actionBtn, (hovered || pressed) && styles.actionBtnHover]}
          onPress={() => onCopyUrl(asset.publicUrl)}
        >
          <Ionicons name="copy-outline" size={12} color={ROSE} />
          <Text style={styles.actionText}>Copy URL</Text>
        </Pressable>
        <Pressable
          style={({ hovered, pressed }) => [
            styles.actionBtn,
            styles.deleteBtn,
            (hovered || pressed) && styles.deleteBtnHover,
          ]}
          onPress={() => onDelete(asset.name)}
        >
          <Ionicons name="trash-outline" size={12} color={ADMIN_COLORS.danger} />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    gap: 8,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    ...glass,
  },
  thumb: { width: '100%', height: 110, borderRadius: 12, backgroundColor: 'rgba(198,93,123,0.06)' },
  name: { fontFamily: ADMIN_FONTS.body, fontSize: 11, fontWeight: '600', color: ADMIN_COLORS.text, paddingHorizontal: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 999,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(198,93,123,0.35)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  actionBtnHover: { backgroundColor: 'rgba(198,93,123,0.12)' },
  actionText: { fontFamily: ADMIN_FONTS.body, fontSize: 10, fontWeight: '700', color: ROSE },
  deleteBtn: { borderColor: 'rgba(217,83,79,0.35)' },
  deleteBtnHover: { backgroundColor: 'rgba(217,83,79,0.12)' },
  deleteText: { color: ADMIN_COLORS.danger },
});