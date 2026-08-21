import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import useAdminAssets from '../hooks/useAdminAssets';
import AssetUploadForm from './components/AssetUploadForm';
import AssetListItem from './components/AssetListItem';
import { ADMIN_COLORS, ADMIN_FONTS } from '../theme';

const BUCKET_TABS = [
  { key: 'vocab', label: 'Vocabulary Images' },
  { key: 'speaking', label: 'Speaking Images' },
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
      <Text style={styles.heading}>🎋 Assets</Text>

      <View style={styles.bucketTabs}>
        {BUCKET_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setBucketKey(tab.key)}
            style={[styles.bucketTab, bucketKey === tab.key && styles.bucketTabActive]}
          >
            <Text style={[styles.bucketTabText, bucketKey === tab.key && styles.bucketTabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <AssetUploadForm onUpload={upload} isUploading={isUploading} />

      {isLoading ? (
        <ActivityIndicator color={ADMIN_COLORS.accent} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>Couldn't load assets: {error.message}</Text>
      ) : assets.length === 0 ? (
        <Text style={styles.emptyText}>No images in this bucket yet.</Text>
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

const styles = StyleSheet.create({
  heading: { fontFamily: ADMIN_FONTS.display, fontSize: 20, color: ADMIN_COLORS.text, marginBottom: 16 },
  bucketTabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  bucketTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: ADMIN_COLORS.accentSoft },
  bucketTabActive: { backgroundColor: ADMIN_COLORS.accent },
  bucketTabText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, fontWeight: '700', color: ADMIN_COLORS.text },
  bucketTabTextActive: { color: '#FFFFFF' },
  scrollArea: { maxHeight: 640 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emptyText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.textMuted, marginTop: 20 },
  errorText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, color: ADMIN_COLORS.danger, marginTop: 20 },
});