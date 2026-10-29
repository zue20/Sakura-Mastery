import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAdminAssets from '../hooks/useAdminAssets';
import AssetUploadForm from './components/AssetUploadForm';
import AssetListItem from './components/AssetListItem';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

const ROSE = '#C65D7B';

const BUCKET_TABS = [
  { key: 'vocab', label: 'Vocabulary Images', icon: 'book-outline' },
  { key: 'speaking', label: 'Speaking Images', icon: 'mic-outline' },
];

export default function AssetsPanel() {
  const [bucketKey, setBucketKey] = useState('vocab');
  const { assets, isLoading, error, isUploading, upload, remove } = useAdminAssets(bucketKey);

  function handleCopyUrl(url) {
    navigator.clipboard?.writeText(url);
  }

  function handleDelete(fileName) {
    if (window.confirm(`Delete "${fileName}"? This cannot be undone.`)) {
      remove(fileName).catch((err) => window.alert(`Failed to delete: ${err.message}`));
    }
  }

  return (
    <View>
      <View style={styles.headingPill}>
        <View style={styles.badgeSmall}>
          <Ionicons name="images" size={14} color="#fff" />
        </View>
        <Text style={styles.heading}>Assets</Text>
      </View>

      <View style={styles.bucketTabs}>
        {BUCKET_TABS.map((tab) => {
          const active = bucketKey === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setBucketKey(tab.key)}
              style={({ hovered, pressed }) => [
                styles.bucketTab,
                (hovered || pressed) && !active && styles.bucketTabHover,
                active && styles.bucketTabActive,
              ]}
            >
              <Ionicons name={tab.icon} size={14} color={active ? '#FFFFFF' : ROSE} />
              <Text style={[styles.bucketTabText, active && styles.bucketTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AssetUploadForm onUpload={upload} isUploading={isUploading} />

      {isLoading ? (
        <ActivityIndicator color={ADMIN_COLORS.accent} style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={[styles.stateCard, styles.stateCardError]}>
          <Ionicons name="alert-circle-outline" size={20} color={ADMIN_COLORS.danger} />
          <Text style={styles.errorText}>Couldn't load assets: {error.message}</Text>
        </View>
      ) : assets.length === 0 ? (
        <View style={styles.stateCard}>
          <Ionicons name="image-outline" size={20} color={ADMIN_COLORS.textMuted} />
          <Text style={styles.emptyText}>No images in this bucket yet.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.gridContent}>
          {assets.map((asset) => (
            <AssetListItem
              key={asset.name}
              asset={asset}
              onDelete={handleDelete}
              onCopyUrl={handleCopyUrl}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' },
  default: {},
});

const styles = StyleSheet.create({
  headingPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    ...glass,
  },
  badgeSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ROSE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, fontWeight: '700', color: ADMIN_COLORS.text, letterSpacing: 0.2 },

  bucketTabs: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    padding: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    ...glass,
  },
  bucketTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  bucketTabHover: { backgroundColor: 'rgba(198,93,123,0.08)' },
  bucketTabActive: {
    backgroundColor: ROSE,
    shadowColor: ROSE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bucketTabText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, fontWeight: '700', color: ADMIN_COLORS.text },
  bucketTabTextActive: { color: '#FFFFFF' },

  scrollArea: { maxHeight: 640, marginTop: 16 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },

  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    ...glass,
  },
  stateCardError: { backgroundColor: '#fdecea', borderColor: 'rgba(192,57,43,0.25)' },
  emptyText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.textMuted },
  errorText: { flex: 1, fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.danger },
});