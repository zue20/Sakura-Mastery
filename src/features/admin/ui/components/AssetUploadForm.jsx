import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ADMIN_COLORS, ADMIN_FONTS } from '../../theme';

export default function AssetUploadForm({ onUpload, isUploading }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    onUpload(file).catch((err) => setError(err.message));
    e.target.value = '';
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]}
        onPress={() => !isUploading && inputRef.current?.click()}
      >
        <Text style={styles.uploadBtnText}>{isUploading ? 'Uploading…' : '+ Upload Image'}</Text>
      </Pressable>
      {/* Native <input> for web — this admin panel is web-only, so no RN Platform check needed */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  uploadBtn: {
    backgroundColor: ADMIN_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  uploadBtnDisabled: { opacity: 0.5 },
  uploadBtnText: { fontFamily: ADMIN_FONTS.body, fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  errorText: { fontFamily: ADMIN_FONTS.body, fontSize: 12, color: ADMIN_COLORS.danger, marginTop: 8 },
});